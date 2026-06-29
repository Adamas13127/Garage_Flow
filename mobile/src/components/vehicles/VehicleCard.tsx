/*
 * Ce fichier declare la carte vehicule mobile GarageFlow.
 * Il existe pour afficher un vehicule client et ses actions principales.
 * Il communique avec VehiclesScreen.
 */
import { StyleSheet, Text, View } from 'react-native';
import type { Vehicle } from '../../types/vehicle';
import { colors } from '../../utils/theme';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';

interface VehicleCardProps { vehicle: Vehicle; onEdit?: () => void; onDelete?: () => void; }

/** Cette carte affiche les informations utiles d'un vehicule du client. */
export function VehicleCard({ onDelete, onEdit, vehicle }: VehicleCardProps) {
  const plate = vehicle.plaqueImmatriculation ?? vehicle.immatriculation;
  return <AppCard title={`${vehicle.marque} ${vehicle.modele}`} subtitle={plate ?? undefined}><View style={styles.body}><Text style={styles.text}>Kilometrage : {vehicle.kilometrage ?? 'Non renseigne'}</Text><Text style={styles.text}>Annee : {vehicle.annee ?? 'Non renseignee'}</Text><Text style={styles.text}>Carburant : {vehicle.carburant ?? 'Non renseigne'}</Text><View style={styles.actions}>{onEdit ? <AppButton variant="secondary" onPress={onEdit}>Modifier</AppButton> : null}{onDelete ? <AppButton variant="secondary" onPress={onDelete}>Supprimer</AppButton> : null}</View></View></AppCard>;
}

const styles = StyleSheet.create({ body: { gap: 8 }, text: { color: colors.muted }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } });