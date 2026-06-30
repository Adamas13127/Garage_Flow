/*
 * Ce fichier declare une carte rendez-vous compacte pour GarageFlow mobile.
 * Il existe pour afficher les rendez-vous comme une liste claire et filtrable.
 * Il communique avec AppointmentsScreen et les actions de detail ou d'annulation.
 */
import { StyleSheet, Text, View } from 'react-native';
import type { Appointment } from '../../types/appointment';
import { formatDateTime } from '../../utils/format';
import { colors, shadows, spacing, typography } from '../../utils/theme';
import { StatusBadge } from '../feedback/StatusBadge';
import { AppButton } from '../ui/AppButton';

interface CompactAppointmentCardProps {
  appointment: Appointment;
  onCancel?: () => void;
  onDetails?: () => void;
}

function vehicleLabel(appointment: Appointment): string {
  const vehicle = appointment.vehicle ?? appointment.vehicule;
  return vehicle ? `${vehicle.marque} ${vehicle.modele}` : 'Vehicule non renseigne';
}

/** Cette carte rassemble les informations client essentielles d'un rendez-vous. */
export function CompactAppointmentCard({ appointment, onCancel, onDetails }: CompactAppointmentCardProps) {
  const service = appointment.service ?? appointment.prestation;
  const canCancel = appointment.statut === 'EN_ATTENTE' || appointment.statut === 'CONFIRME';
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.title}>{appointment.garage?.nom ?? 'Garage non renseigne'}</Text>
          <Text style={styles.meta}>{formatDateTime(appointment.dateDebut)}</Text>
        </View>
        <StatusBadge status={appointment.statut} />
      </View>
      <Text style={styles.line}>{service?.nom ?? appointment.motif ?? 'Prestation non renseignee'}</Text>
      <Text style={styles.meta}>{vehicleLabel(appointment)}</Text>
      {appointment.commentaireClient ? <Text style={styles.comment}>{appointment.commentaireClient}</Text> : null}
      <View style={styles.actions}>
        <AppButton variant="secondary" onPress={onDetails}>Voir detail</AppButton>
        {canCancel ? <AppButton variant="ghost" onPress={onCancel}>Annuler</AppButton> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: spacing.sm },
  card: { ...shadows.card, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 8, borderWidth: 1, gap: spacing.sm, padding: spacing.md },
  comment: { backgroundColor: colors.surfaceSoft, borderRadius: 8, color: colors.text, fontSize: typography.secondary, padding: spacing.sm },
  copy: { flex: 1, gap: spacing.xs },
  line: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: typography.secondary },
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  title: { color: colors.text, fontSize: typography.cardTitle, fontWeight: '900' },
});
