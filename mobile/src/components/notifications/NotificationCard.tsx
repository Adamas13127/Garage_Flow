/*
 * Ce fichier declare la carte notification de GarageFlow mobile.
 * Il existe pour afficher le contenu, l'etat lu/non lu et les actions d'une notification.
 * Il communique avec NotificationsScreen et notificationApi.ts.
 */
import { StyleSheet, Text, View } from 'react-native';
import type { NotificationItem } from '../../types/notification';
import { formatDateTime } from '../../utils/format';
import { colors, spacing, typography } from '../../utils/theme';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';

interface NotificationCardProps { item: NotificationItem; loading?: boolean; onMarkRead?: () => void; }

/** Cette carte explique au client si une notification est nouvelle et a quoi elle est liee. */
export function NotificationCard({ item, loading, onMarkRead }: NotificationCardProps) {
  const relation = item.appointmentId ? 'Liee a un rendez-vous' : item.interventionId ? 'Liee a une intervention' : null;
  return <AppCard title={item.titre ?? item.type} subtitle={formatDateTime(item.createdAt)}><View style={styles.row}><Text style={[styles.badge, item.lu ? styles.read : styles.unread]}>{item.lu ? 'Lue' : 'Non lue'}</Text>{relation ? <Text style={styles.relation}>{relation}</Text> : null}</View><Text numberOfLines={3} style={styles.content}>{item.contenu ?? item.message}</Text>{!item.lu ? <AppButton loading={loading} variant="secondary" onPress={onMarkRead}>Marquer comme lue</AppButton> : null}</AppCard>;
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 999, fontSize: typography.secondary, fontWeight: '800', paddingHorizontal: spacing.sm, paddingVertical: 3 },
  content: { color: colors.text, fontSize: typography.body },
  read: { backgroundColor: colors.surfaceSoft, color: colors.muted },
  relation: { color: colors.muted, fontSize: typography.secondary, fontWeight: '600' },
  row: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  unread: { backgroundColor: colors.successSoft, color: colors.success },
});