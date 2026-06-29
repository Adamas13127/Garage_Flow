/*
 * Ce fichier declare l'ecran de reservation mobile GarageFlow.
 * Il existe pour choisir un vehicule, une date, un creneau et creer un rendez-vous.
 * Il communique avec garageApi.ts, vehicleApi.ts et appointmentApi.ts.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { createAppointment } from '../api/appointmentApi';
import { getAvailableSlots } from '../api/garageApi';
import { getVehicles } from '../api/vehicleApi';
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
import { formatDateTime } from '../utils/format';
import { colors } from '../utils/theme';

type BookingScreenProps = NativeStackScreenProps<GaragesStackParamList, 'Booking'>;

/** Cet ecran orchestre le parcours simple de demande de rendez-vous client. */
export function BookingScreen({ navigation, route }: BookingScreenProps) {
  const { garageId, serviceId, serviceName } = route.params;
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
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
    try { setSlotLoading(true); setError(null); const loadedSlots = await getAvailableSlots(garageId, serviceId, date); setSlots(loadedSlots); setSlotValue(''); } catch (exception) { setError(exception instanceof Error ? exception.message : 'Impossible de charger les creneaux.'); } finally { setSlotLoading(false); }
  }

  async function handleCreateAppointment() {
    if (!vehicleId) { setError('Veuillez selectionner un vehicule.'); return; }
    if (!slotValue) { setError('Veuillez selectionner un creneau.'); return; }
    try { setSaving(true); setError(null); await createAppointment({ garageId, serviceId, vehicleId: Number(vehicleId), dateHeure: slotValue, commentaireClient: commentaireClient.trim() || null }); setSuccess('Demande de rendez-vous creee.'); setTimeout(() => navigation.getParent()?.navigate('Appointments' as never), 300); } catch (exception) { setError(exception instanceof Error ? exception.message : 'Impossible de creer le rendez-vous.'); } finally { setSaving(false); }
  }

  const vehicleOptions = vehicles.map((vehicle) => ({ value: String(vehicle.id), label: `${vehicle.marque} ${vehicle.modele}` }));
  const slotOptions = slots.map((slot, index) => { const value = slot.dateHeure ?? slot.startAt ?? String(slot.id ?? index); return { value, label: slot.label ?? formatDateTime(value) }; });

  return <ScreenContainer><Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Reserver</Text><Text>{serviceName}</Text>{loading ? <LoadingState /> : null}{error ? <ErrorState message={error} /> : null}{success ? <Text style={{ color: colors.success, fontWeight: '700' }}>{success}</Text> : null}{!loading && vehicles.length === 0 ? <EmptyState title="Aucun vehicule" message="Ajoutez un vehicule avant de reserver." /> : null}<FormSection title="1. Vehicule"><AppSelect label="Choisir un vehicule" value={vehicleId} options={vehicleOptions} onChange={setVehicleId} /></FormSection><FormSection title="2. Date et creneau"><DateInput label="Date" value={date} onChangeText={setDate} /><AppButton loading={slotLoading} onPress={() => void handleLoadSlots()}>Charger les creneaux</AppButton>{slots.length === 0 ? <Text>Aucun creneau charge.</Text> : <AppSelect label="Creneau" value={slotValue} options={slotOptions} onChange={setSlotValue} />}</FormSection><FormSection title="3. Commentaire"><AppInput label="Commentaire optionnel" value={commentaireClient} onChangeText={setCommentaireClient} /></FormSection><AppButton loading={saving} onPress={() => void handleCreateAppointment()}>Creer la demande</AppButton></ScreenContainer>;
}