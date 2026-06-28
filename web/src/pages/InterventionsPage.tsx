/*
 * Ce fichier declare la page interventions du frontend web GarageFlow.
 * Il existe pour afficher le suivi atelier du garage connecte.
 * Il communique avec /api/garage/me/interventions via le client HTTP.
 */
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/httpClient';
import { ErrorMessage } from '../components/feedback/ErrorMessage';
import { LoadingState } from '../components/feedback/LoadingState';
import { Card } from '../components/ui/Card';
import type { Intervention } from '../types/intervention';

/** Cette page liste les interventions et leur statut actuel. */
export function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInterventions() {
      try {
        const response = await apiRequest<{ items: Intervention[] }>('/api/garage/me/interventions');
        setInterventions(response.items);
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
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Interventions</h1>
        <p className="text-sm text-slate-500">Suivi atelier et avancement des reparations.</p>
      </div>
      {loading ? <LoadingState label="Chargement des interventions" /> : null}
      {error ? <ErrorMessage message={error} /> : null}
      {!loading && !error && interventions.length === 0 ? <Card>Aucune intervention pour le moment.</Card> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {interventions.map((intervention) => (
          <Card key={intervention.id} title={`Intervention #${intervention.id}`} description={intervention.client ? `${intervention.client.prenom} ${intervention.client.nom}` : undefined}>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Statut : <span className="font-medium text-slate-950">{intervention.statutActuel?.libelle ?? 'Non renseigne'}</span></p>
              <p>Vehicule : {intervention.vehicle?.marque} {intervention.vehicle?.modele}</p>
              <p>Prestation : {intervention.service?.nom}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}