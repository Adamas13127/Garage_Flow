/*
 * Ce fichier declare la page dashboard du frontend web GarageFlow.
 * Il existe pour donner au gerant un cockpit de pilotage clair a partir des donnees API du garage.
 * Il communique avec les API garage, rendez-vous, interventions, notifications et AuthContext.
 */
import { Bell, CalendarCheck2, Clock3, Wrench } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getGarageAppointments } from '../api/appointmentApi';
import { getMyGarage } from '../api/garageApi';
import { getGarageInterventions } from '../api/interventionApi';
import { getNotifications } from '../api/notificationApi';
import { DaySchedule } from '../components/appointments/DaySchedule';
import { PriorityCard } from '../components/dashboard/PriorityCard';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
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

const activeWorkshopStatuses = ['VEHICULE_DEPOSE', 'DIAGNOSTIC_EN_COURS', 'ATTENTE_VALIDATION_CLIENT', 'REPARATION_EN_COURS', 'VEHICULE_PRET'];

/** Cette fonction dit si une intervention represente encore un vehicule utile a suivre en atelier. */
function isWorkshopActive(intervention: Intervention): boolean {
  return !intervention.closedAt && activeWorkshopStatuses.includes(intervention.statutActuel?.code ?? 'VEHICULE_DEPOSE');
}

/** Cette page charge les donnees essentielles et les presente comme un cockpit de priorites garage. */
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

  const cockpit = useMemo(() => {
    const pendingAppointments = data.appointments.filter((appointment) => appointment.statut === 'EN_ATTENTE');
    const confirmedAppointments = data.appointments
      .filter((appointment) => appointment.statut === 'CONFIRME')
      .sort((first, second) => new Date(first.dateDebut).getTime() - new Date(second.dateDebut).getTime());
    const workshopInterventions = data.interventions
      .filter(isWorkshopActive)
      .sort((first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime());
    const readyInterventions = workshopInterventions.filter((intervention) => intervention.statutActuel?.code === 'VEHICULE_PRET');
    const unreadNotifications = data.notifications.filter((notification) => !notification.lu);

    return { pendingAppointments, confirmedAppointments, workshopInterventions, readyInterventions, unreadNotifications };
  }, [data]);

  if (loading) {
    return <LoadingState label="Chargement du dashboard garage" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Bonjour ${user?.prenom ?? 'garage'}`}
        title="Cockpit garage"
        description={data.garage ? `${data.garage.nom} - priorites, planning et atelier.` : 'Priorites, planning et atelier du garage connecte.'}
      />

      {error ? <ErrorState message={error} /> : null}
      {!error && !data.garage ? <EmptyState title="Aucun garage rattache" description="Le backend n'a pas renvoye de garage pour ce compte." /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Actions prioritaires">
        <PriorityCard icon={<Clock3 aria-hidden="true" size={20} />} title="Demandes a valider" value={cockpit.pendingAppointments.length} description="Rendez-vous clients en attente de decision." tone="amber" />
        <PriorityCard icon={<CalendarCheck2 aria-hidden="true" size={20} />} title="RDV confirmes a venir" value={cockpit.confirmedAppointments.length} description="Planning garage a preparer pour les prochains passages." tone="sky" />
        <PriorityCard icon={<Wrench aria-hidden="true" size={20} />} title="Vehicules en atelier" value={cockpit.workshopInterventions.length} description="Interventions encore actives dans le parcours atelier." tone="slate" />
        <PriorityCard icon={<Bell aria-hidden="true" size={20} />} title="Notifications non lues" value={cockpit.unreadNotifications.length} description="Informations recentes a consulter par l'equipe." tone="emerald" />
      </section>

      <Card title="Actions prioritaires" description="Ce bloc transforme les compteurs en choses a traiter maintenant.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">{cockpit.pendingAppointments.length} demande(s) de RDV a valider.</p>
          <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-900">{cockpit.readyInterventions.length} vehicule(s) pret(s) a restituer.</p>
          <p className="rounded-md bg-sky-50 p-3 text-sm text-sky-900">{cockpit.unreadNotifications.length} notification(s) non lue(s).</p>
          <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">{cockpit.workshopInterventions.length} intervention(s) en cours.</p>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Planning du jour" description="Rendez-vous confirmes du jour ou prochains rendez-vous a preparer.">
          <DaySchedule appointments={cockpit.confirmedAppointments.slice(0, 6)} emptyTitle="Aucun rendez-vous confirme a venir." />
        </Card>

        <Card title="Vehicules en atelier" description="Interventions en cours avec statut actuel visible.">
          {cockpit.workshopInterventions.length === 0 ? (
            <EmptyState title="Aucun vehicule en atelier" description="Les interventions actives apparaitront ici." />
          ) : (
            <div className="space-y-3">
              {cockpit.workshopInterventions.slice(0, 6).map((intervention) => (
                <article className="rounded-md border border-slate-200 bg-slate-50 p-3" key={intervention.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-950">{formatVehicle(intervention.vehicle ?? intervention.vehicule)}</h2>
                      <p className="text-sm text-slate-600">{formatUserName(intervention.client)} - {formatService(intervention.service ?? intervention.prestation)}</p>
                      <p className="text-xs text-slate-500">Creee le {formatDateTime(intervention.createdAt)}</p>
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
