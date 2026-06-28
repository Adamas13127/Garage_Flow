/*
 * Ce fichier declare la page 404 du frontend web GarageFlow.
 * Il existe pour guider l'utilisateur quand une route n'existe pas.
 * Il communique avec React Router.
 */
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';

/** Cette page indique clairement que l'adresse demandee n'existe pas. */
export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-md text-center" title="Page introuvable" description="La page demandee n'existe pas dans le dashboard garage.">
        <Link className="text-sm font-medium text-sky-800 hover:text-sky-900" to="/dashboard">Retour au dashboard</Link>
      </Card>
    </div>
  );
}