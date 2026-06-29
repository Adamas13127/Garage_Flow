/*
 * Ce fichier declare l'ecran des interventions client mobile GarageFlow.
 * Il existe pour afficher le suivi des reparations du client et ouvrir leur detail.
 * Il communique avec interventionApi.ts et InterventionsStackNavigator.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { getClientInterventions } from '../api/interventionApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { StatusBadge } from '../components/feedback/StatusBadge';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import type { InterventionsStackParamList } from '../navigation/InterventionsStackNavigator';
import type { Intervention } from '../types/intervention';
import { formatDateTime } from '../utils/format';
import { colors } from '../utils/theme';

type InterventionsScreenProps = NativeStackScreenProps<InterventionsStackParamList, 'InterventionsList'>;

function statusCode(item: Intervention): string | null | undefined { return item.statutActuel?.code ?? item.statut; }
function garageName(item: Intervention): string | undefined | null { return item.garage?.nom ?? item.appointment?.garage?.nom ?? item.rendezVous?.garage?.nom; }
function vehicleName(item: Intervention): string | undefined { const vehicle = item.vehicle ?? item.vehicule ?? item.appointment?.vehicle ?? item.appointment?.vehicule; return vehicle ? `${vehicle.marque} ${vehicle.modele}` : undefined; }

/** Cet ecran montre le statut courant des reparations et ouvre leur timeline. */
export function InterventionsScreen({ navigation }: InterventionsScreenProps) {
  const [items, setItems] = useState<Intervention[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { getClientInterventions().then(setItems).catch((e: Error) => setError(e.message)).finally(() => setLoading(false)); }, []);
  return <ScreenContainer><Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>Mes reparations</Text>{loading ? <LoadingState /> : null}{error ? <ErrorState message={error} /> : null}{!loading && !error && items.length === 0 ? <EmptyState title="Aucune intervention" message="Vous n'avez pas encore de reparation suivie." /> : null}{items.map((item) => <AppCard key={item.id} title={garageName(item) ?? `Intervention #${item.id}`} subtitle={formatDateTime(item.createdAt)}><Text>{vehicleName(item) ?? 'Vehicule non renseigne'}</Text><StatusBadge status={statusCode(item)} /><AppButton variant="secondary" onPress={() => navigation.navigate('InterventionDetail', { interventionId: item.id })}>Voir le suivi</AppButton></AppCard>)}</ScreenContainer>;
}