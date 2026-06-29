/*
 * Ce fichier declare le composant InlineError du frontend GarageFlow.
 * Il existe pour afficher une erreur proche du formulaire qui a echoue.
 * Il communique avec les workflows d'action garage.
 */
interface InlineErrorProps {
  message: string | null;
}

/** Ce composant rend un message d'erreur court et accessible si une action echoue. */
export function InlineError({ message }: InlineErrorProps) {
  if (!message) {
    return null;
  }

  return <p className="text-sm font-medium text-rose-700" role="alert">{message}</p>;
}