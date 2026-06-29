/*
 * Ce fichier contient les appels API lies aux prestations du garage connecte.
 * Il existe pour centraliser la creation, modification et desactivation des prestations.
 * Il communique avec GarageSettingsPage et le client HTTP.
 */
import { unwrapItems } from './apiResponse';
import { apiRequest } from './httpClient';
import type { ServicePrestation, ServicePrestationPayload } from '../types/garage';

/** Cette fonction recupere les prestations du garage connecte. */
export async function getMyGarageServices(): Promise<ServicePrestation[]> {
  const response = await apiRequest<ServicePrestation[] | { items?: ServicePrestation[] }>('/api/garage/me/services');
  return unwrapItems(response);
}

/** Cette fonction cree une prestation proposee par le garage. */
export function createServicePrestation(payload: ServicePrestationPayload): Promise<ServicePrestation> {
  return apiRequest<ServicePrestation>('/api/garage/me/services', { method: 'POST', body: payload });
}

/** Cette fonction modifie une prestation existante. */
export function updateServicePrestation(id: number, payload: ServicePrestationPayload): Promise<ServicePrestation> {
  return apiRequest<ServicePrestation>(`/api/garage/me/services/${id}`, { method: 'PATCH', body: payload });
}

/** Cette fonction desactive une prestation sans la supprimer brutalement de l'historique. */
export function disableServicePrestation(id: number): Promise<void> {
  return apiRequest<void>(`/api/garage/me/services/${id}`, { method: 'DELETE' });
}