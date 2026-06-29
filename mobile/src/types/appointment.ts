/*
 * Ce fichier declare les types rendez-vous utilises par l'application mobile GarageFlow.
 * Il existe pour afficher et creer des demandes de rendez-vous client.
 * Il communique avec appointmentApi.ts, AppointmentsScreen et BookingScreen.
 */
import type { Garage, ServicePrestation } from './garage';
import type { Vehicle } from './vehicle';

export interface Appointment {
  id: number;
  statut: string;
  dateDebut: string;
  dateFin?: string | null;
  commentaireClient?: string | null;
  garage?: Garage | null;
  vehicle?: Vehicle | null;
  vehicule?: Vehicle | null;
  service?: ServicePrestation | null;
  prestation?: ServicePrestation | null;
}

export interface CreateAppointmentPayload {
  garageId: number;
  serviceId: number;
  vehicleId: number;
  dateHeure: string;
  commentaireClient?: string | null;
}