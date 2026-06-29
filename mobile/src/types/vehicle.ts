/*
 * Ce fichier declare les types vehicule utilises par l'application mobile GarageFlow.
 * Il existe pour afficher, creer et modifier les vehicules du client connecte.
 * Il communique avec vehicleApi.ts, VehiclesScreen et BookingScreen.
 */
export interface Vehicle {
  id: number;
  marque: string;
  modele: string;
  plaqueImmatriculation?: string | null;
  immatriculation?: string | null;
  kilometrage?: number | null;
  annee?: number | null;
  carburant?: string | null;
}

export interface VehiclePayload {
  marque: string;
  modele: string;
  plaqueImmatriculation: string;
  kilometrage?: number | null;
  annee?: number | null;
  carburant?: string | null;
}