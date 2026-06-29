/*
 * Ce fichier declare le composant Select du frontend GarageFlow.
 * Il existe pour choisir un statut d'intervention avec un label accessible.
 * Il communique avec InterventionsPage.
 */
import type { SelectHTMLAttributes } from 'react';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  options: SelectOption[];
}

/** Ce composant affiche une liste de choix simple pour les formulaires garage. */
export function Select({ label, name, options, className = '', ...props }: SelectProps) {
  return (
    <label className="block text-sm font-medium text-slate-700" htmlFor={name}>
      {label}
      <select
        className={`mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-100 ${className}`}
        id={name}
        name={name}
        {...props}
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}