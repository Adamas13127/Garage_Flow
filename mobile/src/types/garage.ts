/*
 * Ce fichier declare les types garage utilises par l'application mobile GarageFlow.
 * Il existe pour afficher les garages, prestations et creneaux disponibles aux clients.
 * Il communique avec garageApi.ts, GaragesScreen, GarageDetailScreen et BookingScreen.
 */
export interface Garage {
  id: number;
  nom: string;
  adresse?: string | null;
  ville?: string | null;
  codePostal?: string | null;
  telephone?: string | null;
  email?: string | null;
  description?: string | null;
}

export interface ServicePrestation {
  id: number;
  nom: string;
  description?: string | null;
  dureeMinutes?: number | null;
  actif?: boolean;
}

export interface AvailableSlot {
  id?: string | number;
  dateHeure?: string;
  startAt?: string;
  endAt?: string | null;
  label?: string;
}