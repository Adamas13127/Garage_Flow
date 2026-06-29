/*
 * Ce fichier declare la page interventions du frontend web GarageFlow.
 * Il existe pour afficher le suivi atelier sous forme de pipeline et garder les actions de statut et notes internes.
 * Il communique avec interventionApi.ts, WorkshopPipeline et le layout garage.
 */
import { useCallback, useEffect, useState } from 'react';
import { getGarageInterventions, updateInterventionStatus } from '../api/interventionApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { InlineError } from '../components/feedback/InlineError';
import { LoadingState } from '../components/feedback/LoadingState';
import { SuccessMessage } from '../components/feedback/SuccessMessage';
import { PageHeader } from '../components/ui/PageHeader';
import { WorkshopPipeline } from '../components/workshop/WorkshopPipeline';
import type { Intervention } from '../types/intervention';

/** Cette page charge les interventions et permet au garage de piloter leur suivi en atelier. */
export function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [statusDrafts, setStatusDrafts] = useState<Record<number, string>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [openedNotesId, setOpenedNotesId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadInterventions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedInterventions = await getGarageInterventions();
      setInterventions(loadedInterventions);
      setStatusDrafts(Object.fromEntries(loadedInterventions.map((intervention) => [intervention.id, intervention.statutActuel?.code ?? 'VEHICULE_DEPOSE'])));
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Impossible de charger les interventions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInterventions();
  }, [loadInterventions]);

  async function handleUpdateStatus(intervention: Intervention) {
    const statusCode = statusDrafts[intervention.id] ?? intervention.statutActuel?.code ?? 'VEHICULE_DEPOSE';
    const commentaire = commentDrafts[intervention.id]?.trim();

    try {
      setUpdatingId(intervention.id);
      setActionError(null);
      setSuccess(null);
      await updateInterventionStatus(intervention.id, statusCode, commentaire || undefined);
      setSuccess('Le statut de l intervention a ete mis a jour.');
      setCommentDrafts((current) => ({ ...current, [intervention.id]: '' }));
      await loadInterventions();
    } catch (exception) {
      setActionError(exception instanceof Error ? exception.message : 'Impossible de mettre a jour le statut.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Atelier" description="Pipeline des vehicules, statuts de reparation et notes internes." />
      <SuccessMessage message={success} />
      <InlineError message={actionError} />
      {loading ? <LoadingState label="Chargement des interventions" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && interventions.length === 0 ? <EmptyState title="Aucune intervention" description="Les interventions creees apres confirmation des rendez-vous apparaitront ici." /> : null}
      {!loading && !error && interventions.length > 0 ? (
        <WorkshopPipeline
          commentDrafts={commentDrafts}
          interventions={interventions}
          openedNotesId={openedNotesId}
          statusDrafts={statusDrafts}
          updatingId={updatingId}
          onCommentDraftChange={(interventionId, comment) => setCommentDrafts((current) => ({ ...current, [interventionId]: comment }))}
          onStatusDraftChange={(interventionId, status) => setStatusDrafts((current) => ({ ...current, [interventionId]: status }))}
          onToggleNotes={(interventionId) => setOpenedNotesId((current) => current === interventionId ? null : interventionId)}
          onUpdateStatus={(intervention) => void handleUpdateStatus(intervention)}
        />
      ) : null}
    </div>
  );
}
