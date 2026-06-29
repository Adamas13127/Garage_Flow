/*
 * Ce fichier declare le hook useAuth de GarageFlow mobile.
 * Il existe pour lire le contexte d'authentification sans dupliquer le code.
 * Il communique avec AuthContext.tsx.
 */
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/** Ce hook protege les composants qui doivent etre rendus dans AuthProvider. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit etre utilise dans AuthProvider.');
  return context;
}