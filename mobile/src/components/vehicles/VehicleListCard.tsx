/*
 * Ce fichier declare une carte vehicule compacte pour GarageFlow mobile.
 * Il existe pour afficher le parc client avant de proposer le formulaire.
 * Il communique avec VehiclesScreen et les actions modifier/supprimer.
 */
import { StyleSheet, Text, View } from 'react-native';
import type { Vehicle } from '../../types/vehicle';
import { colors, shadows, spacing, typography } from '../../utils/theme';
import { AppButton } from '../ui/AppButton';

interface VehicleListCardProps {
  vehicle: Vehicle;
  onDelete: () => void;
  onEdit: () => void;
}

/** Cette carte rend le vehicule lisible dans une liste courte. */
export function VehicleListCard({ onDelete, onEdit, vehicle }: VehicleListCardProps) {
  const plate = vehicle.plaqueImmatriculation ?? vehicle.immatriculation ?? 'Plaque non renseignee';
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>AUTO</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{vehicle.marque} {vehicle.modele}</Text>
          <Text style={styles.meta}>{plate}</Text>
          <Text style={styles.meta}>{[vehicle.annee, vehicle.carburant, vehicle.kilometrage ? `${vehicle.kilometrage} km` : null].filter(Boolean).join(' - ') || 'Details non renseignes'}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <AppButton variant="secondary" onPress={onEdit}>Modifier</AppButton>
        <AppButton variant="ghost" onPress={onDelete}>Supprimer</AppButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: spacing.sm },
  card: { ...shadows.card, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: spacing.md, padding: spacing.md },
  copy: { flex: 1, gap: spacing.xs },
  icon: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 8, height: 46, justifyContent: 'center', width: 54 },
  iconText: { color: colors.primary, fontSize: 10, fontWeight: '900' },
  meta: { color: colors.muted, fontSize: typography.secondary },
  row: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  title: { color: colors.text, fontSize: typography.cardTitle, fontWeight: '900' },
});
