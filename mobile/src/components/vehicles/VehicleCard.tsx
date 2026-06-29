/*
 * Ce fichier declare la carte vehicule mobile GarageFlow.
 * Il existe pour afficher un vehicule client et ses actions principales.
 * Il communique avec VehiclesScreen.
 */
import { StyleSheet, Text, View } from 'react-native';
import type { Vehicle } from '../../types/vehicle';
import { colors, spacing, typography } from '../../utils/theme';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';

interface VehicleCardProps { vehicle: Vehicle; onEdit?: () => void; onDelete?: () => void; }

/** Cette carte affiche les informations utiles d'un vehicule du client. */
export function VehicleCard({ onDelete, onEdit, vehicle }: VehicleCardProps) {
  const plate = vehicle.plaqueImmatriculation ?? vehicle.immatriculation;
  return <AppCard title={`${vehicle.marque} ${vehicle.modele}`} subtitle={plate ?? undefined}><View style={styles.body}><Text style={styles.text}>Km : {vehicle.kilometrage ?? 'Non renseigne'}</Text><Text style={styles.text}>Annee : {vehicle.annee ?? 'Non renseignee'} | {vehicle.carburant ?? 'Carburant non renseigne'}</Text><View style={styles.actions}>{onEdit ? <AppButton variant="secondary" onPress={onEdit}>Modifier</AppButton> : null}{onDelete ? <AppButton variant="danger" onPress={onDelete}>Supprimer</AppButton> : null}</View></View></AppCard>;
}

const styles = StyleSheet.create({ body: { gap: spacing.xs }, text: { color: colors.muted, fontSize: typography.body }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs } });