/*
 * Ce fichier contient les appels API lies aux interventions du client mobile.
 * Il existe pour afficher le suivi des reparations dans InterventionsScreen.
 * Il communique avec httpClient.ts.
 */
import { apiRequest } from './httpClient';
import type { Intervention } from '../types/intervention';

function unwrapItems<T>(response: T[] | { items?: T[] }): T[] { return Array.isArray(response) ? response : response.items ?? []; }

/** Cette fonction recupere les interventions du client connecte. */
export async function getClientInterventions(): Promise<Intervention[]> {
  return unwrapItems(await apiRequest<Intervention[] | { items?: Intervention[] }>('/api/client/interventions'));
}