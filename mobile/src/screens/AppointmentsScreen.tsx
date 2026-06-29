/*
 * Ce fichier declare l'ecran des rendez-vous client mobile GarageFlow.
 * Il existe pour afficher les rendez-vous et permettre leur consultation ou annulation.
 * Il communique avec appointmentApi.ts, AppointmentCard et AppointmentsStackNavigator.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { Text } from 'react-native';
import { cancelAppointment, getClientAppointments } from '../api/appointmentApi';
import { AppointmentCard } from '../components/appointments/AppointmentCard';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import type { AppointmentsStackParamList } from '../navigation/AppointmentsStackNavigator';
import type { Appointment } from '../types/appointment';
import { colors } from '../utils/theme';

type AppointmentsScreenProps = NativeStackScreenProps<AppointmentsStackParamList, 'AppointmentsList'>;

/** Cet ecran liste les rendez-vous du client et gere l'annulation. */
export function AppointmentsScreen({ navigation }: AppointmentsScreenProps) {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const loadAppointments = useCallback(async () => { try { setLoading(true); setError(null); setItems(await getClientAppointments()); } catch (exception) { setError(exception instanceof Error ? exception.message : 'Impossible de charger les rendez-vous.'); } finally { setLoading(false); } }, []);
  useEffect(() => { void loadAppointments(); }, [loadAppointments]);
  async function handleCancel(id: number) { try { setError(null); await cancelAppointment(id); setSuccess('Rendez-vous annule.'); await loadAppointments(); } catch (exception) { setError(exception instanceof Error ? exception.message : 'Impossible d annuler le rendez-vous.'); } }
  return <ScreenContainer><Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>Mes rendez-vous</Text>{success ? <Text style={{ color: colors.success, fontWeight: '700' }}>{success}</Text> : null}{loading ? <LoadingState /> : null}{error ? <ErrorState message={error} /> : null}{!loading && !error && items.length === 0 ? <EmptyState title="Aucun rendez-vous" message="Vos rendez-vous apparaitront ici." /> : null}{items.map((item) => <AppointmentCard key={item.id} appointment={item} onDetails={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })} onCancel={() => void handleCancel(item.id)} />)}</ScreenContainer>;
}