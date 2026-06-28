/*
 * Ce fichier regroupe les appels d'authentification du frontend GarageFlow.
 * Il existe pour isoler les routes login et /api/me du reste de l'interface.
 * Il communique avec httpClient.ts et les types d'authentification.
 */
import { apiRequest } from './httpClient';
import type { AuthUser, LoginResponse } from '../types/auth';

/** Cette fonction connecte un utilisateur garage et retourne son token JWT. */
export function login(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

/** Cette fonction recupere l'utilisateur connecte grace au token stocke. */
export function me(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/me');
}