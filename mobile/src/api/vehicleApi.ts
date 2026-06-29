/*
 * Ce fichier contient les appels API lies aux vehicules du client mobile.
 * Il existe pour afficher, creer, modifier et supprimer les vehicules du client.
 * Il communique avec httpClient.ts, VehiclesScreen et BookingScreen.
 */
import { apiRequest } from './httpClient';
import type { Vehicle, VehiclePayload } from '../types/vehicle';

function unwrapItems<T>(response: T[] | { items?: T[] }): T[] { return Array.isArray(response) ? response : response.items ?? []; }

/** Cette fonction recupere les vehicules du client connecte. */
export async function getVehicles(): Promise<Vehicle[]> {
  return unwrapItems(await apiRequest<Vehicle[] | { items?: Vehicle[] }>('/api/client/vehicles'));
}

export const getClientVehicles = getVehicles;

/** Cette fonction recupere le detail d'un vehicule client. */
export function getVehicle(id: number): Promise<Vehicle> { return apiRequest<Vehicle>(`/api/client/vehicles/${id}`); }

/** Cette fonction cree un vehicule pour le client connecte. */
export function createVehicle(payload: VehiclePayload): Promise<Vehicle> { return apiRequest<Vehicle>('/api/client/vehicles', { method: 'POST', body: payload }); }

/** Cette fonction modifie un vehicule existant. */
export function updateVehicle(id: number, payload: VehiclePayload): Promise<Vehicle> { return apiRequest<Vehicle>(`/api/client/vehicles/${id}`, { method: 'PATCH', body: payload }); }

/** Cette fonction supprime un vehicule du client. */
export function deleteVehicle(id: number): Promise<void> { return apiRequest<void>(`/api/client/vehicles/${id}`, { method: 'DELETE' }); }