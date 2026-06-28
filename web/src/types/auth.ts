/*
 * Ce fichier declare les types lies a l'authentification du frontend GarageFlow.
 * Il existe pour typer les reponses login et utilisateur connecte.
 * Il communique avec authApi.ts et AuthContext.tsx.
 */

/** Ce type represente l'utilisateur retourne par /api/me. */
export interface AuthUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  telephone?: string | null;
  actif: boolean;
}

/** Ce type represente la reponse JWT retournee par /api/auth/login. */
export interface LoginResponse {
  token: string;
}