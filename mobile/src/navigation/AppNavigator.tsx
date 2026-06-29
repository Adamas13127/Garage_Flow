/*
 * Ce fichier declare le navigateur racine de GarageFlow mobile.
 * Il existe pour basculer entre navigation publique et navigation connectee.
 * Il communique avec AuthContext, AuthNavigator et MainTabs.
 */
import { NavigationContainer } from '@react-navigation/native';
import { LoadingState } from '../components/feedback/LoadingState';
import { useAuth } from '../hooks/useAuth';
import { AuthNavigator } from './AuthNavigator';
import { MainTabs } from './MainTabs';

/** Ce navigateur choisit l'arborescence selon l'etat d'authentification. */
export function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingState label="Verification de la session" />;
  return <NavigationContainer>{isAuthenticated ? <MainTabs /> : <AuthNavigator />}</NavigationContainer>;
}