/*
 * Ce fichier declare la page notifications du frontend web GarageFlow.
 * Il existe pour afficher les notifications applicatives de l'utilisateur connecte.
 * Il communique avec notificationApi.ts et les pages liees aux rendez-vous/interventions.
 */
import { useEffect, useMemo, useState } from 'react';
import { getNotifications } from '../api/notificationApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import type { NotificationItem } from '../types/notification';
import { formatDateTime } from '../utils/format';

type NotificationFilter = 'all' | 'unread';

/** Cette page charge les notifications et permet de filtrer les non lues. */
export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true);
        setError(null);
        setNotifications(await getNotifications());
      } catch (exception) {
        setError(exception instanceof Error ? exception.message : 'Impossible de charger les notifications.');
      } finally {
        setLoading(false);
      }
    }

    void loadNotifications();
  }, []);

  const displayedNotifications = useMemo(
    () => (filter === 'unread' ? notifications.filter((notification) => !notification.lu) : notifications),
    [filter, notifications],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Alertes applicatives liees aux rendez-vous et interventions."
        actions={(
          <div className="inline-flex rounded-md border border-slate-200 bg-white p-1" aria-label="Filtrer les notifications">
            <Button aria-pressed={filter === 'all'} type="button" variant={filter === 'all' ? 'primary' : 'ghost'} onClick={() => setFilter('all')}>Toutes</Button>
            <Button aria-pressed={filter === 'unread'} type="button" variant={filter === 'unread' ? 'primary' : 'ghost'} onClick={() => setFilter('unread')}>Non lues</Button>
          </div>
        )}
      />
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
              <Button disabled type="button" variant="secondary">Marquer comme lue</Button>
            </div>
          </Card>
        )) : null}
      </div>
    </div>
  );
}