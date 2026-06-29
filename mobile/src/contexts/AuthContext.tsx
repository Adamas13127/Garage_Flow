/*
 * Ce fichier declare le contexte d'authentification mobile GarageFlow.
 * Il existe pour partager le token, l'utilisateur et les actions login/register/logout.
 * Il communique avec AsyncStorage, authApi.ts et la navigation.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/authApi';
import type { RegisterClientPayload, User } from '../types/auth';
import { AUTH_TOKEN_STORAGE_KEY } from '../utils/storage';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerClient: (payload: RegisterClientPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Ce fournisseur garde l'etat de session mobile disponible dans toute l'application. */
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    setToken(storedToken);
    if (!storedToken) { setUser(null); setLoading(false); return; }
    try { setUser(await authApi.me()); } catch { await logout(); } finally { setLoading(false); }
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    await AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token);
    setToken(response.token);
    setUser(await authApi.me());
  }, []);

  const registerClient = useCallback(async (payload: RegisterClientPayload) => { await authApi.registerClient(payload); }, []);

  useEffect(() => { void refreshUser(); }, [refreshUser]);

  const value = useMemo(() => ({ user, token, loading, isAuthenticated: Boolean(token && user), login, registerClient, logout, refreshUser }), [user, token, loading, login, registerClient, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}