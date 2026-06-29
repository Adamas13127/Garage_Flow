/*
 * Ce fichier declare le composant EditableCard du frontend GarageFlow.
 * Il existe pour presenter un element configurable avec ses actions principales.
 * Il communique avec GarageSettingsPage.
 */
import type { PropsWithChildren, ReactNode } from 'react';

interface EditableCardProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

/** Cette carte affiche une ligne de configuration avec un espace d'actions explicite. */
export function EditableCard({ actions, children, subtitle, title }: PropsWithChildren<EditableCardProps>) {
  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-slate-950">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="mt-3 text-sm text-slate-600">{children}</div> : null}
    </article>
  );
}