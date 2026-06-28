/*
 * Ce fichier declare la page dashboard du frontend web GarageFlow.
 * Il existe pour donner un premier resume au garage connecte.
 * Il communique avec /api/garage/me, /api/garage/me/appointments, /api/garage/me/interventions et /api/notifications.
 */
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/httpClient';
import { ErrorMessage } from '../components/feedback/ErrorMessage';
import { LoadingState } from '../components/feedback/LoadingState';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import type { Appointment } from '../types/appointment';
import type { Garage } from '../types/garage';
import type { Intervention } from '../types/intervention';
import type { NotificationItem } from '../types/notification';

interface DashboardData {
  garage: Garage | null;
  appointments: Appointment[];
  interventions: Intervention[];
  notifications: NotificationItem[];
}

/** Cette page affiche les premieres informations utiles au garage connecte. */
export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({ garage: null, appointments: [], interventions: [], notifications: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [garage, appointments, interventions, notifications] = await Promise.all([
          apiRequest<Garage>('/api/garage/me'),
          apiRequest<{ items: Appointment[] }>('/api/garage/me/appointments'),
          apiRequest<{ items: Intervention[] }>('/api/garage/me/interventions'),
          apiRequest<{ items: NotificationItem[] }>('/api/notifications'),
        ]);
        setData({ garage, appointments: appointments.items, interventions: interventions.items, notifications: notifications.items });
      } catch (exception) {
        setError(exception instanceof Error ? exception.message : 'Impossible de charger le tableau de bord.');
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  if (loading) {
    return <LoadingState label="Chargement du dashboard" />;
  }

  const unreadCount = data.notifications.filter((notification) => !notification.lu).length;
  const activeInterventions = data.interventions.filter((intervention) => !intervention.closedAt).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Bonjour {user?.prenom}</p>
        <h1 className="text-2xl font-bold text-slate-950">Dashboard garage</h1>
      </div>
      {error ? <ErrorMessage message={error} /> : null}
      <Card title={data.garage?.nom ?? 'Garage'} description={data.garage ? `${data.garage.adresse}, ${data.garage.ville}` : 'Garage rattache au compte connecte.'}>
        <p className="text-sm text-slate-600">Role connecte : {user?.role}</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Rendez-vous du jour"><p className="text-3xl font-bold text-sky-800">{data.appointments.length}</p></Card>
        <Card title="Interventions en cours"><p className="text-3xl font-bold text-sky-800">{activeInterventions}</p></Card>
        <Card title="Notifications non lues"><p className="text-3xl font-bold text-sky-800">{unreadCount}</p></Card>
      </div>
    </div>
  );
}