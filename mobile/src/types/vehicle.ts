/*
 * Ce fichier declare les types vehicule utilises par l'application mobile GarageFlow.
 * Il existe pour afficher les vehicules du client connecte.
 * Il communique avec vehicleApi.ts et VehiclesScreen.
 */
export interface Vehicle {
  id: number;
  marque?: string | null;
  modele?: string | null;
  plaqueImmatriculation?: string | null;
  immatriculation?: string | null;
}