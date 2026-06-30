/*
 * Ce fichier declare une carte de suivi d'intervention pour GarageFlow mobile.
 * Il existe pour montrer l'avancement d'une reparation sans exposer les notes internes garage.
 * Il communique avec InterventionsScreen et le detail de suivi.
 */
import { StyleSheet, Text, View } from 'react-native';
import type { Intervention } from '../../types/intervention';
import { formatDateTime } from '../../utils/format';
import { colors, shadows, spacing, typography } from '../../utils/theme';
import { StatusBadge } from '../feedback/StatusBadge';
import { AppButton } from '../ui/AppButton';

interface CompactInterventionCardProps {
  intervention: Intervention;
  onFollow: () => void;
}

function statusCode(item: Intervention): string | null | undefined { return item.statutActuel?.code ?? item.statut; }
function garageName(item: Intervention): string { return item.garage?.nom ?? item.appointment?.garage?.nom ?? item.rendezVous?.garage?.nom ?? `Intervention #${item.id}`; }
function vehicleName(item: Intervention): string {
  const vehicle = item.vehicle ?? item.vehicule ?? item.appointment?.vehicle ?? item.appointment?.vehicule;
  return vehicle ? `${vehicle.marque} ${vehicle.modele}` : 'Vehicule non renseigne';
}
function serviceName(item: Intervention): string {
  return item.service?.nom ?? item.prestation?.nom ?? item.appointment?.service?.nom ?? item.appointment?.prestation?.nom ?? 'Prestation non renseignee';
}

/** Cette carte donne au client le statut courant et un bouton vers la timeline. */
export function CompactInterventionCard({ intervention, onFollow }: CompactInterventionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.title}>{vehicleName(intervention)}</Text>
          <Text style={styles.meta}>{garageName(intervention)}</Text>
        </View>
        <StatusBadge status={statusCode(intervention)} />
      </View>
      <Text style={styles.line}>{serviceName(intervention)}</Text>
      <Text style={styles.meta}>{formatDateTime(intervention.createdAt)}</Text>
      <AppButton variant="secondary" onPress={onFollow}>Voir le suivi</AppButton>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...shadows.card, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: spacing.sm, padding: spacing.md },
  copy: { flex: 1, gap: spacing.xs },
  line: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: typography.secondary },
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  title: { color: colors.text, fontSize: typography.cardTitle, fontWeight: '900' },
});
