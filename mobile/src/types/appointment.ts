/*
 * Ce fichier declare les types rendez-vous utilises par l'application mobile GarageFlow.
 * Il existe pour afficher l'historique et les demandes du client.
 * Il communique avec appointmentApi.ts et AppointmentsScreen.
 */
import type { Garage, ServicePrestation } from './garage';
import type { Vehicle } from './vehicle';

export interface Appointment {
  id: number;
  statut: string;
  dateDebut: string;
  dateFin?: string | null;
  garage?: Garage | null;
  vehicle?: Vehicle | null;
  vehicule?: Vehicle | null;
  service?: ServicePrestation | null;
  prestation?: ServicePrestation | null;
}