/*
 * Ce fichier contient les appels API lies aux rendez-vous du client mobile.
 * Il existe pour afficher les rendez-vous dans AppointmentsScreen.
 * Il communique avec httpClient.ts.
 */
import { apiRequest } from './httpClient';
import type { Appointment } from '../types/appointment';

function unwrapItems<T>(response: T[] | { items?: T[] }): T[] { return Array.isArray(response) ? response : response.items ?? []; }

/** Cette fonction recupere les rendez-vous du client connecte. */
export async function getClientAppointments(): Promise<Appointment[]> {
  return unwrapItems(await apiRequest<Appointment[] | { items?: Appointment[] }>('/api/client/appointments'));
}