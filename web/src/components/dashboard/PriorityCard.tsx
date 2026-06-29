/*
 * Ce fichier declare une carte de priorite pour le cockpit garage.
 * Il existe pour afficher les actions importantes du jour sans transformer le dashboard en simple tableau de chiffres.
 * Il communique avec DashboardPage qui lui transmet les priorites calculees depuis les API.
 */
import type { ReactNode } from 'react';

interface PriorityCardProps {
  title: string;
  value: number;
  description: string;
  icon?: ReactNode;
  tone?: 'amber' | 'emerald' | 'sky' | 'slate';
}

const toneStyles = {
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  sky: 'border-sky-200 bg-sky-50 text-sky-900',
  slate: 'border-slate-200 bg-white text-slate-900',
};

/** Cette carte aide le gerant a voir une priorite concrete avant de regarder les details. */
export function PriorityCard({ title, value, description, icon, tone = 'slate' }: PriorityCardProps) {
  return (
    <article className={`rounded-md border p-4 shadow-sm ${toneStyles[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        {icon ? <div className="rounded-md bg-white/70 p-2">{icon}</div> : null}
      </div>
      <p className="mt-3 text-sm leading-5 opacity-85">{description}</p>
    </article>
  );
}
