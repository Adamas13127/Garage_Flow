/*
 * Ce fichier contient les constantes de stockage mobile GarageFlow.
 * Il existe pour centraliser la cle du token JWT stocke en AsyncStorage.
 * Il communique avec httpClient.ts et AuthContext.tsx.
 */
export const AUTH_TOKEN_STORAGE_KEY = 'garageflow.mobile.authToken';