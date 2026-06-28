/*
 * Ce fichier declare le composant Input du frontend GarageFlow.
 * Il existe pour uniformiser les champs de formulaire.
 * Il communique avec LoginPage et les futurs formulaires garage.
 */
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/** Ce champ affiche un label clair et une erreur si le formulaire en a besoin. */
export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block text-sm font-medium text-slate-700" htmlFor={inputId}>
      {label}
      <input
        id={inputId}
        className={`mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-700 focus:ring-2 focus:ring-sky-100 ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-sm text-red-700">{error}</span> : null}
    </label>
  );
}