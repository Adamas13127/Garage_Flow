/*
 * Ce fichier declare la page interventions du frontend web GarageFlow.
 * Il existe pour afficher le suivi atelier du garage connecte.
 * Il communique avec interventionApi.ts et le layout garage.
 */
import { useEffect, useState } from 'react';
import { getGarageInterventions } from '../api/interventionApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { Intervention } from '../types/intervention';
import { formatDateTime, formatService, formatUserName, formatVehicle } from '../utils/format';

/** Cette page charge les interventions et prepare l'espace pour le futur changement de statut. */
export function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInterventions() {
      try {
        setLoading(true);
        setError(null);
        setInterventions(await getGarageInterventions());
      } catch (exception) {
        setError(exception instanceof Error ? exception.message : 'Impossible de charger les interventions.');
      } finally {
        setLoading(false);
      }
    }

    void loadInterventions();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Interventions" description="Suivi atelier et avancement des reparations." />
      {loading ? <LoadingState label="Chargement des interventions" /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && interventions.length === 0 ? <EmptyState title="Aucune intervention" description="Les interventions creees apres confirmation des rendez-vous apparaitront ici." /> : null}
      {!loading && !error && interventions.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {interventions.map((intervention) => (
            <Card key={intervention.id} title={`Intervention #${intervention.id}`} description={formatUserName(intervention.client)}>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <span>Statut actuel</span>
                  <StatusBadge status={intervention.statutActuel?.code} />
                </div>
                <p>Vehicule : <span className="font-medium text-slate-950">{formatVehicle(intervention.vehicle ?? intervention.vehicule)}</span></p>
                <p>Prestation : <span className="font-medium text-slate-950">{formatService(intervention.service ?? intervention.prestation)}</span></p>
                <p>Date creation : <span className="font-medium text-slate-950">{formatDateTime(intervention.createdAt)}</span></p>
                <p>Cloture : <span className="font-medium text-slate-950">{formatDateTime(intervention.closedAt)}</span></p>
                <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-slate-500">
                  Changement de statut prepare pour la prochaine mission.
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}