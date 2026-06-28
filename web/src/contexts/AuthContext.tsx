/*
 * Ce fichier declare le contexte d'authentification du frontend GarageFlow.
 * Il existe pour centraliser l'utilisateur connecte, le token JWT et les actions login/logout.
 * Il communique avec authApi.ts, localStorage et les routes protegees de l'application.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import * as authApi from '../api/authApi';
import { AuthContext } from './authContextValue';
import type { AuthContextValue } from './authContextValue';
import type { AuthUser } from '../types/auth';
import { AUTH_TOKEN_STORAGE_KEY } from '../utils/storage';


/** Ce fournisseur garde l'etat d'authentification disponible dans toute l'application garage. */
export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const currentUser = await authApi.me();
      setUser(currentUser);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token);
    setToken(response.token);
    const currentUser = await authApi.me();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser, token]);

  const value: AuthContextValue = useMemo(
    () => ({ user, token, loading, isAuthenticated: Boolean(token && user), login, logout, refreshUser }),
    [user, token, loading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}