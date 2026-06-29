/*
 * Ce fichier contient les appels API lies aux rendez-vous du client mobile.
 * Il existe pour afficher, creer et annuler les rendez-vous client.
 * Il communique avec httpClient.ts, AppointmentsScreen et BookingScreen.
 */
import { apiRequest } from './httpClient';
import type { Appointment, CreateAppointmentPayload } from '../types/appointment';

function unwrapItems<T>(response: T[] | { items?: T[] }): T[] { return Array.isArray(response) ? response : response.items ?? []; }

/** Cette fonction recupere les rendez-vous du client connecte. */
export async function getClientAppointments(): Promise<Appointment[]> {
  return unwrapItems(await apiRequest<Appointment[] | { items?: Appointment[] }>('/api/client/appointments'));
}

/** Cette fonction recupere le detail d'un rendez-vous client. */
export function getClientAppointment(id: number): Promise<Appointment> { return apiRequest<Appointment>(`/api/client/appointments/${id}`); }

/** Cette fonction cree une demande de rendez-vous client. */
export function createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> { return apiRequest<Appointment>('/api/client/appointments', { method: 'POST', body: payload }); }

/** Cette fonction annule un rendez-vous client encore annulable. */
export function cancelAppointment(id: number): Promise<Appointment> { return apiRequest<Appointment>(`/api/client/appointments/${id}/cancel`, { method: 'PATCH' }); }