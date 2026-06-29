/*
 * Ce fichier declare l'ecran des notifications client mobile GarageFlow.
 * Il existe pour afficher les alertes, filtrer les non lues et les marquer comme lues.
 * Il communique avec notificationApi.ts et NotificationCard.
 */
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getNotifications, getUnreadNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../api/notificationApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { NotificationCard } from '../components/notifications/NotificationCard';
import { AppButton } from '../components/ui/AppButton';
import type { NotificationItem } from '../types/notification';
import { colors } from '../utils/theme';

type NotificationFilter = 'all' | 'unread';

/** Cet ecran liste les notifications du client et gere leur lecture. */
export function NotificationsScreen() {
  const [items, setItems] = useState<NotificationItem[]>([]); const [filter, setFilter] = useState<NotificationFilter>('all'); const [loading, setLoading] = useState(true); const [actionLoading, setActionLoading] = useState<number | 'all' | null>(null); const [error, setError] = useState<string | null>(null); const [success, setSuccess] = useState<string | null>(null);
  const loadNotifications = useCallback(async () => { try { setLoading(true); setError(null); setItems(filter === 'unread' ? await getUnreadNotifications() : await getNotifications()); } catch (exception) { setError(exception instanceof Error ? exception.message : 'Impossible de charger les notifications.'); } finally { setLoading(false); } }, [filter]);
  useEffect(() => { void loadNotifications(); }, [loadNotifications]);
  async function handleMarkRead(id: number) { try { setActionLoading(id); setError(null); await markNotificationAsRead(id); setSuccess('Notification marquee comme lue.'); await loadNotifications(); } catch (exception) { setError(exception instanceof Error ? exception.message : 'Impossible de marquer la notification comme lue.'); } finally { setActionLoading(null); } }
  async function handleMarkAllRead() { try { setActionLoading('all'); setError(null); await markAllNotificationsAsRead(); setSuccess('Toutes les notifications sont lues.'); await loadNotifications(); } catch (exception) { setError(exception instanceof Error ? exception.message : 'Impossible de marquer toutes les notifications comme lues.'); } finally { setActionLoading(null); } }
  return <ScreenContainer><Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Notifications</Text><View style={styles.filters}><AppButton variant={filter === 'all' ? 'primary' : 'secondary'} onPress={() => setFilter('all')}>Toutes</AppButton><AppButton variant={filter === 'unread' ? 'primary' : 'secondary'} onPress={() => setFilter('unread')}>Non lues</AppButton></View><AppButton loading={actionLoading === 'all'} variant="secondary" onPress={() => void handleMarkAllRead()}>Tout marquer comme lu</AppButton>{success ? <Text style={styles.success}>{success}</Text> : null}{loading ? <LoadingState /> : null}{error ? <ErrorState message={error} /> : null}{!loading && !error && items.length === 0 ? <EmptyState title="Aucune notification" message="Vos notifications apparaitront ici." /> : null}{items.map((item) => <NotificationCard key={item.id} item={item} loading={actionLoading === item.id} onMarkRead={() => void handleMarkRead(item.id)} />)}</ScreenContainer>;
}

const styles = StyleSheet.create({ filters: { flexDirection: 'row', gap: 8 }, success: { color: colors.success, fontWeight: '700' } });