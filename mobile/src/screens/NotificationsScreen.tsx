/*
 * Ce fichier declare l'ecran des notifications client mobile GarageFlow.
 * Il existe pour afficher les alertes, filtrer les non lues et les marquer comme lues.
 * Il communique avec notificationApi.ts et NotificationCard.
 */
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { getNotifications, getUnreadNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../api/notificationApi';
import { FilterChips } from '../components/common/FilterChips';
import { MobileHeader } from '../components/common/MobileHeader';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { NotificationCard } from '../components/notifications/NotificationCard';
import { AppButton } from '../components/ui/AppButton';
import type { NotificationItem } from '../types/notification';
import { colors } from '../utils/theme';

type NotificationFilter = 'all' | 'unread';
const filterOptions = [{ label: 'Toutes', value: 'all' }, { label: 'Non lues', value: 'unread' }] satisfies { label: string; value: NotificationFilter }[];

/** Cet ecran liste les notifications du client et gere leur lecture. */
export function NotificationsScreen() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | 'all' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => { try { setLoading(true); setError(null); setItems(filter === 'unread' ? await getUnreadNotifications() : await getNotifications()); } catch (exception) { setError(exception instanceof Error ? exception.message : 'Impossible de charger les notifications.'); } finally { setLoading(false); } }, [filter]);
  useEffect(() => { void loadNotifications(); }, [loadNotifications]);

  async function handleMarkRead(id: number) { try { setActionLoading(id); setError(null); await markNotificationAsRead(id); setSuccess('Notification marquee comme lue.'); await loadNotifications(); } catch (exception) { setError(exception instanceof Error ? exception.message : 'Impossible de marquer la notification comme lue.'); } finally { setActionLoading(null); } }
  async function handleMarkAllRead() { try { setActionLoading('all'); setError(null); await markAllNotificationsAsRead(); setSuccess('Toutes les notifications sont lues.'); await loadNotifications(); } catch (exception) { setError(exception instanceof Error ? exception.message : 'Impossible de marquer toutes les notifications comme lues.'); } finally { setActionLoading(null); } }

  return (
    <ScreenContainer>
      <MobileHeader title="Alertes" subtitle="Notifications client" />
      <FilterChips options={filterOptions} value={filter} onChange={setFilter} />
      <AppButton loading={actionLoading === 'all'} variant="secondary" onPress={() => void handleMarkAllRead()}>Tout marquer comme lu</AppButton>
      {success ? <Text style={styles.success}>{success}</Text> : null}
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && items.length === 0 ? <EmptyState title="Aucune notification" message="Vos notifications apparaitront ici." /> : null}
      {items.map((item) => <NotificationCard key={item.id} item={item} loading={actionLoading === item.id} onMarkRead={() => void handleMarkRead(item.id)} />)}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ success: { color: colors.success, fontWeight: '700' } });
