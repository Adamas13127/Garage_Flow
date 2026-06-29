/*
 * Ce fichier declare la page des rendez-vous garage du frontend GarageFlow.
 * Il existe pour organiser les demandes, le planning et l'historique comme un outil metier de garage.
 * Il communique avec appointmentApi.ts, les cartes de rendez-vous et le layout garage.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { acceptAppointment, getGarageAppointments, refuseAppointment } from '../api/appointmentApi';
import { AppointmentRequestCard } from '../components/appointments/AppointmentRequestCard';
import { AppointmentTimelineList } from '../components/appointments/AppointmentTimelineList';
import { DaySchedule } from '../components/appointments/DaySchedule';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { InlineError } from '../components/feedback/InlineError';
import { LoadingState } from '../components/feedback/LoadingState';
import { SuccessMessage } from '../components/feedback/SuccessMessage';
import { ActionButton } from '../components/ui/ActionButton';
import { Card } from '../components/ui/Card';
import { FormTextarea } from '../components/ui/FormTextarea';
import { PageHeader } from '../components/ui/PageHeader';
import { SimpleModal } from '../components/ui/SimpleModal';
import type { Appointment } from '../types/appointment';

interface PendingAction {
  appointmentId: number;
  type: 'accept' | 'refuse';
}

type QuickFilter = 'today' | 'week' | 'all';

/** Cette fonction verifie si une date API correspond au jour courant du poste. */
function isToday(value: string): boolean {
  const date = new Date(value);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

/** Cette fonction garde les rendez-vous de la semaine courante approximative pour un filtre rapide MVP. */
function isWithinSevenDays(value: string): boolean {
  const dateTime = new Date(value).getTime();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return dateTime >= start && dateTime <= start + 7 * 24 * 60 * 60 * 1000;
}

/** Cette page charge les rendez-vous du garage et separe demandes, planning et historique. */
export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<QuickFilter>('all');
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<PendingAction | null>(null);
  const [refuseTarget, setRefuseTarget] = useState<Appointment | null>(null);
  const [refuseReason, setRefuseReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setAppointments(await getGarageAppointments());
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Impossible de charger les rendez-vous.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const sections = useMemo(() => {
    const sorted = [...appointments].sort((first, second) => new Date(first.dateDebut).getTime() - new Date(second.dateDebut).getTime());
    const pending = sorted.filter((appointment) => appointment.statut === 'EN_ATTENTE');
    const confirmed = sorted.filter((appointment) => appointment.statut === 'CONFIRME');
    const filteredConfirmed = confirmed.filter((appointment) => {
      if (filter === 'today') return isToday(appointment.dateDebut);
      if (filter === 'week') return isWithinSevenDays(appointment.dateDebut);
      return true;
    });
    const history = sorted.filter((appointment) => ['REFUSE', 'ANNULE', 'TERMINE'].includes(appointment.statut));

    return { pending, confirmed: filteredConfirmed, history };
  }, [appointments, filter]);

  async function handleAccept(appointment: Appointment) {
    try {
      setAction({ appointmentId: appointment.id, type: 'accept' });
      setActionError(null);
      setSuccess(null);
      await acceptAppointment(appointment.id);
      setSuccess('Le rendez-vous a ete accepte.');
      await loadAppointments();
    } catch (exception) {
      setActionError(exception instanceof Error ? exception.message : 'Impossible d accepter le rendez-vous.');
    } finally {
      setAction(null);
    }
  }

  async function handleRefuse() {
    if (!refuseTarget) {
      return;
    }

    try {
      setAction({ appointmentId: refuseTarget.id, type: 'refuse' });
      setActionError(null);
      setSuccess(null);
      await refuseAppointment(refuseTarget.id, refuseReason.trim() || undefined);
      setSuccess('Le rendez-vous a ete refuse.');
      setRefuseTarget(null);
      setRefuseReason('');
      await loadAppointments();
    } catch (exception) {
      setActionError(exception instanceof Error ? exception.message : 'Impossible de refuser le rendez-vous.');
    } finally {
      setAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Rendez-vous" description="Planning et demandes clients du garage." />
      <SuccessMessage message={success} />
      <InlineError message={actionError} />
      {loading ? <LoadingState label="Chargement des rendez-vous" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && appointments.length === 0 ? <EmptyState title="Aucun rendez-vous" description="Les demandes clients apparaitront ici des qu'elles seront creees." /> : null}

      {!loading && !error && appointments.length > 0 ? (
        <>
          <Card title="Demandes a traiter" description="Les rendez-vous en attente sont prioritaires car ils demandent une decision du garage.">
            {sections.pending.length === 0 ? (
              <EmptyState title="Aucune demande en attente" description="Les nouvelles demandes clients apparaitront ici." />
            ) : (
              <div className="space-y-3">
                {sections.pending.map((appointment) => (
                  <AppointmentRequestCard
                    accepting={action?.appointmentId === appointment.id && action.type === 'accept'}
                    appointment={appointment}
                    key={appointment.id}
                    refusing={action?.appointmentId === appointment.id && action.type === 'refuse'}
                    onAccept={(selectedAppointment) => void handleAccept(selectedAppointment)}
                    onRefuse={(selectedAppointment) => { setActionError(null); setRefuseTarget(selectedAppointment); }}
                  />
                ))}
              </div>
            )}
          </Card>

          <Card title="Planning" description="Rendez-vous confirmes regroupes par jour.">
            <div className="mb-4 flex flex-wrap gap-2" aria-label="Filtres rapides rendez-vous">
              {[
                { id: 'today', label: 'Aujourd hui' },
                { id: 'week', label: 'Semaine' },
                { id: 'all', label: 'Tous' },
              ].map((item) => (
                <button
                  className={`rounded-md px-3 py-2 text-sm font-semibold ${filter === item.id ? 'bg-sky-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id as QuickFilter)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <DaySchedule appointments={sections.confirmed} emptyTitle="Aucun rendez-vous confirme pour ce filtre." />
          </Card>

          <Card title="Historique" description="Rendez-vous refuses, annules ou termines en consultation rapide.">
            <AppointmentTimelineList appointments={sections.history} />
          </Card>
        </>
      ) : null}

      <SimpleModal
        description="Le motif est optionnel et permet de garder une trace claire de la decision."
        open={Boolean(refuseTarget)}
        title="Refuser le rendez-vous"
        onClose={() => { setRefuseTarget(null); setRefuseReason(''); }}
      >
        <div className="space-y-4">
          <FormTextarea label="Motif de refus optionnel" name="motifRefus" value={refuseReason} onChange={(event) => setRefuseReason(event.target.value)} />
          <InlineError message={actionError} />
          <div className="flex justify-end gap-2">
            <ActionButton type="button" variant="ghost" onClick={() => { setRefuseTarget(null); setRefuseReason(''); }}>Annuler</ActionButton>
            <ActionButton loading={action?.type === 'refuse'} loadingLabel="Refus..." type="button" onClick={() => void handleRefuse()}>Confirmer le refus</ActionButton>
          </div>
        </div>
      </SimpleModal>
    </div>
  );
}
