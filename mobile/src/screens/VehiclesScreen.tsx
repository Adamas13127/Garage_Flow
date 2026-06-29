/*
 * Ce fichier declare l'ecran des vehicules client mobile GarageFlow.
 * Il existe pour afficher les vehicules du client connecte.
 * Il communique avec vehicleApi.ts.
 */
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { getClientVehicles } from '../api/vehicleApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppCard } from '../components/ui/AppCard';
import type { Vehicle } from '../types/vehicle';

/** Cet ecran liste les vehicules sans encore proposer le CRUD complet. */
export function VehiclesScreen() {
  const [items, setItems] = useState<Vehicle[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { getClientVehicles().then(setItems).catch((e: Error) => setError(e.message)).finally(() => setLoading(false)); }, []);
  return <ScreenContainer><Text>Mes vehicules</Text>{loading ? <LoadingState /> : null}{error ? <ErrorState message={error} /> : null}{!loading && !error && items.length === 0 ? <EmptyState title="Aucun vehicule" message="Vos vehicules apparaitront ici." /> : null}{items.map((vehicle) => <AppCard key={vehicle.id} title={[vehicle.marque, vehicle.modele].filter(Boolean).join(' ')} subtitle={vehicle.plaqueImmatriculation ?? vehicle.immatriculation ?? undefined} />)}</ScreenContainer>;
}