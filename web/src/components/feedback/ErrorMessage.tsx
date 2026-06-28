/*
 * Ce fichier declare le composant ErrorMessage du frontend GarageFlow.
 * Il existe pour afficher les erreurs API ou formulaire sans page blanche.
 * Il communique avec les pages React et le client HTTP.
 */

interface ErrorMessageProps {
  message: string;
}

/** Ce composant affiche une erreur courte et visible pour l'utilisateur. */
export function ErrorMessage({ message }: ErrorMessageProps) {
  return <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{message}</div>;
}