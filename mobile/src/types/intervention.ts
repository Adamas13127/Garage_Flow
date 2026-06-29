/*
 * Ce fichier declare les types intervention utilises par l'application mobile GarageFlow.
 * Il existe pour afficher le suivi des reparations cote client, sans notes internes garage.
 * Il communique avec interventionApi.ts, InterventionsScreen et InterventionDetailScreen.
 */
import type { Appointment } from './appointment';
import type { Garage, ServicePrestation } from './garage';
import type { Vehicle } from './vehicle';

export interface InterventionStatus { code: string; libelle?: string | null; }

export interface InterventionStatusHistory {
  id?: number;
  statut?: InterventionStatus | null;
  statutCode?: string | null;
  code?: string | null;
  libelle?: string | null;
  createdAt?: string | null;
  dateChangement?: string | null;
}

export interface Intervention {
  id: number;
  createdAt?: string | null;
  closedAt?: string | null;
  dateCloture?: string | null;
  statutActuel?: InterventionStatus | null;
  statut?: string | null;
  appointment?: Appointment | null;
  rendezVous?: Appointment | null;
  garage?: Garage | null;
  vehicle?: Vehicle | null;
  vehicule?: Vehicle | null;
  service?: ServicePrestation | null;
  prestation?: ServicePrestation | null;
  statusHistory?: InterventionStatusHistory[];
  historiqueStatuts?: InterventionStatusHistory[];
  notesInternes?: string | null;
}