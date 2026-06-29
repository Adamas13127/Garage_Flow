/*
 * Ce fichier contient les appels API lies au garage connecte.
 * Il existe pour isoler l'endpoint /api/garage/me des composants React.
 * Il communique avec le client HTTP et la page DashboardPage.
 */
import { apiRequest } from './httpClient';
import type { Garage } from '../types/garage';

/** Cette fonction recupere le garage rattache a l'utilisateur connecte. */
export function getMyGarage(): Promise<Garage> {
  return apiRequest<Garage>('/api/garage/me');
}