/*
 * Ce fichier declare le client HTTP du frontend web GarageFlow.
 * Il existe pour centraliser les appels vers l'API Symfony et ajouter automatiquement le token JWT.
 * Il communique avec localStorage, les pages React et les endpoints du backend.
 */
import { AUTH_TOKEN_STORAGE_KEY } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  /** Cette erreur garde le code HTTP pour afficher un message utile a l'utilisateur. */
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

/** Cette fonction recupere le token sans jamais l'afficher ni le logger. */
function getStoredToken(): string | null {
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

/** Cette fonction transforme un statut HTTP en message comprehensible. */
function defaultErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    401: 'Votre session a expire ou vous devez vous connecter.',
    403: 'Vous n avez pas les droits pour effectuer cette action.',
    404: 'La ressource demandee est introuvable.',
    409: 'La demande entre en conflit avec les donnees existantes.',
    500: 'Le serveur a rencontre une erreur. Reessayez plus tard.',
  };

  return messages[status] ?? 'Une erreur est survenue pendant la communication avec l API.';
}

/** Cette fonction envoie une requete JSON a l'API GarageFlow. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  const token = getStoredToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers, body });
  const contentType = response.headers.get('content-type') ?? '';
  const hasJson = contentType.includes('application/json');
  const payload = hasJson ? await response.json() : null;

  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : defaultErrorMessage(response.status);
    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
}