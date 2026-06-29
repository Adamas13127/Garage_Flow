/*
 * Ce fichier declare le pipeline atelier des interventions GarageFlow.
 * Il existe pour afficher les vehicules par etape de reparation sans ajouter de drag and drop ou de librairie lourde.
 * Il communique avec InterventionsPage, les statuts Doctrine et les actions de mise a jour existantes.
 */
import { InterventionPipelineCard } from './InterventionPipelineCard';
import type { Intervention } from '../../types/intervention';
import { pipelineColumns } from './pipelineColumns';

interface WorkshopPipelineProps {
  interventions: Intervention[];
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

/** Ce composant regroupe les interventions par statut pour donner une vision atelier immediate. */
export function WorkshopPipeline(props: WorkshopPipelineProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[1180px] grid-cols-6 gap-3">
        {pipelineColumns.map((column) => {
          const columnInterventions = props.interventions.filter((intervention) => (intervention.statutActuel?.code ?? 'VEHICULE_DEPOSE') === column.code);
          return (
            <section key={column.code} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-950">{column.title}</h2>
                <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{columnInterventions.length}</span>
              </div>
              <div className="space-y-2">
                {columnInterventions.length === 0 ? <p className="rounded-md border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-500">Aucun vehicule.</p> : null}
                {columnInterventions.map((intervention) => (
                  <InterventionPipelineCard key={intervention.id} {...props} intervention={intervention} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
