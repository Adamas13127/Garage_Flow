/*
 * Ce fichier declare la page des rendez-vous garage du frontend GarageFlow.
 * Il existe pour afficher les demandes et permettre au garage d'accepter ou refuser un rendez-vous.
 * Il communique avec appointmentApi.ts et le layout garage.
 */
import { useCallback, useEffect, useState } from 'react';
import { acceptAppointment, getGarageAppointments, refuseAppointment } from '../api/appointmentApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { InlineError } from '../components/feedback/InlineError';
import { LoadingState } from '../components/feedback/LoadingState';
import { SuccessMessage } from '../components/feedback/SuccessMessage';
import { ActionButton } from '../components/ui/ActionButton';
import { DataTable } from '../components/ui/DataTable';
import { FormTextarea } from '../components/ui/FormTextarea';
import { PageHeader } from '../components/ui/PageHeader';
import { SimpleModal } from '../components/ui/SimpleModal';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { Appointment } from '../types/appointment';
import { formatDateTime, formatService, formatUserName, formatVehicle } from '../utils/format';

interface PendingAction {
  appointmentId: number;
  type: 'accept' | 'refuse';
}

/** Cette page charge les rendez-vous du garage et gere les actions simples de decision. */
export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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
      <PageHeader title="Rendez-vous" description="Demandes et rendez-vous du garage connecte." />
      <SuccessMessage message={success} />
      <InlineError message={actionError} />
      {loading ? <LoadingState label="Chargement des rendez-vous" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && appointments.length === 0 ? <EmptyState title="Aucun rendez-vous" description="Les demandes clients apparaitront ici des qu'elles seront creees." /> : null}
      {!loading && !error && appointments.length > 0 ? (
        <DataTable
          columns={[
            { key: 'client', header: 'Client', render: (appointment) => <span className="font-medium text-slate-950">{formatUserName(appointment.client)}</span> },
            { key: 'vehicle', header: 'Vehicule', render: (appointment) => formatVehicle(appointment.vehicle ?? appointment.vehicule) },
            { key: 'service', header: 'Prestation', render: (appointment) => formatService(appointment.service ?? appointment.prestation) },
            { key: 'date', header: 'Date debut', render: (appointment) => formatDateTime(appointment.dateDebut) },
            { key: 'status', header: 'Statut', render: (appointment) => <StatusBadge status={appointment.statut} /> },
            { key: 'comment', header: 'Commentaire', render: (appointment) => appointment.commentaireClient ?? <span className="text-slate-400">Aucun</span> },
            {
              key: 'actions',
              header: 'Actions',
              render: (appointment) => appointment.statut === 'EN_ATTENTE' ? (
                <div className="flex flex-wrap gap-2">
                  <ActionButton loading={action?.appointmentId === appointment.id && action.type === 'accept'} loadingLabel="Acceptation..." type="button" onClick={() => void handleAccept(appointment)}>
                    Accepter
                  </ActionButton>
                  <ActionButton loading={action?.appointmentId === appointment.id && action.type === 'refuse'} type="button" variant="secondary" onClick={() => { setActionError(null); setRefuseTarget(appointment); }}>
                    Refuser
                  </ActionButton>
                </div>
              ) : <span className="text-sm text-slate-400">Aucune action</span>,
            },
          ]}
          getKey={(appointment) => appointment.id}
          items={appointments}
        />
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