/*
 * Ce fichier contient les appels API lies aux interventions du garage connecte.
 * Il existe pour centraliser les endpoints interventions et notes internes cote frontend.
 * Il communique avec le client HTTP, DashboardPage et InterventionsPage.
 */
import { unwrapItems } from './apiResponse';
import { apiRequest } from './httpClient';
import type { Intervention, InterventionNote } from '../types/intervention';

/** Cette fonction recupere les interventions du garage connecte. */
export async function getGarageInterventions(): Promise<Intervention[]> {
  const response = await apiRequest<Intervention[] | { items?: Intervention[] }>('/api/garage/me/interventions');
  return unwrapItems(response);
}

/** Cette fonction change le statut courant d'une intervention. */
export function updateInterventionStatus(id: number, statusCode: string, commentaire?: string): Promise<Intervention> {
  return apiRequest<Intervention>(`/api/garage/me/interventions/${id}/status`, {
    method: 'PATCH',
    body: { statusCode, commentaire: commentaire || undefined },
  });
}

/** Cette fonction recupere les notes internes d'une intervention garage. */
export async function getInterventionNotes(id: number): Promise<InterventionNote[]> {
  const response = await apiRequest<InterventionNote[] | { items?: InterventionNote[] }>(`/api/garage/me/interventions/${id}/notes`);
  return unwrapItems(response);
}

/** Cette fonction cree une note interne non visible par le client. */
export function createInterventionNote(id: number, contenu: string): Promise<InterventionNote> {
  return apiRequest<InterventionNote>(`/api/garage/me/interventions/${id}/notes`, { method: 'POST', body: { contenu } });
}

/** Cette fonction modifie le contenu d'une note interne existante. */
export function updateInterventionNote(interventionId: number, noteId: number, contenu: string): Promise<InterventionNote> {
  return apiRequest<InterventionNote>(`/api/garage/me/interventions/${interventionId}/notes/${noteId}`, { method: 'PATCH', body: { contenu } });
}

/** Cette fonction supprime une note interne quand elle n'est plus utile au garage. */
export function deleteInterventionNote(interventionId: number, noteId: number): Promise<void> {
  return apiRequest<void>(`/api/garage/me/interventions/${interventionId}/notes/${noteId}`, { method: 'DELETE' });
}