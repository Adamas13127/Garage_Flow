/*
 * Ce fichier contient les appels API lies aux vehicules du client mobile.
 * Il existe pour afficher la liste des vehicules dans VehiclesScreen.
 * Il communique avec httpClient.ts.
 */
import { apiRequest } from './httpClient';
import type { Vehicle } from '../types/vehicle';

function unwrapItems<T>(response: T[] | { items?: T[] }): T[] { return Array.isArray(response) ? response : response.items ?? []; }

/** Cette fonction recupere les vehicules du client connecte. */
export async function getClientVehicles(): Promise<Vehicle[]> {
  return unwrapItems(await apiRequest<Vehicle[] | { items?: Vehicle[] }>('/api/client/vehicles'));
}