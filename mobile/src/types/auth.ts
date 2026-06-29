/*
 * Ce fichier declare les types d'authentification de l'application mobile GarageFlow.
 * Il existe pour typer l'utilisateur connecte, le login et l'inscription client.
 * Il communique avec authApi.ts et AuthContext.tsx.
 */
export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  role?: string | null;
  roles?: string[];
}

export interface LoginResponse { token: string; }

export interface RegisterClientPayload {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string | null;
}