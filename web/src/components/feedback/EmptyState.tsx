/*
 * Ce fichier declare le composant EmptyState du frontend GarageFlow.
 * Il existe pour eviter les pages blanches quand l'API ne renvoie aucune donnee.
 * Il communique avec les pages connectees au backend.
 */
interface EmptyStateProps {
  title: string;
  description?: string;
}

/** Cet etat vide explique simplement qu'aucune donnee n'est disponible. */
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
    </section>
  );
}