/*
 * Ce fichier declare la route protegee du frontend GarageFlow.
 * Il existe pour rediriger vers /login les visiteurs et bloquer clairement les comptes client sur le web garage.
 * Il communique avec useAuth, React Router et les roles retournes par /api/me.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '../components/feedback/LoadingState';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { hasGarageAccess } from '../utils/roles';

/** Cette route protege les pages garage qui necessitent un token JWT valide et un role garage. */
export function ProtectedRoute() {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState label="Verification de la session" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasGarageAccess(user)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <section className="w-full max-w-lg rounded-md border border-amber-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Acces web garage reserve</p>
          <h1 className="mt-2 text-xl font-bold text-slate-950">Compte client detecte</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Ce compte client est reserve a l'application mobile GarageFlow. Connectez-vous avec un compte garage pour acceder au dashboard web.
          </p>
          <Button className="mt-5" type="button" onClick={logout}>Se deconnecter</Button>
        </section>
      </main>
    );
  }

  return <Outlet />;
}
