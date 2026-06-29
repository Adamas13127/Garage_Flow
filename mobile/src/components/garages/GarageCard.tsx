/*
 * Ce fichier declare la carte garage mobile GarageFlow.
 * Il existe pour afficher un garage et ouvrir son detail.
 * Il communique avec GaragesScreen.
 */
import { StyleSheet, Text } from 'react-native';
import type { Garage } from '../../types/garage';
import { colors, typography } from '../../utils/theme';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';

interface GarageCardProps { garage: Garage; onViewServices: () => void; }

/** Cette carte affiche les coordonnees principales d'un garage. */
export function GarageCard({ garage, onViewServices }: GarageCardProps) {
  return <AppCard title={garage.nom} subtitle={[garage.adresse, garage.ville].filter(Boolean).join(' - ')}><Text style={styles.text}>{garage.telephone ?? 'Telephone non renseigne'}</Text><AppButton variant="secondary" onPress={onViewServices}>Prestations</AppButton></AppCard>;
}

const styles = StyleSheet.create({ text: { color: colors.muted, fontSize: typography.body } });