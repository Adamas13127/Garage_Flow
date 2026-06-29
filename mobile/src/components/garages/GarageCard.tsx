/*
 * Ce fichier declare la carte garage mobile GarageFlow.
 * Il existe pour afficher un garage et ouvrir son detail.
 * Il communique avec GaragesScreen.
 */
import { Text } from 'react-native';
import type { Garage } from '../../types/garage';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';

interface GarageCardProps { garage: Garage; onViewServices: () => void; }

/** Cette carte affiche les coordonnees principales d'un garage. */
export function GarageCard({ garage, onViewServices }: GarageCardProps) {
  return <AppCard title={garage.nom} subtitle={[garage.adresse, garage.ville].filter(Boolean).join(' - ')}><Text>{garage.telephone ?? 'Telephone non renseigne'}</Text><AppButton onPress={onViewServices}>Voir les prestations</AppButton></AppCard>;
}