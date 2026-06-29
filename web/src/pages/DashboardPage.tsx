/*
 * Ce fichier declare la page dashboard du frontend web GarageFlow.
 * Il existe pour donner un resume reel du garage connecte a partir des donnees API.
 * Il communique avec les API garage, rendez-vous, interventions, notifications et AuthContext.
 */
import { CalendarDays, Bell, Wrench, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getGarageAppointments } from '../api/appointmentApi';
import { getMyGarage } from '../api/garageApi';
import { getGarageInterventions } from '../api/interventionApi';
import { getNotifications } from '../api/notificationApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import type { Appointment } from '../types/appointment';
import type { Garage } from '../types/garage';
import type { Intervention } from '../types/intervention';
import type { NotificationItem } from '../types/notification';
import { formatDateTime, formatService, formatUserName, formatVehicle } from '../utils/format';

interface DashboardData {
  garage: Garage | null;
  appointments: Appointment[];
  interventions: Intervention[];
  notifications: NotificationItem[];
}

/** Cette page charge les donnees essentielles pour piloter l'activite du garage. */
export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({ garage: null, appointments: [], interventions: [], notifications: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);
        const [garage, appointments, interventions, notifications] = await Promise.all([
          getMyGarage(),
          getGarageAppointments(),
          getGarageInterventions(),
          getNotifications(),
        ]);
        setData({ garage, appointments, interventions, notifications });
      } catch (exception) {
        setError(exception instanceof Error ? exception.message : 'Impossible de charger le tableau de bord.');
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const pendingAppointments = data.appointments.filter((appointment) => appointment.statut === 'EN_ATTENTE').length;
    const confirmedAppointments = data.appointments.filter((appointment) => appointment.statut === 'CONFIRME').length;
    const activeInterventions = data.interventions.filter((intervention) => !intervention.closedAt).length;
    const unreadNotifications = data.notifications.filter((notification) => !notification.lu).length;

    return { pendingAppointments, confirmedAppointments, activeInterventions, unreadNotifications };
  }, [data]);

  const nextAppointments = [...data.appointments]
    .sort((first, second) => new Date(first.dateDebut).getTime() - new Date(second.dateDebut).getTime())
    .slice(0, 4);
  const latestInterventions = [...data.interventions]
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
    .slice(0, 4);

  if (loading) {
    return <LoadingState label="Chargement du dashboard garage" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Bonjour ${user?.prenom ?? 'garage'}`}
        title="Dashboard garage"
        description={data.garage ? `Vue d'ensemble de ${data.garage.nom}.` : 'Vue d ensemble du garage connecte.'}
      />

      {error ? <ErrorState message={error} /> : null}

      {!error && !data.garage ? <EmptyState title="Aucun garage rattache" description="Le backend n'a pas renvoye de garage pour ce compte." /> : null}

      {data.garage ? (
        <Card title={data.garage.nom} description={[data.garage.adresse, data.garage.codePostal, data.garage.ville].filter(Boolean).join(' ')}>
          <p className="text-sm text-slate-600">Utilisateur connecte : {formatUserName(user)}</p>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<CalendarDays aria-hidden="true" size={20} />} label="Rendez-vous en attente" value={stats.pendingAppointments} />
        <StatCard icon={<CheckCircle2 aria-hidden="true" size={20} />} label="Rendez-vous confirmes" value={stats.confirmedAppointments} />
        <StatCard icon={<Wrench aria-hidden="true" size={20} />} label="Interventions en cours" value={stats.activeInterventions} />
        <StatCard icon={<Bell aria-hidden="true" size={20} />} label="Notifications non lues" value={stats.unreadNotifications} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Prochains rendez-vous" description="Les rendez-vous les plus proches pour organiser l'accueil atelier.">
          {nextAppointments.length === 0 ? (
            <EmptyState title="Aucun rendez-vous a afficher" description="Les prochains rendez-vous apparaitront ici." />
          ) : (
            <div className="space-y-4">
              {nextAppointments.map((appointment) => (
                <article className="rounded-md border border-slate-100 p-4" key={appointment.id}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-semibold text-slate-950">{formatUserName(appointment.client)}</h2>
                      <p className="text-sm text-slate-500">{formatVehicle(appointment.vehicle ?? appointment.vehicule)}</p>
                      <p className="text-sm text-slate-500">{formatService(appointment.service ?? appointment.prestation)} - {formatDateTime(appointment.dateDebut)}</p>
                    </div>
                    <StatusBadge status={appointment.statut} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>

        <Card title="Dernieres interventions" description="Les interventions recentes pour suivre l'activite atelier.">
          {latestInterventions.length === 0 ? (
            <EmptyState title="Aucune intervention a afficher" description="Les interventions creees apparaitront ici." />
          ) : (
            <div className="space-y-4">
              {latestInterventions.map((intervention) => (
                <article className="rounded-md border border-slate-100 p-4" key={intervention.id}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-semibold text-slate-950">{formatUserName(intervention.client)}</h2>
                      <p className="text-sm text-slate-500">{formatVehicle(intervention.vehicle ?? intervention.vehicule)}</p>
                      <p className="text-sm text-slate-500">{formatService(intervention.service ?? intervention.prestation)} - creee le {formatDateTime(intervention.createdAt)}</p>
                    </div>
                    <StatusBadge status={intervention.statutActuel?.code} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}