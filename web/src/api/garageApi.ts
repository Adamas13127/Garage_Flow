/*
 * Ce fichier contient les appels API lies au garage connecte.
 * Il existe pour isoler les endpoints /api/garage/me des composants React.
 * Il communique avec le client HTTP, DashboardPage et GarageSettingsPage.
 */
import { apiRequest } from './httpClient';
import type { Garage, GaragePayload } from '../types/garage';

/** Cette fonction recupere le garage rattache a l'utilisateur connecte. */
export function getMyGarage(): Promise<Garage> {
  return apiRequest<Garage>('/api/garage/me');
}

/** Cette fonction met a jour les informations principales du garage connecte. */
export function updateMyGarage(payload: GaragePayload): Promise<Garage> {
  return apiRequest<Garage>('/api/garage/me', { method: 'PATCH', body: payload });
}