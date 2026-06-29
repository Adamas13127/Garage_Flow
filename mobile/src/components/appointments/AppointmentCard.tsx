/*
 * Ce fichier declare la carte rendez-vous mobile GarageFlow.
 * Il existe pour afficher un rendez-vous client, son detail et son action d'annulation si possible.
 * Il communique avec AppointmentsScreen.
 */
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { Appointment } from '../../types/appointment';
import { colors, spacing, typography } from '../../utils/theme';
import { formatDateTime } from '../../utils/format';
import { StatusBadge } from '../feedback/StatusBadge';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';

interface AppointmentCardProps { appointment: Appointment; onCancel?: () => void; onDetails?: () => void; }

/** Cette carte affiche un rendez-vous et demande confirmation avant annulation. */
export function AppointmentCard({ appointment, onCancel, onDetails }: AppointmentCardProps) {
  const canCancel = appointment.statut === 'EN_ATTENTE' || appointment.statut === 'CONFIRME';
  function confirmCancel() { Alert.alert('Annuler le rendez-vous', 'Confirmer l annulation ?', [{ text: 'Non' }, { text: 'Oui', onPress: onCancel }]); }
  return <AppCard title={appointment.garage?.nom ?? `Rendez-vous #${appointment.id}`} subtitle={formatDateTime(appointment.dateDebut)}><Text style={styles.primary}>{appointment.service?.nom ?? appointment.prestation?.nom ?? 'Prestation non renseignee'}</Text><Text numberOfLines={2} style={styles.secondary}>{appointment.commentaireClient ?? appointment.motif ?? 'Aucun commentaire'}</Text><StatusBadge status={appointment.statut} /><View style={styles.actions}>{onDetails ? <AppButton variant="secondary" onPress={onDetails}>Detail</AppButton> : null}{canCancel && onCancel ? <AppButton variant="danger" onPress={confirmCancel}>Annuler</AppButton> : null}</View></AppCard>;
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  primary: { color: colors.text, fontSize: typography.body, fontWeight: '700' },
  secondary: { color: colors.muted, fontSize: typography.secondary },
});