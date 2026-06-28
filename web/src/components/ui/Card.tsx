/*
 * Ce fichier declare le composant Card du frontend GarageFlow.
 * Il existe pour encadrer des informations metier sans dupliquer les styles.
 * Il communique avec les pages dashboard, rendez-vous, interventions et notifications.
 */
import type { PropsWithChildren } from 'react';

interface CardProps {
  title?: string;
  description?: string;
  className?: string;
}

/** Cette carte presente un bloc d'information avec un titre optionnel. */
export function Card({ children, title, description, className = '' }: PropsWithChildren<CardProps>) {
  return (
    <section className={`rounded-md border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {title ? <h2 className="text-base font-semibold text-slate-950">{title}</h2> : null}
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      <div className={title || description ? 'mt-4' : ''}>{children}</div>
    </section>
  );
}