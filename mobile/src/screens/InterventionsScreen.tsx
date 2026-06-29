/*
 * Ce fichier declare l'ecran des interventions client mobile GarageFlow.
 * Il existe pour afficher le suivi des reparations du client.
 * Il communique avec interventionApi.ts.
 */
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { getClientInterventions } from '../api/interventionApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { StatusBadge } from '../components/feedback/StatusBadge';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppCard } from '../components/ui/AppCard';
import type { Intervention } from '../types/intervention';

/** Cet ecran montre le statut courant des reparations. */
export function InterventionsScreen() {
  const [items, setItems] = useState<Intervention[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { getClientInterventions().then(setItems).catch((e: Error) => setError(e.message)).finally(() => setLoading(false)); }, []);
  return <ScreenContainer><Text>Mes reparations</Text>{loading ? <LoadingState /> : null}{error ? <ErrorState message={error} /> : null}{!loading && !error && items.length === 0 ? <EmptyState title="Aucune intervention" message="Le suivi de vos reparations apparaitra ici." /> : null}{items.map((item) => <AppCard key={item.id} title={`Intervention #${item.id}`} subtitle={item.appointment?.garage?.nom ?? undefined}><StatusBadge status={item.statutActuel?.code} /></AppCard>)}</ScreenContainer>;
}