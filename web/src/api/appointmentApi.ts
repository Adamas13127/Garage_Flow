/*
 * Ce fichier contient les appels API lies aux rendez-vous du garage connecte.
 * Il existe pour centraliser les endpoints rendez-vous cote frontend.
 * Il communique avec le client HTTP, DashboardPage et AppointmentsPage.
 */
import { unwrapItems } from './apiResponse';
import { apiRequest } from './httpClient';
import type { Appointment } from '../types/appointment';

/** Cette fonction recupere les rendez-vous du garage connecte. */
export async function getGarageAppointments(): Promise<Appointment[]> {
  const response = await apiRequest<Appointment[] | { items?: Appointment[] }>('/api/garage/me/appointments');
  return unwrapItems(response);
}

/** Cette fonction accepte un rendez-vous en attente depuis l'interface garage. */
export function acceptAppointment(id: number): Promise<Appointment> {
  return apiRequest<Appointment>(`/api/garage/me/appointments/${id}/accept`, { method: 'PATCH' });
}

/** Cette fonction refuse un rendez-vous avec un motif optionnel explique par le garage. */
export function refuseAppointment(id: number, motifRefus?: string): Promise<Appointment> {
  return apiRequest<Appointment>(`/api/garage/me/appointments/${id}/refuse`, {
    method: 'PATCH',
    body: motifRefus ? { motifRefus } : {},
  });
}