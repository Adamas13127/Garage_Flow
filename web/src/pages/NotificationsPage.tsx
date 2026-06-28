/*
 * Ce fichier declare la page notifications du frontend web GarageFlow.
 * Il existe pour afficher les notifications applicatives de l'utilisateur connecte.
 * Il communique avec /api/notifications via le client HTTP.
 */
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/httpClient';
import { ErrorMessage } from '../components/feedback/ErrorMessage';
import { LoadingState } from '../components/feedback/LoadingState';
import { Card } from '../components/ui/Card';
import type { NotificationItem } from '../types/notification';

/** Cette page liste les notifications recentes du compte garage connecte. */
export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await apiRequest<{ items: NotificationItem[] }>('/api/notifications');
        setNotifications(response.items);
      } catch (exception) {
        setError(exception instanceof Error ? exception.message : 'Impossible de charger les notifications.');
      } finally {
        setLoading(false);
      }
    }

    void loadNotifications();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Notifications</h1>
        <p className="text-sm text-slate-500">Alertes applicatives liees aux rendez-vous et interventions.</p>
      </div>
      {loading ? <LoadingState label="Chargement des notifications" /> : null}
      {error ? <ErrorMessage message={error} /> : null}
      {!loading && !error && notifications.length === 0 ? <Card>Aucune notification pour le moment.</Card> : null}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card key={notification.id}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold text-slate-950">{notification.type}</p>
                <p className="mt-1 text-sm text-slate-600">{notification.contenu}</p>
              </div>
              <span className={`w-fit rounded-md px-3 py-1 text-sm font-medium ${notification.lu ? 'bg-slate-100 text-slate-600' : 'bg-sky-50 text-sky-800'}`}>
                {notification.lu ? 'Lue' : 'Non lue'}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}