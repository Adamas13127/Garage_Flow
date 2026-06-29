/*
 * Ce fichier declare le composant SuccessMessage du frontend GarageFlow.
 * Il existe pour confirmer clairement qu'une action garage a reussi.
 * Il communique avec les pages qui declenchent des modifications via API.
 */
interface SuccessMessageProps {
  message: string | null;
}

/** Ce composant affiche un message positif sans interrompre le travail de l'utilisateur. */
export function SuccessMessage({ message }: SuccessMessageProps) {
  if (!message) {
    return null;
  }

  return <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">{message}</p>;
}