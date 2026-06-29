/*
 * Ce fichier declare l'ecran des garages mobile GarageFlow.
 * Il existe pour afficher la liste des garages et ouvrir leurs prestations.
 * Il communique avec garageApi.ts et GaragesStackNavigator.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { getGarages } from '../api/garageApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { GarageCard } from '../components/garages/GarageCard';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import type { GaragesStackParamList } from '../navigation/GaragesStackNavigator';
import type { Garage } from '../types/garage';
import { colors } from '../utils/theme';

type GaragesScreenProps = NativeStackScreenProps<GaragesStackParamList, 'GaragesList'>;

/** Cet ecran charge les garages pour preparer la future reservation. */
export function GaragesScreen({ navigation }: GaragesScreenProps) {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { getGarages().then(setGarages).catch((e: Error) => setError(e.message)).finally(() => setLoading(false)); }, []);
  return <ScreenContainer><Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>Garages</Text>{loading ? <LoadingState /> : null}{error ? <ErrorState message={error} /> : null}{!loading && !error && garages.length === 0 ? <EmptyState title="Aucun garage" message="Les garages disponibles apparaitront ici." /> : null}{garages.map((garage) => <GarageCard key={garage.id} garage={garage} onViewServices={() => navigation.navigate('GarageDetail', { garageId: garage.id })} />)}</ScreenContainer>;
}