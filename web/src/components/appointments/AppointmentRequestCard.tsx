/*
 * Ce fichier declare une carte de demande de rendez-vous.
 * Il existe pour mettre en avant les demandes EN_ATTENTE que le garage doit traiter en priorite.
 * Il communique avec AppointmentsPage et les actions accepter/refuser existantes.
 */
import { ActionButton } from '../ui/ActionButton';
import { StatusBadge } from '../ui/StatusBadge';
import type { Appointment } from '../../types/appointment';
import { formatDateTime, formatService, formatUserName, formatVehicle } from '../../utils/format';

interface AppointmentRequestCardProps {
  appointment: Appointment;
  accepting?: boolean;
  refusing?: boolean;
  onAccept: (appointment: Appointment) => void;
  onRefuse: (appointment: Appointment) => void;
}

/** Cette carte transforme une demande client en action claire pour le garage. */
export function AppointmentRequestCard({ appointment, accepting = false, refusing = false, onAccept, onRefuse }: AppointmentRequestCardProps) {
  return (
    <article className="rounded-md border border-amber-200 bg-amber-50/60 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-950">{formatUserName(appointment.client)}</h3>
            <StatusBadge status={appointment.statut} />
          </div>
          <p className="text-sm text-slate-700">{formatVehicle(appointment.vehicle ?? appointment.vehicule)}</p>
          <p className="text-sm text-slate-700">{formatService(appointment.service ?? appointment.prestation)} - {formatDateTime(appointment.dateDebut)}</p>
          {appointment.commentaireClient ? <p className="rounded-md bg-white px-3 py-2 text-sm text-slate-600">{appointment.commentaireClient}</p> : <p className="text-sm text-slate-500">Aucun commentaire client.</p>}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <ActionButton loading={accepting} loadingLabel="Acceptation..." type="button" onClick={() => onAccept(appointment)}>Accepter</ActionButton>
          <ActionButton loading={refusing} type="button" variant="secondary" onClick={() => onRefuse(appointment)}>Refuser</ActionButton>
        </div>
      </div>
    </article>
  );
}
