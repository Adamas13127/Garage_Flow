/*
 * Ce fichier declare le composant FormTextarea du frontend GarageFlow.
 * Il existe pour saisir des commentaires, motifs de refus et notes internes.
 * Il communique avec les formulaires des pages rendez-vous et interventions.
 */
import type { TextareaHTMLAttributes } from 'react';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
}

/** Ce champ textarea associe toujours un label clair a la zone de saisie. */
export function FormTextarea({ label, name, className = '', ...props }: FormTextareaProps) {
  return (
    <label className="block text-sm font-medium text-slate-700" htmlFor={name}>
      {label}
      <textarea
        className={`mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 shadow-sm focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-100 ${className}`}
        id={name}
        name={name}
        {...props}
      />
    </label>
  );
}