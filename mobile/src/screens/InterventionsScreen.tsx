/*
 * Ce fichier declare l'ecran des interventions client mobile GarageFlow.
 * Il existe pour afficher le suivi des reparations du client et ouvrir leur detail.
 * Il communique avec interventionApi.ts et InterventionsStackNavigator.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { getClientInterventions } from '../api/interventionApi';
import { MobileHeader } from '../components/common/MobileHeader';
import { SectionHeader } from '../components/common/SectionHeader';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { CompactInterventionCard } from '../components/interventions/CompactInterventionCard';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import type { InterventionsStackParamList } from '../navigation/InterventionsStackNavigator';
import type { Intervention } from '../types/intervention';
import { colors, typography } from '../utils/theme';

type InterventionsScreenProps = NativeStackScreenProps<InterventionsStackParamList, 'InterventionsList'>;

/** Cet ecran montre le statut courant des reparations et ouvre leur timeline. */
export function InterventionsScreen({ navigation }: InterventionsScreenProps) {
  const [items, setItems] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { getClientInterventions().then(setItems).catch((e: Error) => setError(e.message)).finally(() => setLoading(false)); }, []);

  return (
    <ScreenContainer>
      <MobileHeader title="Suivi" subtitle="Reparations en cours" />
      <Text style={{ color: colors.muted, fontSize: typography.body }}>Suivez chaque etape visible par le client, du vehicule depose au vehicule pret.</Text>
      <SectionHeader title="Interventions" />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && items.length === 0 ? <EmptyState title="Aucune intervention" message="Vous n'avez pas encore de reparation suivie." /> : null}
      {items.map((item) => <CompactInterventionCard key={item.id} intervention={item} onFollow={() => navigation.navigate('InterventionDetail', { interventionId: item.id })} />)}
    </ScreenContainer>
  );
}
