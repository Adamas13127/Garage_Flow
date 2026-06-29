/*
 * Ce fichier declare la page interventions du frontend web GarageFlow.
 * Il existe pour afficher le suivi atelier, changer les statuts et gerer les notes internes.
 * Il communique avec interventionApi.ts et le layout garage.
 */
import { useCallback, useEffect, useState } from 'react';
import { getGarageInterventions, updateInterventionStatus } from '../api/interventionApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { InlineError } from '../components/feedback/InlineError';
import { LoadingState } from '../components/feedback/LoadingState';
import { SuccessMessage } from '../components/feedback/SuccessMessage';
import { InterventionNotesPanel } from '../components/interventions/InterventionNotesPanel';
import { ActionButton } from '../components/ui/ActionButton';
import { Card } from '../components/ui/Card';
import { FormTextarea } from '../components/ui/FormTextarea';
import { PageHeader } from '../components/ui/PageHeader';
import { Select } from '../components/ui/Select';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { Intervention } from '../types/intervention';
import { formatDateTime, formatService, formatUserName, formatVehicle } from '../utils/format';

const interventionStatusOptions = [
  { value: 'VEHICULE_DEPOSE', label: 'Vehicule depose' },
  { value: 'DIAGNOSTIC_EN_COURS', label: 'Diagnostic en cours' },
  { value: 'ATTENTE_VALIDATION_CLIENT', label: 'Attente validation client' },
  { value: 'REPARATION_EN_COURS', label: 'Reparation en cours' },
  { value: 'VEHICULE_PRET', label: 'Vehicule pret' },
  { value: 'VEHICULE_RECUPERE', label: 'Vehicule recupere' },
];

/** Cette page charge les interventions et permet au garage de piloter leur suivi. */
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
      <PageHeader title="Interventions" description="Suivi atelier, statuts et notes internes." />
      <SuccessMessage message={success} />
      <InlineError message={actionError} />
      {loading ? <LoadingState label="Chargement des interventions" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && interventions.length === 0 ? <EmptyState title="Aucune intervention" description="Les interventions creees apres confirmation des rendez-vous apparaitront ici." /> : null}
      {!loading && !error && interventions.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {interventions.map((intervention) => (
            <Card key={intervention.id} title={`Intervention #${intervention.id}`} description={formatUserName(intervention.client)}>
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <span>Statut actuel</span>
                  <StatusBadge status={intervention.statutActuel?.code} />
                </div>
                <p>Vehicule : <span className="font-medium text-slate-950">{formatVehicle(intervention.vehicle ?? intervention.vehicule)}</span></p>
                <p>Prestation : <span className="font-medium text-slate-950">{formatService(intervention.service ?? intervention.prestation)}</span></p>
                <p>Date creation : <span className="font-medium text-slate-950">{formatDateTime(intervention.createdAt)}</span></p>
                <p>Cloture : <span className="font-medium text-slate-950">{formatDateTime(intervention.closedAt)}</span></p>

                <div className="space-y-3 rounded-md border border-slate-200 bg-white p-3">
                  <Select
                    label="Nouveau statut"
                    name={`status-${intervention.id}`}
                    options={interventionStatusOptions}
                    value={statusDrafts[intervention.id] ?? intervention.statutActuel?.code ?? 'VEHICULE_DEPOSE'}
                    onChange={(event) => setStatusDrafts((current) => ({ ...current, [intervention.id]: event.target.value }))}
                  />
                  <FormTextarea
                    label="Commentaire optionnel"
                    name={`commentaire-${intervention.id}`}
                    value={commentDrafts[intervention.id] ?? ''}
                    onChange={(event) => setCommentDrafts((current) => ({ ...current, [intervention.id]: event.target.value }))}
                  />
                  <ActionButton loading={updatingId === intervention.id} loadingLabel="Mise a jour..." type="button" onClick={() => void handleUpdateStatus(intervention)}>
                    Mettre a jour le statut
                  </ActionButton>
                </div>

                <ActionButton type="button" variant="secondary" onClick={() => setOpenedNotesId((current) => current === intervention.id ? null : intervention.id)}>
                  {openedNotesId === intervention.id ? 'Masquer notes internes' : 'Voir notes internes'}
                </ActionButton>
                {openedNotesId === intervention.id ? <InterventionNotesPanel interventionId={intervention.id} /> : null}
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}