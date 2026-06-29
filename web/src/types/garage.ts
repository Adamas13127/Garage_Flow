/*
 * Ce fichier declare les types du garage cote frontend GarageFlow.
 * Il existe pour typer les donnees de configuration du garage, ses prestations, horaires et indisponibilites.
 * Il communique avec les pages Dashboard, GarageSettingsPage et les modules API garage.
 */

/** Ce type represente un garage rattache au compte connecte. */
export interface Garage {
  id: number;
  nom: string;
  adresse?: string | null;
  ville?: string | null;
  codePostal?: string | null;
  telephone?: string | null;
  email?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  actif?: boolean;
}

export type GaragePayload = Partial<Omit<Garage, 'id'>>;

/** Ce type represente une prestation configurable par le garage. */
export interface ServicePrestation {
  id: number;
  nom: string;
  description?: string | null;
  dureeMinutes: number;
  actif?: boolean;
}

export interface ServicePrestationPayload {
  nom: string;
  description?: string | null;
  dureeMinutes: number;
  actif?: boolean;
}

/** Ce type represente une plage horaire d'ouverture du garage. */
export interface OpeningHour {
  id: number;
  jourSemaine: number;
  heureDebut: string;
  heureFin: string;
  actif?: boolean;
}

export interface OpeningHourPayload {
  jourSemaine: number;
  heureDebut: string;
  heureFin: string;
  actif?: boolean;
}

/** Ce type represente une indisponibilite ponctuelle du garage. */
export interface Unavailability {
  id: number;
  dateDebut: string;
  dateFin: string;
  motif?: string | null;
}

export interface UnavailabilityPayload {
  dateDebut: string;
  dateFin: string;
  motif?: string | null;
}