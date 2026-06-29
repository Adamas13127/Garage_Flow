/*
 * Ce fichier declare le composant SimpleModal du frontend GarageFlow.
 * Il existe pour demander une information courte sans ajouter de grosse librairie UI.
 * Il communique avec AppointmentsPage pour le motif de refus.
 */
import type { PropsWithChildren } from 'react';
import { Button } from './Button';

interface SimpleModalProps {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
}

/** Cette modale simple affiche un panneau centre avec un bouton de fermeture accessible. */
export function SimpleModal({ children, description, onClose, open, title }: PropsWithChildren<SimpleModalProps>) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4" role="dialog" aria-modal="true" aria-labelledby="simple-modal-title">
      <section className="w-full max-w-lg rounded-md bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950" id="simple-modal-title">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>Fermer</Button>
        </div>
        <div className="mt-4">{children}</div>
      </section>
    </div>
  );
}