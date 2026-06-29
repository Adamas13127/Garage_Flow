/*
 * Ce fichier contient les appels API lies aux rendez-vous du garage connecte.
 * Il existe pour centraliser l'endpoint /api/garage/me/appointments cote frontend.
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