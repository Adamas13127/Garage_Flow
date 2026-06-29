/*
 * Ce fichier declare la carte notification de GarageFlow mobile.
 * Il existe pour afficher le contenu, l'etat lu/non lu et les actions d'une notification.
 * Il communique avec NotificationsScreen et notificationApi.ts.
 */
import { StyleSheet, Text, View } from 'react-native';
import type { NotificationItem } from '../../types/notification';
import { formatDateTime } from '../../utils/format';
import { colors } from '../../utils/theme';
import { AppButton } from '../ui/AppButton';
import { AppCard } from '../ui/AppCard';

interface NotificationCardProps { item: NotificationItem; loading?: boolean; onMarkRead?: () => void; }

/** Cette carte explique au client si une notification est nouvelle et a quoi elle est liee. */
export function NotificationCard({ item, loading, onMarkRead }: NotificationCardProps) {
  const relation = item.appointmentId ? 'Liee a un rendez-vous' : item.interventionId ? 'Liee a une intervention' : null;
  return <AppCard title={item.titre ?? item.type} subtitle={formatDateTime(item.createdAt)}><View style={styles.row}><Text style={[styles.badge, item.lu ? styles.read : styles.unread]}>{item.lu ? 'Lue' : 'Non lue'}</Text>{relation ? <Text style={styles.relation}>{relation}</Text> : null}</View><Text style={styles.content}>{item.contenu ?? item.message}</Text>{!item.lu ? <AppButton loading={loading} variant="secondary" onPress={onMarkRead}>Marquer comme lue</AppButton> : null}</AppCard>;
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 6, fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4 },
  content: { color: colors.text, fontSize: 14, marginVertical: 10 },
  read: { backgroundColor: '#f1f5f9', color: colors.muted },
  relation: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  row: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  unread: { backgroundColor: '#dcfce7', color: colors.success },
});