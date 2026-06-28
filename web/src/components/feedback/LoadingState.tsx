/*
 * Ce fichier declare le composant LoadingState du frontend GarageFlow.
 * Il existe pour signaler clairement les chargements API.
 * Il communique avec les pages et routes protegees.
 */

interface LoadingStateProps {
  label?: string;
}

/** Ce composant affiche un indicateur simple pendant le chargement. */
export function LoadingState({ label = 'Chargement' }: LoadingStateProps) {
  return (
    <div className="flex min-h-32 items-center justify-center gap-3 text-sm text-slate-600">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-sky-700" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}