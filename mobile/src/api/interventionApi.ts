/*
 * Ce fichier contient les appels API lies aux interventions du client mobile.
 * Il existe pour afficher la liste et le detail du suivi des reparations.
 * Il communique avec httpClient.ts, InterventionsScreen et InterventionDetailScreen.
 */
import { apiRequest } from './httpClient';
import type { Intervention } from '../types/intervention';

function unwrapItems<T>(response: T[] | { items?: T[] }): T[] { return Array.isArray(response) ? response : response.items ?? []; }

/** Cette fonction recupere les interventions du client connecte. */
export async function getClientInterventions(): Promise<Intervention[]> {
  return unwrapItems(await apiRequest<Intervention[] | { items?: Intervention[] }>('/api/client/interventions'));
}

/** Cette fonction recupere le detail d'une intervention pour afficher son suivi complet. */
export function getClientIntervention(id: number): Promise<Intervention> { return apiRequest<Intervention>(`/api/client/interventions/${id}`); }