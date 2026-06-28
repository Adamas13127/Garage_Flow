/*
 * Ce fichier declare la route protegee du frontend GarageFlow.
 * Il existe pour rediriger vers /login les pages qui necessitent un utilisateur connecte.
 * Il communique avec useAuth et React Router.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '../components/feedback/LoadingState';
import { useAuth } from '../hooks/useAuth';

/** Cette route protege les pages garage qui necessitent un token JWT valide. */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState label="Verification de la session" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}