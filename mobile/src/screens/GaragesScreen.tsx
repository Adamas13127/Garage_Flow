/*
 * Ce fichier declare l'ecran des garages mobile GarageFlow.
 * Il existe pour afficher la liste des garages disponibles.
 * Il communique avec garageApi.ts.
 */
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { getGarages } from '../api/garageApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppCard } from '../components/ui/AppCard';
import type { Garage } from '../types/garage';

/** Cet ecran charge les garages pour preparer la future reservation. */
export function GaragesScreen() {
  const [garages, setGarages] = useState<Garage[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { getGarages().then(setGarages).catch((e: Error) => setError(e.message)).finally(() => setLoading(false)); }, []);
  return <ScreenContainer><Text>Garages</Text>{loading ? <LoadingState /> : null}{error ? <ErrorState message={error} /> : null}{!loading && !error && garages.length === 0 ? <EmptyState title="Aucun garage" message="Les garages disponibles apparaitront ici." /> : null}{garages.map((garage) => <AppCard key={garage.id} title={garage.nom} subtitle={[garage.adresse, garage.ville].filter(Boolean).join(' - ')} />)}</ScreenContainer>;
}