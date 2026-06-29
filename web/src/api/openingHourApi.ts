/*
 * Ce fichier contient les appels API lies aux horaires d'ouverture du garage.
 * Il existe pour centraliser la creation, modification et desactivation des plages horaires.
 * Il communique avec GarageSettingsPage et le client HTTP.
 */
import { unwrapItems } from './apiResponse';
import { apiRequest } from './httpClient';
import type { OpeningHour, OpeningHourPayload } from '../types/garage';

/** Cette fonction recupere les horaires du garage connecte. */
export async function getOpeningHours(): Promise<OpeningHour[]> {
  const response = await apiRequest<OpeningHour[] | { items?: OpeningHour[] }>('/api/garage/me/opening-hours');
  return unwrapItems(response);
}

/** Cette fonction cree une plage horaire d'ouverture. */
export function createOpeningHour(payload: OpeningHourPayload): Promise<OpeningHour> {
  return apiRequest<OpeningHour>('/api/garage/me/opening-hours', { method: 'POST', body: payload });
}

/** Cette fonction modifie une plage horaire d'ouverture. */
export function updateOpeningHour(id: number, payload: OpeningHourPayload): Promise<OpeningHour> {
  return apiRequest<OpeningHour>(`/api/garage/me/opening-hours/${id}`, { method: 'PATCH', body: payload });
}

/** Cette fonction desactive une plage horaire. */
export function disableOpeningHour(id: number): Promise<void> {
  return apiRequest<void>(`/api/garage/me/opening-hours/${id}`, { method: 'DELETE' });
}