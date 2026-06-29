/*
 * Ce fichier declare les types lies a l'authentification du frontend GarageFlow.
 * Il existe pour typer les reponses login et utilisateur connecte.
 * Il communique avec authApi.ts et AuthContext.tsx.
 */

/** Ce type represente un role utilisateur retourne par l'API quand le backend expose l'objet complet. */
export interface UserRole {
  id?: number;
  code: string;
  libelle?: string;
}

/** Ce type represente l'utilisateur retourne par /api/me. */
export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role?: string | UserRole | null;
  roles?: string[];
  telephone?: string | null;
  actif?: boolean;
}

export type AuthUser = User;

/** Ce type represente la reponse JWT retournee par /api/auth/login. */
export interface LoginResponse {
  token: string;
}