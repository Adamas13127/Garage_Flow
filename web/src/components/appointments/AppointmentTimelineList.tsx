/*
 * Ce fichier declare une liste compacte de rendez-vous historiques.
 * Il existe pour garder les rendez-vous termines, refuses ou annules accessibles sans voler la priorite au planning.
 * Il communique avec AppointmentsPage et le composant StatusBadge.
 */
import type { Appointment } from '../../types/appointment';
import { formatDateTime, formatService, formatUserName, formatVehicle } from '../../utils/format';
import { StatusBadge } from '../ui/StatusBadge';

interface AppointmentTimelineListProps {
  appointments: Appointment[];
}

/** Cette liste compacte garde une trace de l'historique sans revenir a un grand tableau admin. */
export function AppointmentTimelineList({ appointments }: AppointmentTimelineListProps) {
  if (appointments.length === 0) {
    return <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Aucun rendez-vous historique pour le moment.</p>;
  }

  return (
    <div className="divide-y divide-slate-100 rounded-md border border-slate-200 bg-white">
      {appointments.map((appointment) => (
        <article key={appointment.id} className="grid gap-2 p-3 text-sm md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="font-medium text-slate-950">{formatUserName(appointment.client)} - {formatService(appointment.service ?? appointment.prestation)}</p>
            <p className="text-slate-500">{formatDateTime(appointment.dateDebut)} - {formatVehicle(appointment.vehicle ?? appointment.vehicule)}</p>
          </div>
          <StatusBadge status={appointment.statut} />
        </article>
      ))}
    </div>
  );
}
