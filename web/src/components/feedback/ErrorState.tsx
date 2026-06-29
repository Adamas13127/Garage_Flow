/*
 * Ce fichier declare le composant ErrorState du frontend GarageFlow.
 * Il existe pour afficher une erreur API claire sans laisser une page vide.
 * Il communique avec les pages Dashboard, Rendez-vous, Interventions et Notifications.
 */
interface ErrorStateProps {
  title?: string;
  message: string;
}

/** Cet etat d'erreur donne un message utile quand le backend ne repond pas correctement. */
export function ErrorState({ title = 'Impossible de charger les donnees', message }: ErrorStateProps) {
  return (
    <section className="rounded-md border border-rose-200 bg-rose-50 p-5 text-rose-900" role="alert">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm">{message}</p>
    </section>
  );
}