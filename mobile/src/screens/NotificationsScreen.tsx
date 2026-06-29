/*
 * Ce fichier declare l'ecran des notifications client mobile GarageFlow.
 * Il existe pour afficher les alertes du client connecte.
 * Il communique avec notificationApi.ts.
 */
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { getNotifications } from '../api/notificationApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppCard } from '../components/ui/AppCard';
import type { NotificationItem } from '../types/notification';
import { formatDateTime } from '../utils/format';

/** Cet ecran liste les notifications du client. */
export function NotificationsScreen() {
  const [items, setItems] = useState<NotificationItem[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  useEffect(() => { getNotifications().then(setItems).catch((e: Error) => setError(e.message)).finally(() => setLoading(false)); }, []);
  return <ScreenContainer><Text>Notifications</Text>{loading ? <LoadingState /> : null}{error ? <ErrorState message={error} /> : null}{!loading && !error && items.length === 0 ? <EmptyState title="Aucune notification" message="Vos notifications apparaitront ici." /> : null}{items.map((item) => <AppCard key={item.id} title={item.type} subtitle={formatDateTime(item.createdAt)}><Text>{item.contenu}</Text><Text>{item.lu ? 'Lue' : 'Non lue'}</Text></AppCard>)}</ScreenContainer>;
}