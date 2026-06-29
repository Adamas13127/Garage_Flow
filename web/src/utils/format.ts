/*
 * Ce fichier regroupe les fonctions de formatage du frontend GarageFlow.
 * Il existe pour afficher les dates et les noms de facon coherente dans les pages garage.
 * Il communique avec les pages dashboard, rendez-vous, interventions et notifications.
 */
import type { ServiceSummary, VehicleSummary } from '../types/appointment';
import type { User } from '../types/auth';

/** Cette fonction affiche une date API dans un format francais lisible. */
export function formatDateTime(value?: string | null): string {
  if (!value) {
    return 'Non renseigne';
  }

  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

/** Cette fonction affiche le nom complet d'un client sans casser si une partie manque. */
export function formatUserName(user?: User | null): string {
  if (!user) {
    return 'Client non renseigne';
  }

  return [user.prenom, user.nom].filter(Boolean).join(' ') || user.email;
}

/** Cette fonction affiche le vehicule lie a un rendez-vous ou une intervention. */
export function formatVehicle(vehicle?: VehicleSummary | null): string {
  if (!vehicle) {
    return 'Vehicule non renseigne';
  }

  const plate = vehicle.plaqueImmatriculation ?? vehicle.immatriculation;
  return [vehicle.marque, vehicle.modele, plate ? `(${plate})` : null].filter(Boolean).join(' ');
}

/** Cette fonction affiche la prestation principale quand elle est renvoyee par l'API. */
export function formatService(service?: ServiceSummary | null): string {
  return service?.nom ?? 'Prestation non renseignee';
}