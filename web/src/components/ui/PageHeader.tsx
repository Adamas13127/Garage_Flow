/*
 * Ce fichier declare le composant PageHeader du frontend GarageFlow.
 * Il existe pour presenter les titres de pages de facon coherente dans le dashboard garage.
 * Il communique avec les pages Dashboard, Rendez-vous, Interventions et Notifications.
 */
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
}

/** Ce composant affiche le titre principal d'une page et des actions optionnelles. */
export function PageHeader({ title, description, eyebrow, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow ? <p className="text-sm font-medium text-sky-700">{eyebrow}</p> : null}
        <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}