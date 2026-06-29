/*
 * Ce fichier declare la carte prestation mobile GarageFlow.
 * Il existe pour afficher une prestation et demarrer une reservation.
 * Il communique avec GarageDetailScreen.
 */
import { Text } from 'react-native';
import type { ServicePrestation } from '../../types/garage';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';

interface ServiceCardProps { service: ServicePrestation; onBook: () => void; }

/** Cette carte affiche une prestation active avec un bouton de reservation. */
export function ServiceCard({ onBook, service }: ServiceCardProps) {
  return <AppCard title={service.nom} subtitle={service.dureeMinutes ? `${service.dureeMinutes} minutes` : undefined}><Text>{service.description ?? 'Description non renseignee'}</Text><AppButton onPress={onBook}>Reserver</AppButton></AppCard>;
}