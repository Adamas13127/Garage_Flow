/*
 * Ce fichier declare une liste de planning groupee par jour.
 * Il existe pour remplacer une lecture tableur par un planning garage simple et lisible.
 * Il communique avec DashboardPage et AppointmentsPage qui lui fournissent des rendez-vous tries.
 */
import type { Appointment } from '../../types/appointment';
import { formatService, formatUserName, formatVehicle } from '../../utils/format';
import { StatusBadge } from '../ui/StatusBadge';

interface DayScheduleProps {
  appointments: Appointment[];
  emptyTitle: string;
}

/** Cette fonction affiche la date d'un rendez-vous comme titre de groupe. */
function formatDay(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(value));
}

/** Cette fonction affiche uniquement l'heure pour lire le planning rapidement. */
function formatHour(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

/** Cette liste regroupe les rendez-vous par date pour simuler un planning MVP sans librairie calendrier. */
export function DaySchedule({ appointments, emptyTitle }: DayScheduleProps) {
  if (appointments.length === 0) {
    return <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">{emptyTitle}</p>;
  }

  const grouped = appointments.reduce<Record<string, Appointment[]>>((accumulator, appointment) => {
    const key = new Date(appointment.dateDebut).toISOString().slice(0, 10);
    accumulator[key] = [...(accumulator[key] ?? []), appointment];
    return accumulator;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([day, dayAppointments]) => (
        <section key={day} className="rounded-md border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold capitalize text-slate-950">{formatDay(dayAppointments[0].dateDebut)}</h3>
          <div className="mt-3 space-y-2">
            {dayAppointments.map((appointment) => (
              <article key={appointment.id} className="grid gap-2 rounded-md bg-slate-50 p-3 text-sm md:grid-cols-[70px_1fr_auto] md:items-center">
                <span className="font-semibold text-sky-800">{formatHour(appointment.dateDebut)}</span>
                <span className="text-slate-700">{formatService(appointment.service ?? appointment.prestation)} - {formatUserName(appointment.client)} - {formatVehicle(appointment.vehicle ?? appointment.vehicule)}</span>
                <StatusBadge status={appointment.statut} />
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
