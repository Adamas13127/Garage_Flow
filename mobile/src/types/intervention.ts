/*
 * Ce fichier declare les types intervention utilises par l'application mobile GarageFlow.
 * Il existe pour afficher le suivi des reparations cote client.
 * Il communique avec interventionApi.ts et InterventionsScreen.
 */
import type { Appointment } from './appointment';

export interface InterventionStatus { code: string; libelle?: string | null; }

export interface Intervention {
  id: number;
  createdAt?: string | null;
  closedAt?: string | null;
  statutActuel?: InterventionStatus | null;
  appointment?: Appointment | null;
}