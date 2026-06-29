/*
 * Ce fichier declare les types d'intervention utilises par le frontend garage.
 * Il existe pour afficher le suivi atelier dans l'application web.
 * Il communique avec InterventionsPage, DashboardPage et interventionApi.ts.
 */
import type { User } from './auth';
import type { ServiceSummary, VehicleSummary } from './appointment';

export interface InterventionStatus {
  code: string;
  libelle?: string | null;
  ordreAffichage?: number;
  visibleClient?: boolean;
}

/** Ce type represente une intervention resumee pour les listes garage. */
export interface Intervention {
  id: number;
  createdAt: string;
  closedAt?: string | null;
  notesResume?: string | null;
  statutActuel?: InterventionStatus | null;
  appointment?: { id: number; dateDebut?: string | null; dateFin?: string | null; statut?: string | null } | null;
  client?: User | null;
  vehicle?: VehicleSummary | null;
  vehicule?: VehicleSummary | null;
  service?: ServiceSummary | null;
  prestation?: ServiceSummary | null;
}