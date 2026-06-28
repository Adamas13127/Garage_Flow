/*
 * Ce fichier declare le hook useAuth du frontend GarageFlow.
 * Il existe pour lire facilement le contexte d'authentification dans les composants.
 * Il communique avec authContextValue.ts et AuthProvider.
 */
import { useContext } from 'react';
import { AuthContext } from '../contexts/authContextValue';

/** Ce hook evite de manipuler directement le contexte dans chaque page. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit etre utilise dans AuthProvider.');
  }

  return context;
}