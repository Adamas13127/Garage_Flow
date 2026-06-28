/*
 * Ce fichier declare la forme du contexte d'authentification GarageFlow.
 * Il existe pour partager le type du contexte entre le provider, le hook useAuth et les tests.
 * Il communique avec AuthContext.tsx et les composants qui lisent l'utilisateur connecte.
 */
import { createContext } from 'react';
import type { AuthUser } from '../types/auth';

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

/** Ce contexte stocke les informations utiles pour savoir si l'utilisateur est connecte. */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);