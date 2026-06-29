/*
 * Ce fichier contient les appels API d'authentification mobile GarageFlow.
 * Il existe pour connecter et inscrire un client depuis l'application mobile.
 * Il communique avec httpClient.ts et AuthContext.tsx.
 */
import { apiRequest } from './httpClient';
import type { LoginResponse, RegisterClientPayload, User } from '../types/auth';

/** Cette fonction connecte un utilisateur et recupere un token JWT. */
export function login(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/auth/login', { method: 'POST', body: { email, password } });
}

/** Cette fonction inscrit un nouveau client dans GarageFlow. */
export function registerClient(payload: RegisterClientPayload): Promise<User> {
  return apiRequest<User>('/api/auth/register/client', { method: 'POST', body: payload });
}

/** Cette fonction recupere l'utilisateur actuellement connecte. */
export function me(): Promise<User> {
  return apiRequest<User>('/api/me');
}