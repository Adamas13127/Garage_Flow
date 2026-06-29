/*
 * Ce fichier contient les appels API lies aux interventions du garage connecte.
 * Il existe pour centraliser l'endpoint /api/garage/me/interventions cote frontend.
 * Il communique avec le client HTTP, DashboardPage et InterventionsPage.
 */
import { unwrapItems } from './apiResponse';
import { apiRequest } from './httpClient';
import type { Intervention } from '../types/intervention';

/** Cette fonction recupere les interventions du garage connecte. */
export async function getGarageInterventions(): Promise<Intervention[]> {
  const response = await apiRequest<Intervention[] | { items?: Intervention[] }>('/api/garage/me/interventions');
  return unwrapItems(response);
}