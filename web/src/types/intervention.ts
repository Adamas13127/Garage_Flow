/*
 * Ce fichier declare les types d'intervention utilises par le frontend garage.
 * Il existe pour afficher le suivi atelier dans l'application web.
 * Il communique avec InterventionsPage et le client HTTP.
 */

/** Ce type represente une intervention resumee pour les listes garage. */
export interface Intervention {
  id: number;
  createdAt: string;
  closedAt?: string | null;
  notesResume?: string | null;
  statutActuel?: { code: string; libelle: string; ordreAffichage?: number; visibleClient?: boolean };
  appointment?: { id: number; dateDebut: string; dateFin: string; statut: string };
  client?: { id: number; nom: string; prenom: string; email: string; telephone?: string | null };
  vehicle?: { id: number; marque: string; modele: string; plaqueImmatriculation: string };
  service?: { id: number; nom: string; dureeMinutes?: number };
}