/*
 * Ce fichier declare une carte d'intervention dans le pipeline atelier.
 * Il existe pour afficher une lecture rapide d'un vehicule et ouvrir les actions seulement quand le garage les demande.
 * Il communique avec WorkshopPipeline, InterventionsPage et InterventionNotesPanel.
 */
import { InterventionNotesPanel } from '../interventions/InterventionNotesPanel';
import { ActionButton } from '../ui/ActionButton';
import { FormTextarea } from '../ui/FormTextarea';
import { Select } from '../ui/Select';
import { StatusBadge } from '../ui/StatusBadge';
import type { Intervention } from '../../types/intervention';
import { formatDateTime, formatService, formatUserName, formatVehicle } from '../../utils/format';
import { pipelineColumns } from './pipelineColumns';

interface InterventionPipelineCardProps {
  intervention: Intervention;
  statusDrafts: Record<number, string>;
  commentDrafts: Record<number, string>;
  openedNotesId: number | null;
  openedStatusId: number | null;
  updatingId: number | null;
  onStatusDraftChange: (interventionId: number, status: string) => void;
  onCommentDraftChange: (interventionId: number, comment: string) => void;
  onUpdateStatus: (intervention: Intervention) => void;
  onToggleNotes: (interventionId: number) => void;
  onToggleStatus: (interventionId: number) => void;
  onCancelStatusChange: () => void;
}

/** Cette carte montre d'abord l'essentiel, puis les actions de statut ou notes au clic. */
export function InterventionPipelineCard({ intervention, statusDrafts, commentDrafts, openedNotesId, openedStatusId, updatingId, onStatusDraftChange, onCommentDraftChange, onUpdateStatus, onToggleNotes, onToggleStatus, onCancelStatusChange }: InterventionPipelineCardProps) {
  const statusPanelOpen = openedStatusId === intervention.id;
  const notesOpen = openedNotesId === intervention.id;
  const currentStatus = intervention.statutActuel?.code ?? 'VEHICULE_DEPOSE';

  return (
    <article className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
      <div className="space-y-2">
        <StatusBadge status={currentStatus} />
        <h3 className="text-sm font-semibold leading-5 text-slate-950">{formatVehicle(intervention.vehicle ?? intervention.vehicule)}</h3>
        <div className="space-y-0.5 text-xs text-slate-600">
          <p>{formatUserName(intervention.client)}</p>
          <p>{formatService(intervention.service ?? intervention.prestation)}</p>
          <p>Creee le {formatDateTime(intervention.createdAt)}</p>
          {currentStatus === 'VEHICULE_RECUPERE' ? <p>Cloturee le {formatDateTime(intervention.closedAt)}</p> : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
        <ActionButton type="button" variant="secondary" onClick={() => onToggleStatus(intervention.id)}>
          {statusPanelOpen ? 'Fermer' : 'Changer statut'}
        </ActionButton>
        <ActionButton type="button" variant="ghost" onClick={() => onToggleNotes(intervention.id)}>
          {notesOpen ? 'Masquer notes' : 'Notes'}
        </ActionButton>
      </div>

      {statusPanelOpen ? (
        <div className="mt-3 space-y-3 rounded-md border border-sky-100 bg-sky-50/60 p-3">
          <Select
            label="Nouveau statut"
            name={`status-${intervention.id}`}
            options={pipelineColumns.map((column) => ({ value: column.code, label: column.title }))}
            value={statusDrafts[intervention.id] ?? currentStatus}
            onChange={(event) => onStatusDraftChange(intervention.id, event.target.value)}
          />
          <FormTextarea
            label="Commentaire optionnel"
            name={`commentaire-${intervention.id}`}
            value={commentDrafts[intervention.id] ?? ''}
            onChange={(event) => onCommentDraftChange(intervention.id, event.target.value)}
          />
          <div className="flex flex-wrap justify-end gap-2">
            <ActionButton type="button" variant="ghost" onClick={onCancelStatusChange}>Annuler</ActionButton>
            <ActionButton loading={updatingId === intervention.id} loadingLabel="Mise a jour..." type="button" onClick={() => onUpdateStatus(intervention)}>
              Confirmer
            </ActionButton>
          </div>
        </div>
      ) : null}

      {notesOpen ? (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Notes internes - non visibles par le client</p>
          <InterventionNotesPanel interventionId={intervention.id} />
        </div>
      ) : null}
    </article>
  );
}
