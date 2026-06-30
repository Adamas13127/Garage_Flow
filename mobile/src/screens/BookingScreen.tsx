/*
 * Ce fichier declare l'ecran de reservation mobile GarageFlow.
 * Il existe pour choisir un vehicule, une date guidee, un creneau et creer un rendez-vous.
 * Il communique avec garageApi.ts, vehicleApi.ts et appointmentApi.ts.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import type { GaragesStackParamList } from '../navigation/GaragesStackNavigator';
import type { AvailableSlot } from '../types/garage';
import type { Vehicle } from '../types/vehicle';
import { colors, shadows, spacing, typography } from '../utils/theme';

type BookingScreenProps = NativeStackScreenProps<GaragesStackParamList, 'Booking'>;
type SlotPeriod = 'morning' | 'afternoon' | 'evening';

interface NormalizedSlot { dateDebut: string; label: string; endLabel?: string; period: SlotPeriod; }
interface DateChoice { date: string; dayLabel: string; dateLabel: string; }
interface SlotGroup { key: SlotPeriod; title: string; items: NormalizedSlot[]; }

/** Cette fonction formate une date locale pour l'envoyer au backend au format YYYY-MM-DD. */
function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Cette fonction construit les prochains jours cliquables pour eviter une saisie manuelle. */
export function buildDateChoices(count = 14, from = new Date()): DateChoice[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(from);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + index);
    const dayLabel = index === 0 ? 'Aujourd hui' : index === 1 ? 'Demain' : new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date).replace('.', '');
    const dateLabel = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(date).replace('.', '');
    return { date: toDateInputValue(date), dayLabel, dateLabel };
  });
}

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

