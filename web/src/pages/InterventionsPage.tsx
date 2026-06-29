/*
 * Ce fichier declare la page interventions du frontend web GarageFlow.
 * Il existe pour afficher le suivi atelier sous forme de pipeline lisible et garder les actions de statut et notes internes.
 * Il communique avec interventionApi.ts, WorkshopPipeline et le layout garage.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getGarageInterventions, updateInterventionStatus } from '../api/interventionApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { InlineError } from '../components/feedback/InlineError';
import { LoadingState } from '../components/feedback/LoadingState';
import { SuccessMessage } from '../components/feedback/SuccessMessage';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { WorkshopPipeline } from '../components/workshop/WorkshopPipeline';
import type { Intervention } from '../types/intervention';

/** Cette page charge les interventions et permet au garage de piloter leur suivi en atelier. */
export function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [statusDrafts, setStatusDrafts] = useState<Record<number, string>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [openedNotesId, setOpenedNotesId] = useState<number | null>(null);
  const [openedStatusId, setOpenedStatusId] = useState<number | null>(null);
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

  const summary = useMemo(() => {
    const notRecovered = interventions.filter((intervention) => intervention.statutActuel?.code !== 'VEHICULE_RECUPERE');
    return {
      workshopTotal: notRecovered.length,
      ready: interventions.filter((intervention) => intervention.statutActuel?.code === 'VEHICULE_PRET').length,
      repairing: interventions.filter((intervention) => intervention.statutActuel?.code === 'REPARATION_EN_COURS').length,
      waitingClient: interventions.filter((intervention) => intervention.statutActuel?.code === 'ATTENTE_VALIDATION_CLIENT').length,
    };
  }, [interventions]);

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
      setOpenedStatusId(null);
      await loadInterventions();
    } catch (exception) {
      setActionError(exception instanceof Error ? exception.message : 'Impossible de mettre a jour le statut.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Atelier" description="Suivez les vehicules, les statuts de reparation et les notes internes." />
      <SuccessMessage message={success} />
      <InlineError message={actionError} />
      {loading ? <LoadingState label="Chargement des interventions" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && interventions.length === 0 ? <EmptyState title="Aucune intervention" description="Les interventions creees apres confirmation des rendez-vous apparaitront ici." /> : null}
      {!loading && !error && interventions.length > 0 ? (
        <>
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Resume atelier">
            <Card className="p-4" title="Vehicules en atelier"><p className="text-3xl font-bold text-slate-950">{summary.workshopTotal}</p></Card>
            <Card className="p-4" title="Prets a restituer"><p className="text-3xl font-bold text-emerald-700">{summary.ready}</p></Card>
            <Card className="p-4" title="En reparation"><p className="text-3xl font-bold text-purple-700">{summary.repairing}</p></Card>
            <Card className="p-4" title="En attente client"><p className="text-3xl font-bold text-amber-700">{summary.waitingClient}</p></Card>
          </section>
          <WorkshopPipeline
            commentDrafts={commentDrafts}
            interventions={interventions}
            openedNotesId={openedNotesId}
            openedStatusId={openedStatusId}
            statusDrafts={statusDrafts}
            updatingId={updatingId}
            onCancelStatusChange={() => setOpenedStatusId(null)}
            onCommentDraftChange={(interventionId, comment) => setCommentDrafts((current) => ({ ...current, [interventionId]: comment }))}
            onStatusDraftChange={(interventionId, status) => setStatusDrafts((current) => ({ ...current, [interventionId]: status }))}
            onToggleNotes={(interventionId) => setOpenedNotesId((current) => current === interventionId ? null : interventionId)}
            onToggleStatus={(interventionId) => setOpenedStatusId((current) => current === interventionId ? null : interventionId)}
            onUpdateStatus={(intervention) => void handleUpdateStatus(intervention)}
          />
        </>
      ) : null}
    </div>
  );
}
