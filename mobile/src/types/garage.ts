/*
 * Ce fichier declare les types garage utilises par l'application mobile GarageFlow.
 * Il existe pour afficher les garages et leurs prestations aux clients.
 * Il communique avec garageApi.ts et GaragesScreen.
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