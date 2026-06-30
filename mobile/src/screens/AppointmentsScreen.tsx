/*
 * Ce fichier declare l'ecran des rendez-vous client mobile GarageFlow.
 * Il existe pour afficher les rendez-vous et permettre leur consultation ou annulation.
 * Il communique avec appointmentApi.ts, les cartes compactes et AppointmentsStackNavigator.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { cancelAppointment, getClientAppointments } from '../api/appointmentApi';
import { CompactAppointmentCard } from '../components/appointments/CompactAppointmentCard';
import { FilterChips } from '../components/common/FilterChips';
import { MobileHeader } from '../components/common/MobileHeader';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import type { AppointmentsStackParamList } from '../navigation/AppointmentsStackNavigator';
import type { Appointment } from '../types/appointment';
import { colors } from '../utils/theme';

type AppointmentsScreenProps = NativeStackScreenProps<AppointmentsStackParamList, 'AppointmentsList'>;
type AppointmentFilter = 'upcoming' | 'pending' | 'past' | 'all';

const filterOptions = [
  { label: 'A venir', value: 'upcoming' },
  { label: 'En attente', value: 'pending' },
  { label: 'Passes', value: 'past' },
  { label: 'Tous', value: 'all' },
] satisfies { label: string; value: AppointmentFilter }[];

function matchesFilter(item: Appointment, filter: AppointmentFilter): boolean {
  const isPast = new Date(item.dateDebut).getTime() < Date.now() || item.statut === 'ANNULE' || item.statut === 'REFUSE';
  if (filter === 'all') return true;
  if (filter === 'pending') return item.statut === 'EN_ATTENTE';
  if (filter === 'past') return isPast;
  return !isPast && (item.statut === 'EN_ATTENTE' || item.statut === 'CONFIRME');
}

/** Cet ecran liste les rendez-vous du client avec des filtres simples. */
export function AppointmentsScreen({ navigation }: AppointmentsScreenProps) {
  const [items, setItems] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<AppointmentFilter>('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => { try { setLoading(true); setError(null); setItems(await getClientAppointments()); } catch (exception) { setError(exception instanceof Error ? exception.message : 'Impossible de charger les rendez-vous.'); } finally { setLoading(false); } }, []);
  useEffect(() => { void loadAppointments(); }, [loadAppointments]);
  const filteredItems = useMemo(() => items.filter((item) => matchesFilter(item, filter)), [filter, items]);

  async function handleCancel(id: number) { try { setError(null); await cancelAppointment(id); setSuccess('Rendez-vous annule.'); await loadAppointments(); } catch (exception) { setError(exception instanceof Error ? exception.message : 'Impossible d annuler le rendez-vous.'); } }

  return (
    <ScreenContainer>
      <MobileHeader title="RDV" subtitle="Reservations client" />
      <FilterChips options={filterOptions} value={filter} onChange={setFilter} />
      {success ? <Text style={styles.success}>{success}</Text> : null}
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && filteredItems.length === 0 ? <EmptyState title="Aucun rendez-vous" message="Vos rendez-vous apparaitront ici." /> : null}
      {filteredItems.map((item) => <CompactAppointmentCard key={item.id} appointment={item} onDetails={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })} onCancel={() => void handleCancel(item.id)} />)}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ success: { color: colors.success, fontWeight: '700' } });
