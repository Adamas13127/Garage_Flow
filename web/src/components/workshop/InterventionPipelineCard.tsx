/*
 * Ce fichier declare une carte d'intervention dans le pipeline atelier.
 * Il existe pour afficher les informations utiles d'un vehicule en reparation et garder les actions de statut et de notes.
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
  updatingId: number | null;
  onStatusDraftChange: (interventionId: number, status: string) => void;
  onCommentDraftChange: (interventionId: number, comment: string) => void;
  onUpdateStatus: (intervention: Intervention) => void;
  onToggleNotes: (interventionId: number) => void;
}

/** Cette carte montre un vehicule en atelier avec ses actions sans quitter le pipeline. */
export function InterventionPipelineCard({ intervention, statusDrafts, commentDrafts, openedNotesId, updatingId, onStatusDraftChange, onCommentDraftChange, onUpdateStatus, onToggleNotes }: InterventionPipelineCardProps) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
      <div className="space-y-2">
        <StatusBadge status={intervention.statutActuel?.code} />
        <h3 className="text-sm font-semibold text-slate-950">{formatVehicle(intervention.vehicle ?? intervention.vehicule)}</h3>
        <p className="text-xs text-slate-600">{formatUserName(intervention.client)}</p>
        <p className="text-xs text-slate-600">{formatService(intervention.service ?? intervention.prestation)}</p>
        <p className="text-xs text-slate-500">Creee le {formatDateTime(intervention.createdAt)}</p>
      </div>

      <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
        <Select
          label="Nouveau statut"
          name={`status-${intervention.id}`}
          options={pipelineColumns.map((column) => ({ value: column.code, label: column.title }))}
          value={statusDrafts[intervention.id] ?? intervention.statutActuel?.code ?? 'VEHICULE_DEPOSE'}
          onChange={(event) => onStatusDraftChange(intervention.id, event.target.value)}
        />
        <FormTextarea
          label="Commentaire optionnel"
          name={`commentaire-${intervention.id}`}
          value={commentDrafts[intervention.id] ?? ''}
          onChange={(event) => onCommentDraftChange(intervention.id, event.target.value)}
        />
        <ActionButton className="w-full" loading={updatingId === intervention.id} loadingLabel="Mise a jour..." type="button" onClick={() => onUpdateStatus(intervention)}>
          Mettre a jour
        </ActionButton>
        <ActionButton className="w-full" type="button" variant="secondary" onClick={() => onToggleNotes(intervention.id)}>
          {openedNotesId === intervention.id ? 'Masquer notes' : 'Notes internes'}
        </ActionButton>
      </div>

      {openedNotesId === intervention.id ? <div className="mt-3"><InterventionNotesPanel interventionId={intervention.id} /></div> : null}
    </article>
  );
}
