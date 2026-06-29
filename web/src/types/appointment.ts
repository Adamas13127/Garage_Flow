/*
 * Ce fichier declare les types de rendez-vous utilises par le frontend garage.
 * Il existe pour afficher les demandes recues par le garage.
 * Il communique avec AppointmentsPage, DashboardPage et appointmentApi.ts.
 */
import type { User } from './auth';

export type AppointmentStatus = 'EN_ATTENTE' | 'CONFIRME' | 'REFUSE' | 'ANNULE' | 'TERMINE' | string;

export interface VehicleSummary {
  id: number;
  marque?: string | null;
  modele?: string | null;
  plaqueImmatriculation?: string | null;
  immatriculation?: string | null;
}

export interface ServiceSummary {
  id: number;
  nom?: string | null;
  dureeMinutes?: number | null;
  prix?: number | null;
}

/** Ce type represente un rendez-vous tel qu'il est affiche cote garage. */
export interface Appointment {
  id: number;
  statut: AppointmentStatus;
  dateDebut: string;
  dateFin?: string | null;
  commentaireClient?: string | null;
  client?: User | null;
  vehicle?: VehicleSummary | null;
  vehicule?: VehicleSummary | null;
  service?: ServiceSummary | null;
  prestation?: ServiceSummary | null;
  interventionId?: number | null;
}