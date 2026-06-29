/*
 * Ce fichier declare une carte large d'intervention pour la liste Atelier.
 * Il existe pour remplacer les cartes etroites du kanban par une lecture verticale plus confortable.
 * Il communique avec InterventionsPage, InterventionDetailPanel, InterventionNotesPanel et les actions de statut existantes.
 */
import { InterventionNotesPanel } from './InterventionNotesPanel';
import { InterventionDetailPanel } from './InterventionDetailPanel';
import { interventionSteps } from './interventionSteps';
import { ActionButton } from '../ui/ActionButton';
import { FormTextarea } from '../ui/FormTextarea';
import { Select } from '../ui/Select';
import { StatusBadge } from '../ui/StatusBadge';
import type { Intervention } from '../../types/intervention';
import { formatDateTime, formatService, formatUserName, formatVehicle } from '../../utils/format';

interface InterventionListCardProps {
  intervention: Intervention;
  detailOpen: boolean;
  statusOpen: boolean;
  notesOpen: boolean;
  updating: boolean;
  statusDraft: string;
  commentDraft: string;
  onToggleDetail: (interventionId: number) => void;
  onToggleStatus: (interventionId: number) => void;
  onToggleNotes: (interventionId: number) => void;
  onCancelStatus: () => void;
  onStatusDraftChange: (interventionId: number, status: string) => void;
  onCommentDraftChange: (interventionId: number, comment: string) => void;
  onUpdateStatus: (intervention: Intervention) => void;
}

/** Cette carte donne une vision rapide d'un vehicule et ouvre les details seulement a la demande. */
export function InterventionListCard({ intervention, detailOpen, statusOpen, notesOpen, updating, statusDraft, commentDraft, onToggleDetail, onToggleStatus, onToggleNotes, onCancelStatus, onStatusDraftChange, onCommentDraftChange, onUpdateStatus }: InterventionListCardProps) {
  const currentStatus = intervention.statutActuel?.code ?? 'VEHICULE_DEPOSE';

  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={currentStatus} />
            <span className="text-xs font-medium text-slate-500">Intervention #{intervention.id}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{formatVehicle(intervention.vehicle ?? intervention.vehicule)}</h2>
            <p className="mt-1 text-sm text-slate-600">{formatUserName(intervention.client)} - {formatService(intervention.service ?? intervention.prestation)}</p>
          </div>
          <div className="grid gap-2 text-sm text-slate-500 sm:grid-cols-2 xl:grid-cols-3">
            <p>Creee le {formatDateTime(intervention.createdAt)}</p>
            {currentStatus === 'VEHICULE_RECUPERE' ? <p>Cloturee le {formatDateTime(intervention.closedAt)}</p> : null}
            {intervention.appointment?.dateDebut ? <p>RDV : {formatDateTime(intervention.appointment.dateDebut)}</p> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <ActionButton type="button" variant="secondary" onClick={() => onToggleDetail(intervention.id)}>{detailOpen ? 'Masquer detail' : 'Voir detail'}</ActionButton>
          <ActionButton type="button" variant="secondary" onClick={() => onToggleStatus(intervention.id)}>{statusOpen ? 'Fermer statut' : 'Changer statut'}</ActionButton>
          <ActionButton type="button" variant="ghost" onClick={() => onToggleNotes(intervention.id)}>{notesOpen ? 'Masquer notes' : 'Notes'}</ActionButton>
        </div>
      </div>

      {detailOpen ? <InterventionDetailPanel intervention={intervention} /> : null}

      {statusOpen ? (
        <section className="mt-4 rounded-md border border-sky-100 bg-sky-50/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-950">Changer le statut</h3>
          <div className="grid gap-3 lg:grid-cols-[240px_1fr_auto] lg:items-end">
            <Select
              label="Nouveau statut"
              name={`status-${intervention.id}`}
              options={interventionSteps.map((step) => ({ value: step.code, label: step.label }))}
              value={statusDraft}
              onChange={(event) => onStatusDraftChange(intervention.id, event.target.value)}
            />
            <FormTextarea
              label="Commentaire optionnel"
              name={`commentaire-${intervention.id}`}
              value={commentDraft}
              onChange={(event) => onCommentDraftChange(intervention.id, event.target.value)}
            />
            <div className="flex gap-2 lg:flex-col">
              <ActionButton loading={updating} loadingLabel="Mise a jour..." type="button" onClick={() => onUpdateStatus(intervention)}>Confirmer</ActionButton>
              <ActionButton type="button" variant="ghost" onClick={onCancelStatus}>Annuler</ActionButton>
            </div>
          </div>
        </section>
      ) : null}

      {notesOpen ? (
        <section className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Notes internes - non visibles par le client</p>
          <InterventionNotesPanel interventionId={intervention.id} />
        </section>
      ) : null}
    </article>
  );
}
