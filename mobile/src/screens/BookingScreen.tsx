/*
 * Ce fichier declare l'ecran de reservation mobile GarageFlow.
 * Il existe pour choisir un vehicule, une date, un creneau et creer un rendez-vous.
 * Il communique avec garageApi.ts, vehicleApi.ts et appointmentApi.ts.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createAppointment } from '../api/appointmentApi';
import { getAvailableSlots } from '../api/garageApi';
import { getVehicles } from '../api/vehicleApi';
import { MobileHeader } from '../components/common/MobileHeader';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { FormSection } from '../components/layout/FormSection';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppButton } from '../components/ui/AppButton';
import { AppInput } from '../components/ui/AppInput';
import { AppSelect } from '../components/ui/AppSelect';
import { DateInput } from '../components/ui/DateInput';
import type { GaragesStackParamList } from '../navigation/GaragesStackNavigator';
import type { AvailableSlot } from '../types/garage';
import type { Vehicle } from '../types/vehicle';
import { colors, shadows, spacing, typography } from '../utils/theme';

type BookingScreenProps = NativeStackScreenProps<GaragesStackParamList, 'Booking'>;

interface NormalizedSlot { dateDebut: string; label: string; }

/** Cette fonction verifie qu'une valeur peut vraiment devenir une date exploitable. */
function isValidDateTime(value?: string | null): value is string {
  return typeof value === 'string' && value.trim().length > 0 && Number.isFinite(new Date(value).getTime());
}

/** Cette fonction recupere la vraie date de debut renvoyee par l'API de disponibilite. */
function slotStart(slot: AvailableSlot): string | null {
  if (isValidDateTime(slot.dateDebut)) return slot.dateDebut;
  if (isValidDateTime(slot.startAt)) return slot.startAt;
  if (isValidDateTime(slot.dateHeure)) return slot.dateHeure;
  return null;
}

/** Cette fonction affiche seulement l'heure du creneau pour eviter les dates illisibles. */
function formatSlotLabel(dateDebut: string, dateFin?: string | null): string {
  const start = new Date(dateDebut);
  const startLabel = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(start);
  if (!isValidDateTime(dateFin)) return startLabel;
  const endLabel = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(dateFin));
  return `${startLabel} - ${endLabel}`;
}

/** Cette fonction transforme les creneaux backend en options propres pour l'interface. */
export function normalizeAvailableSlots(slots: AvailableSlot[]): NormalizedSlot[] {
  return slots.reduce<NormalizedSlot[]>((items, slot) => {
    const dateDebut = slotStart(slot);
    if (!dateDebut) return items;
    items.push({ dateDebut, label: slot.label ?? formatSlotLabel(dateDebut, slot.dateFin ?? slot.endAt) });
    return items;
  }, []);
}

/** Cet ecran orchestre le parcours simple de demande de rendez-vous client. */
export function BookingScreen({ navigation, route }: BookingScreenProps) {
  const { garageId, serviceId, serviceName } = route.params;
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [vehicleId, setVehicleId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slotValue, setSlotValue] = useState('');
  const [commentaireClient, setCommentaireClient] = useState('');
  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { getVehicles().then(setVehicles).catch((exception: Error) => setError(exception.message)).finally(() => setLoading(false)); }, []);

  async function handleLoadSlots() {
    try {
      setSlotLoading(true);
      setError(null);
      setSlotsLoaded(false);
      const loadedSlots = await getAvailableSlots(garageId, serviceId, date);
      setSlots(loadedSlots);
      setSlotValue('');
      setSlotsLoaded(true);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Impossible de charger les creneaux.');
    } finally {
      setSlotLoading(false);
    }
  }

  async function handleCreateAppointment() {
    if (vehicles.length === 0) { setError('Ajoutez un vehicule avant de reserver.'); return; }
    if (!vehicleId) { setError('Veuillez selectionner un vehicule.'); return; }
    if (!slotValue) { setError('Veuillez selectionner un creneau.'); return; }
    try {
      setSaving(true);
      setError(null);
      await createAppointment({ garageId, serviceId, vehicleId: Number(vehicleId), dateDebut: slotValue, commentaireClient: commentaireClient.trim() || null });
      setSuccess('Demande de rendez-vous creee.');
      setTimeout(() => navigation.getParent()?.navigate('Appointments' as never), 300);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Impossible de creer le rendez-vous.');
    } finally {
      setSaving(false);
    }
  }

  const vehicleOptions = vehicles.map((vehicle) => ({ value: String(vehicle.id), label: `${vehicle.marque} ${vehicle.modele}` }));
  const slotOptions = useMemo(() => normalizeAvailableSlots(slots), [slots]);
  const canShowForm = !loading && vehicles.length > 0;

  return (
    <ScreenContainer>
      <MobileHeader showBack title="Reservation" subtitle="GarageFlow" onBack={() => navigation.goBack()} />
      <View style={styles.summaryCard}>
        <Text style={styles.eyebrow}>Garage #{garageId}</Text>
        <Text style={styles.serviceTitle}>{serviceName}</Text>
        <Text style={styles.helper}>Choisissez votre vehicule, une date puis un creneau disponible.</Text>
      </View>
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      {!loading && vehicles.length === 0 ? <EmptyState title="Aucun vehicule" message="Ajoutez un vehicule avant de reserver." /> : null}
      {canShowForm ? (
        <>
          <FormSection title="1. Choisir vehicule">
            <AppSelect label="Vehicule" value={vehicleId} options={vehicleOptions} onChange={setVehicleId} />
          </FormSection>
          <FormSection title="2. Choisir date et creneau">
            <DateInput label="Date" value={date} onChangeText={setDate} />
            <AppButton loading={slotLoading} onPress={() => void handleLoadSlots()}>Charger les creneaux</AppButton>
            {slotsLoaded && slotOptions.length === 0 ? <Text style={styles.emptySlots}>Aucun creneau disponible pour cette date.</Text> : null}
            {slotOptions.length > 0 ? (
              <View style={styles.slotsGrid}>
                {slotOptions.map((slot) => {
                  const selected = slotValue === slot.dateDebut;
                  return (
                    <Pressable accessibilityRole="button" key={slot.dateDebut} onPress={() => setSlotValue(slot.dateDebut)} style={[styles.slotChip, selected && styles.slotChipSelected]}>
                      <Text style={[styles.slotText, selected && styles.slotTextSelected]}>{slot.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </FormSection>
          <FormSection title="3. Commentaire optionnel">
            <AppInput label="Commentaire" value={commentaireClient} onChangeText={setCommentaireClient} />
          </FormSection>
          <AppButton loading={saving} onPress={() => void handleCreateAppointment()}>Confirmer RDV</AppButton>
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  emptySlots: { color: colors.muted, fontSize: typography.body },
  eyebrow: { color: colors.primary, fontSize: typography.secondary, fontWeight: '900' },
  helper: { color: colors.muted, fontSize: typography.secondary, lineHeight: 18 },
  serviceTitle: { color: colors.text, fontSize: typography.sectionTitle, fontWeight: '900' },
  slotChip: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, minWidth: 82, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  slotChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotText: { color: colors.text, fontSize: typography.body, fontWeight: '800', textAlign: 'center' },
  slotTextSelected: { color: '#fff' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  success: { color: colors.success, fontWeight: '700' },
  summaryCard: { ...shadows.card, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: spacing.xs, padding: spacing.md },
});
