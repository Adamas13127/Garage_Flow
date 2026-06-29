/*
 * Ce fichier declare l'ecran des rendez-vous client mobile GarageFlow.
 * Il existe pour afficher les rendez-vous du client connecte.
 * Il communique avec appointmentApi.ts.
 */
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { getClientAppointments } from '../api/appointmentApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { StatusBadge } from '../components/feedback/StatusBadge';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppCard } from '../components/ui/AppCard';
import type { Appointment } from '../types/appointment';
import { formatDateTime } from '../utils/format';

/** Cet ecran liste les rendez-vous du client. */
export function AppointmentsScreen() {
  const [items, setItems] = useState<Appointment[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { getClientAppointments().then(setItems).catch((e: Error) => setError(e.message)).finally(() => setLoading(false)); }, []);
  return <ScreenContainer><Text>Mes rendez-vous</Text>{loading ? <LoadingState /> : null}{error ? <ErrorState message={error} /> : null}{!loading && !error && items.length === 0 ? <EmptyState title="Aucun rendez-vous" message="Vos rendez-vous apparaitront ici." /> : null}{items.map((item) => <AppCard key={item.id} title={item.garage?.nom ?? `Rendez-vous #${item.id}`} subtitle={formatDateTime(item.dateDebut)}><StatusBadge status={item.statut} /></AppCard>)}</ScreenContainer>;
}