/** Cette fonction convertit une date de creneau en heure lisible pour le client. */
function formatSlotTime(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

/** Cette fonction classe un creneau dans le moment de journee adapte. */
function slotPeriod(dateDebut: string): SlotPeriod {
  const hour = new Date(dateDebut).getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

/** Cette fonction affiche seulement l'heure du creneau pour eviter les dates illisibles. */
function formatSlotLabel(dateDebut: string, dateFin?: string | null): { endLabel?: string; label: string } {
  const startLabel = formatSlotTime(dateDebut);
  if (!isValidDateTime(dateFin)) return { label: startLabel };
  const endLabel = formatSlotTime(dateFin);
  return { endLabel, label: `${startLabel} - ${endLabel}` };
}

/** Cette fonction transforme les creneaux backend en options propres pour l'interface. */
export function normalizeAvailableSlots(slots: AvailableSlot[]): NormalizedSlot[] {
  return slots.reduce<NormalizedSlot[]>((items, slot) => {
    const dateDebut = slotStart(slot);
    if (!dateDebut) return items;
    const labels = formatSlotLabel(dateDebut, slot.dateFin ?? slot.endAt);
    items.push({ dateDebut, endLabel: labels.endLabel, label: slot.label ?? labels.label, period: slotPeriod(dateDebut) });
    return items;
  }, []);
}

/** Cette fonction regroupe les creneaux pour que la liste ressemble a un agenda mobile. */
export function groupSlotsByPeriod(slots: NormalizedSlot[]): SlotGroup[] {
  const groups: SlotGroup[] = [
    { key: 'morning', title: 'Matin', items: slots.filter((slot) => slot.period === 'morning') },
    { key: 'afternoon', title: 'Apres-midi', items: slots.filter((slot) => slot.period === 'afternoon') },
    { key: 'evening', title: 'Soir', items: slots.filter((slot) => slot.period === 'evening') },
  ];
  return groups.filter((group) => group.items.length > 0);
}

/** Cet ecran orchestre le parcours simple de demande de rendez-vous client. */
export function BookingScreen({ navigation, route }: BookingScreenProps) {
  const { garageId, serviceId, serviceName } = route.params;
  const dateChoices = useMemo(() => buildDateChoices(), []);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [vehicleId, setVehicleId] = useState('');
  const [date, setDate] = useState(dateChoices[0]?.date ?? toDateInputValue(new Date()));
  const [slotValue, setSlotValue] = useState('');
  const [commentaireClient, setCommentaireClient] = useState('');
  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { getVehicles().then(setVehicles).catch((exception: Error) => setError(exception.message)).finally(() => setLoading(false)); }, []);

  const loadSlotsForDate = useCallback(async (selectedDate: string) => {
    try {
      setSlotLoading(true);
      setError(null);
      setSlotsLoaded(false);
      const loadedSlots = await getAvailableSlots(garageId, serviceId, selectedDate);
      setSlots(loadedSlots);
      setSlotValue('');
      setSlotsLoaded(true);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Impossible de charger les creneaux.');
    } finally {
      setSlotLoading(false);
    }
  }, [garageId, serviceId]);

  useEffect(() => {
    if (!loading && vehicles.length > 0) void loadSlotsForDate(date);
  }, [date, loadSlotsForDate, loading, vehicles.length]);

  function handleSelectDate(selectedDate: string) {
    setDate(selectedDate);
    setSlots([]);
    setSlotValue('');
    setSlotsLoaded(false);
  }

  function handleNextDay() {
    const currentIndex = dateChoices.findIndex((choice) => choice.date === date);
    const nextChoice = dateChoices[currentIndex + 1];
    if (nextChoice) handleSelectDate(nextChoice.date);
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
  const slotGroups = useMemo(() => groupSlotsByPeriod(slotOptions), [slotOptions]);
  const canShowForm = !loading && vehicles.length > 0;
  const selectedDateIndex = dateChoices.findIndex((choice) => choice.date === date);
  const isTodaySelected = selectedDateIndex === 0;
  const canGoNextDay = selectedDateIndex >= 0 && selectedDateIndex < dateChoices.length - 1;
  const emptySlotMessage = isTodaySelected ? 'Aucun creneau restant aujourd hui.' : 'Aucun creneau disponible pour cette date.';
  const canConfirm = Boolean(vehicleId && slotValue);

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
      {!loading && vehicles.length === 0 ? <><EmptyState title="Aucun vehicule" message="Ajoutez un vehicule avant de reserver." /><AppButton variant="secondary" onPress={() => navigation.getParent()?.navigate('Vehicles' as never)}>Ajouter un vehicule</AppButton></> : null}
      {canShowForm ? (
        <>
          <FormSection title="1. Choisir vehicule">
            <AppSelect label="Vehicule" value={vehicleId} options={vehicleOptions} onChange={setVehicleId} />
          </FormSection>
          <FormSection title="2. Choisir une date">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
              {dateChoices.map((choice) => {
                const selected = choice.date === date;
                return (
                  <Pressable accessibilityRole="button" key={choice.date} onPress={() => handleSelectDate(choice.date)} style={[styles.dateCard, selected && styles.dateCardSelected]}>
                    <Text style={[styles.dateDay, selected && styles.dateTextSelected]}>{choice.dayLabel}</Text>
                    <Text style={[styles.dateLabel, selected && styles.dateTextSelected]}>{choice.dateLabel}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </FormSection>
          <FormSection title="3. Choisir un creneau">
            {slotLoading ? <Text style={styles.loadingSlots}>Chargement des creneaux...</Text> : null}
            {!slotLoading && slotsLoaded && slotOptions.length === 0 ? (
              <View style={styles.emptySlotCard}>
                <Text style={styles.emptySlotTitle}>{emptySlotMessage}</Text>
                <Text style={styles.emptySlotHelp}>Essayez une autre date.</Text>
                {canGoNextDay ? <AppButton variant="secondary" onPress={handleNextDay}>Jour suivant</AppButton> : null}
              </View>
            ) : null}
            {slotGroups.map((group) => (
              <View key={group.key} style={styles.slotGroup}>
                <Text style={styles.slotGroupTitle}>{group.title}</Text>
                <View style={styles.slotsGrid}>
                  {group.items.map((slot) => {
                    const selected = slotValue === slot.dateDebut;
                    return (
                      <Pressable accessibilityRole="button" key={slot.dateDebut} onPress={() => setSlotValue(slot.dateDebut)} style={[styles.slotChip, selected && styles.slotChipSelected]}>
                        <Text style={[styles.slotText, selected && styles.slotTextSelected]}>{slot.endLabel ? formatSlotTime(slot.dateDebut) : slot.label}</Text>
                        {slot.endLabel ? <Text style={[styles.slotEndText, selected && styles.slotTextSelected]}>{slot.endLabel}</Text> : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </FormSection>
          <FormSection title="4. Commentaire optionnel">
            <AppInput label="Commentaire" value={commentaireClient} onChangeText={setCommentaireClient} />
          </FormSection>
          <AppButton disabled={!canConfirm} loading={saving} onPress={() => void handleCreateAppointment()}>Confirmer le rendez-vous</AppButton>
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dateCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: spacing.xs, minWidth: 92, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  dateCardSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateDay: { color: colors.text, fontSize: typography.secondary, fontWeight: '900' },
  dateLabel: { color: colors.muted, fontSize: typography.secondary, fontWeight: '700' },
  dateRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  dateTextSelected: { color: '#fff' },
  emptySlotCard: { backgroundColor: colors.surfaceSoft, borderRadius: 8, gap: spacing.sm, padding: spacing.md },
  emptySlotHelp: { color: colors.muted, fontSize: typography.secondary },
  emptySlotTitle: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
  eyebrow: { color: colors.primary, fontSize: typography.secondary, fontWeight: '900' },
  helper: { color: colors.muted, fontSize: typography.secondary, lineHeight: 18 },
  loadingSlots: { color: colors.muted, fontSize: typography.body, fontWeight: '700' },
  serviceTitle: { color: colors.text, fontSize: typography.sectionTitle, fontWeight: '900' },
  slotChip: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, minWidth: 78, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  slotChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotEndText: { color: colors.muted, fontSize: 11, fontWeight: '700', marginTop: 2 },
  slotGroup: { gap: spacing.sm },
  slotGroupTitle: { color: colors.text, fontSize: typography.cardTitle, fontWeight: '900' },
  slotText: { color: colors.text, fontSize: typography.body, fontWeight: '900', textAlign: 'center' },
  slotTextSelected: { color: '#fff' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  success: { color: colors.success, fontWeight: '700' },
  summaryCard: { ...shadows.card, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: spacing.xs, padding: spacing.md },
});
