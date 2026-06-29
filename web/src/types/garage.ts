/*
 * Ce fichier declare les types du garage cote frontend GarageFlow.
 * Il existe pour typer les donnees de /api/garage/me et du catalogue garage.
 * Il communique avec les pages Dashboard et les futurs ecrans garage.
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