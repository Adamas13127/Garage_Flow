/*
 * Ce fichier contient les appels API lies aux indisponibilites du garage.
 * Il existe pour centraliser la creation, modification et suppression des indisponibilites.
 * Il communique avec GarageSettingsPage et le client HTTP.
 */
import { unwrapItems } from './apiResponse';
import { apiRequest } from './httpClient';
import type { Unavailability, UnavailabilityPayload } from '../types/garage';

/** Cette fonction recupere les indisponibilites du garage connecte. */
export async function getUnavailabilities(): Promise<Unavailability[]> {
  const response = await apiRequest<Unavailability[] | { items?: Unavailability[] }>('/api/garage/me/unavailabilities');
  return unwrapItems(response);
}

/** Cette fonction cree une indisponibilite ponctuelle. */
export function createUnavailability(payload: UnavailabilityPayload): Promise<Unavailability> {
  return apiRequest<Unavailability>('/api/garage/me/unavailabilities', { method: 'POST', body: payload });
}

/** Cette fonction modifie une indisponibilite existante. */
export function updateUnavailability(id: number, payload: UnavailabilityPayload): Promise<Unavailability> {
  return apiRequest<Unavailability>(`/api/garage/me/unavailabilities/${id}`, { method: 'PATCH', body: payload });
}

/** Cette fonction supprime une indisponibilite qui n'est plus utile. */
export function deleteUnavailability(id: number): Promise<void> {
  return apiRequest<void>(`/api/garage/me/unavailabilities/${id}`, { method: 'DELETE' });
}