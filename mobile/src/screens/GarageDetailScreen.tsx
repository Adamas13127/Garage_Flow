/*
 * Ce fichier declare l'ecran detail garage mobile GarageFlow.
 * Il existe pour afficher les informations d'un garage et ses prestations actives.
 * Il communique avec garageApi.ts et la navigation de reservation.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { getGarage, getGarageServices } from '../api/garageApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { ServiceCard } from '../components/garages/ServiceCard';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppCard } from '../components/ui/AppCard';
import type { GaragesStackParamList } from '../navigation/GaragesStackNavigator';
import type { Garage, ServicePrestation } from '../types/garage';
import { colors } from '../utils/theme';

type GarageDetailScreenProps = NativeStackScreenProps<GaragesStackParamList, 'GarageDetail'>;

/** Cet ecran affiche les prestations d'un garage pour demarrer une reservation. */
export function GarageDetailScreen({ navigation, route }: GarageDetailScreenProps) {
  const { garageId } = route.params;
  const [garage, setGarage] = useState<Garage | null>(null);
  const [services, setServices] = useState<ServicePrestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { Promise.all([getGarage(garageId), getGarageServices(garageId)]).then(([loadedGarage, loadedServices]) => { setGarage(loadedGarage); setServices(loadedServices.filter((service) => service.actif !== false)); }).catch((exception: Error) => setError(exception.message)).finally(() => setLoading(false)); }, [garageId]);

  return <ScreenContainer><Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Detail garage</Text>{loading ? <LoadingState /> : null}{error ? <ErrorState message={error} /> : null}{garage ? <AppCard title={garage.nom} subtitle={[garage.adresse, garage.ville].filter(Boolean).join(' - ')}><Text>{garage.telephone ?? 'Telephone non renseigne'}</Text><Text>{garage.description ?? 'Description non renseignee'}</Text></AppCard> : null}{!loading && !error && services.length === 0 ? <EmptyState title="Aucune prestation" message="Ce garage n'a pas encore de prestation active." /> : null}{services.map((service) => <ServiceCard key={service.id} service={service} onBook={() => navigation.navigate('Booking', { garageId, serviceId: service.id, serviceName: service.nom })} />)}</ScreenContainer>;
}