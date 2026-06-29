/*
 * Ce fichier declare le client HTTP mobile GarageFlow.
 * Il existe pour centraliser les appels vers l'API Symfony et ajouter le token JWT si disponible.
 * Il communique avec AsyncStorage, les modules API et les ecrans React Native.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_TOKEN_STORAGE_KEY } from '../utils/storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';

export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  /** Cette erreur garde le statut HTTP pour afficher un message utile au client. */
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

/** Cette fonction transforme un code HTTP en message comprehensible. */
function defaultErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'La demande contient une erreur.',
    401: 'Vous devez vous connecter.',
    403: 'Vous n avez pas les droits pour cette action.',
    404: 'La ressource demandee est introuvable.',
    409: 'La demande entre en conflit avec les donnees existantes.',
    500: 'Le serveur a rencontre une erreur.',
  };
  return messages[status] ?? 'Une erreur est survenue pendant la communication avec l API.';
}

/** Cette fonction envoie une requete JSON a l'API GarageFlow sans jamais afficher le token. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  const token = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers, body });
  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : defaultErrorMessage(response.status);
    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
}