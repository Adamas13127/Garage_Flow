/*
 * Ce fichier declare le panneau de detail d'une intervention atelier.
 * Il existe pour afficher les informations completes et la timeline seulement quand le gerant les demande.
 * Il communique avec InterventionListCard et InterventionTimeline.
 */
import type { Intervention } from '../../types/intervention';
import { formatDateTime, formatService, formatUserName, formatVehicle } from '../../utils/format';
import { StatusBadge } from '../ui/StatusBadge';
import { InterventionTimeline } from './InterventionTimeline';

interface InterventionDetailPanelProps {
  intervention: Intervention;
}

/** Ce panneau detaille une intervention sans surcharger toutes les cartes de la liste. */
export function InterventionDetailPanel({ intervention }: InterventionDetailPanelProps) {
  const appointment = intervention.appointment;

  return (
    <section className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3 text-sm text-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-950">Detail intervention #{intervention.id}</h3>
            <StatusBadge status={intervention.statutActuel?.code} />
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div><dt className="text-xs font-semibold uppercase text-slate-500">Client</dt><dd>{formatUserName(intervention.client)}</dd></div>
            <div><dt className="text-xs font-semibold uppercase text-slate-500">Vehicule</dt><dd>{formatVehicle(intervention.vehicle ?? intervention.vehicule)}</dd></div>
            <div><dt className="text-xs font-semibold uppercase text-slate-500">Prestation</dt><dd>{formatService(intervention.service ?? intervention.prestation)}</dd></div>
            <div><dt className="text-xs font-semibold uppercase text-slate-500">Creation</dt><dd>{formatDateTime(intervention.createdAt)}</dd></div>
            <div><dt className="text-xs font-semibold uppercase text-slate-500">Cloture</dt><dd>{formatDateTime(intervention.closedAt)}</dd></div>
            <div><dt className="text-xs font-semibold uppercase text-slate-500">Rendez-vous lie</dt><dd>{appointment?.dateDebut ? formatDateTime(appointment.dateDebut) : 'Non renseigne'}</dd></div>
          </dl>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Informations disponibles</p>
            <p className="mt-1 rounded-md bg-white p-3 text-sm text-slate-600">{intervention.notesResume ?? 'Aucun commentaire supplementaire dans la reponse API.'}</p>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-950">Timeline reparation</h4>
          <InterventionTimeline currentStatus={intervention.statutActuel?.code} />
        </div>
      </div>
    </section>
  );
}
