/*
 * Ce fichier declare les types de rendez-vous utilises par le frontend garage.
 * Il existe pour afficher les demandes recues par le garage.
 * Il communique avec AppointmentsPage et le client HTTP.
 */

/** Ce type represente un rendez-vous tel qu'il est affiche cote garage. */
export interface Appointment {
  id: number;
  statut: string;
  dateDebut: string;
  dateFin: string;
  commentaireClient?: string | null;
  client?: { id: number; nom: string; prenom: string; email: string; telephone?: string | null };
  vehicle?: { id: number; marque: string; modele: string; plaqueImmatriculation: string };
  service?: { id: number; nom: string; dureeMinutes: number };
  interventionId?: number | null;
}