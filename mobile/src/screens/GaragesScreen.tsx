/*
 * Ce fichier declare l'ecran des garages mobile GarageFlow.
 * Il existe pour afficher une liste de garages sous forme marketplace avant la reservation.
 * Il communique avec garageApi.ts et GaragesStackNavigator.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getGarages } from '../api/garageApi';
import { FilterChips } from '../components/common/FilterChips';
import { MobileHeader } from '../components/common/MobileHeader';
import { SectionHeader } from '../components/common/SectionHeader';
import { ServiceCategoryStrip } from '../components/common/ServiceCategoryStrip';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { GarageMarketplaceCard } from '../components/garages/GarageMarketplaceCard';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppInput } from '../components/ui/AppInput';
import type { GaragesStackParamList } from '../navigation/GaragesStackNavigator';
import type { Garage } from '../types/garage';
import { colors, spacing, typography } from '../utils/theme';

type GaragesScreenProps = NativeStackScreenProps<GaragesStackParamList, 'GaragesList'>;
type GarageFilter = 'all' | 'Entretien' | 'Freins' | 'Diagnostic' | 'Ouverts';

const filterOptions = [
  { label: 'Tous', value: 'all' },
  { label: 'Entretien', value: 'Entretien' },
  { label: 'Freins', value: 'Freins' },
  { label: 'Diagnostic', value: 'Diagnostic' },
  { label: 'Ouverts', value: 'Ouverts' },
] satisfies { label: string; value: GarageFilter }[];

function garageMatchesSearch(garage: Garage, query: string): boolean {
  const content = [garage.nom, garage.adresse, garage.ville, garage.description].filter(Boolean).join(' ').toLowerCase();
  return content.includes(query.toLowerCase());
}

/** Cet ecran charge les garages et aide le client a comparer avant de reserver. */
export function GaragesScreen({ navigation }: GaragesScreenProps) {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [filter, setFilter] = useState<GarageFilter>('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { getGarages().then(setGarages).catch((e: Error) => setError(e.message)).finally(() => setLoading(false)); }, []);

  const filteredGarages = useMemo(() => garages.filter((garage) => garageMatchesSearch(garage, query)), [garages, query]);

  return (
    <ScreenContainer>
      <MobileHeader title="Garages" subtitle="Autour de vous" />
      <View style={styles.intro}>
        <Text style={styles.subtitle}>Comparez les ateliers partenaires et choisissez une prestation disponible.</Text>
        <AppInput label="Recherche locale" value={query} onChangeText={setQuery} placeholder="Garage, ville, prestation..." />
      </View>
      <ServiceCategoryStrip selected={filter === 'all' || filter === 'Ouverts' ? undefined : filter} onSelect={(value) => setFilter(value as GarageFilter)} />
      <FilterChips options={filterOptions} value={filter} onChange={setFilter} />
      <SectionHeader title="Garages partenaires" />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && filteredGarages.length === 0 ? <EmptyState title="Aucun garage" message="Les garages disponibles apparaitront ici." /> : null}
      {filteredGarages.map((garage) => <GarageMarketplaceCard key={garage.id} garage={garage} onViewServices={() => navigation.navigate('GarageDetail', { garageId: garage.id })} />)}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: { gap: spacing.sm },
  subtitle: { color: colors.muted, fontSize: typography.body, lineHeight: 20 },
});

