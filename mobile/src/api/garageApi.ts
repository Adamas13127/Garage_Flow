/*
 * Ce fichier contient les appels API publics lies aux garages.
 * Il existe pour afficher les garages, prestations et creneaux disponibles au client mobile.
 * Il communique avec GaragesScreen, GarageDetailScreen et BookingScreen.
 */
import { apiRequest } from './httpClient';
import type { AvailableSlot, Garage, ServicePrestation } from '../types/garage';

/** Cette fonction normalise les reponses liste du backend. */
function unwrapItems<T>(response: T[] | { items?: T[] }): T[] { return Array.isArray(response) ? response : response.items ?? []; }

export async function getGarages(): Promise<Garage[]> { return unwrapItems(await apiRequest<Garage[] | { items?: Garage[] }>('/api/garages')); }

export function getGarage(id: number): Promise<Garage> { return apiRequest<Garage>(`/api/garages/${id}`); }

export async function getGarageServices(id: number): Promise<ServicePrestation[]> {
  return unwrapItems(await apiRequest<ServicePrestation[] | { items?: ServicePrestation[] }>(`/api/garages/${id}/services`));
}

/** Cette fonction recupere les creneaux disponibles pour un garage, une prestation et une date. */
export async function getAvailableSlots(garageId: number, serviceId: number, date: string): Promise<AvailableSlot[]> {
  const query = `serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`;
  return unwrapItems(await apiRequest<AvailableSlot[] | { items?: AvailableSlot[] }>(`/api/garages/${garageId}/available-slots?${query}`));
}