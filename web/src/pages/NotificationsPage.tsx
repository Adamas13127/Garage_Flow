/*
 * Ce fichier declare la page notifications du frontend web GarageFlow.
 * Il existe pour afficher et marquer comme lues les notifications applicatives.
 * Il communique avec notificationApi.ts et les pages liees aux rendez-vous/interventions.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../api/notificationApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { InlineError } from '../components/feedback/InlineError';
import { LoadingState } from '../components/feedback/LoadingState';
import { SuccessMessage } from '../components/feedback/SuccessMessage';
import { ActionButton } from '../components/ui/ActionButton';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import type { NotificationItem } from '../types/notification';
import { formatDateTime } from '../utils/format';

type NotificationFilter = 'all' | 'unread';

/** Cette page charge les notifications et gere les actions de lecture. */
export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setNotifications(await getNotifications());
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Impossible de charger les notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const displayedNotifications = useMemo(
    () => (filter === 'unread' ? notifications.filter((notification) => !notification.lu) : notifications),
    [filter, notifications],
  );

  const unreadCount = notifications.filter((notification) => !notification.lu).length;

  async function handleRead(notificationId: number) {
    try {
      setActionId(`read-${notificationId}`);
      setActionError(null);
      setSuccess(null);
      await markNotificationAsRead(notificationId);
      setSuccess('Notification marquee comme lue.');
      await loadNotifications();
    } catch (exception) {
      setActionError(exception instanceof Error ? exception.message : 'Impossible de marquer la notification comme lue.');
    } finally {
      setActionId(null);
    }
  }

  async function handleReadAll() {
    try {
      setActionId('read-all');
      setActionError(null);
      setSuccess(null);
      await markAllNotificationsAsRead();
      setSuccess('Toutes les notifications ont ete marquees comme lues.');
      await loadNotifications();
    } catch (exception) {
      setActionError(exception instanceof Error ? exception.message : 'Impossible de marquer toutes les notifications comme lues.');
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Alertes applicatives liees aux rendez-vous et interventions."
        actions={(
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-md border border-slate-200 bg-white p-1" aria-label="Filtrer les notifications">
              <Button aria-pressed={filter === 'all'} type="button" variant={filter === 'all' ? 'primary' : 'ghost'} onClick={() => setFilter('all')}>Toutes</Button>
              <Button aria-pressed={filter === 'unread'} type="button" variant={filter === 'unread' ? 'primary' : 'ghost'} onClick={() => setFilter('unread')}>Non lues</Button>
            </div>
            <ActionButton disabled={unreadCount === 0} loading={actionId === 'read-all'} type="button" variant="secondary" onClick={() => void handleReadAll()}>
              Tout marquer comme lu
            </ActionButton>
          </div>
        )}
      />
      <SuccessMessage message={success} />
      <InlineError message={actionError} />
      {loading ? <LoadingState label="Chargement des notifications" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && displayedNotifications.length === 0 ? (
        <EmptyState title="Aucune notification" description={filter === 'unread' ? 'Toutes les notifications sont lues.' : 'Les alertes du backend apparaitront ici.'} />
      ) : null}
      <div className="space-y-3">
        {!loading && !error ? displayedNotifications.map((notification) => (
          <Card key={notification.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-slate-950">{notification.type}</h2>
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${notification.lu ? 'bg-slate-100 text-slate-600' : 'bg-sky-50 text-sky-800'}`}>
                    {notification.lu ? 'Lue' : 'Non lue'}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{notification.contenu}</p>
                <p className="text-xs text-slate-500">Creee le {formatDateTime(notification.createdAt)}</p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  {notification.appointmentId ? <span>Rendez-vous #{notification.appointmentId}</span> : null}
                  {notification.interventionId ? <span>Intervention #{notification.interventionId}</span> : null}
                </div>
              </div>
              {!notification.lu ? (
                <ActionButton loading={actionId === `read-${notification.id}`} type="button" variant="secondary" onClick={() => void handleRead(notification.id)}>
                  Marquer comme lue
                </ActionButton>
              ) : null}
            </div>
          </Card>
        )) : null}
      </div>
    </div>
  );
}