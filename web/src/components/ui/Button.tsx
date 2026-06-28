/*
 * Ce fichier declare le composant Button du frontend GarageFlow.
 * Il existe pour garder des boutons coherents dans toute l'interface garage.
 * Il communique avec les pages et formulaires React.
 */
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-sky-700 text-white hover:bg-sky-800 focus-visible:outline-sky-700',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:outline-slate-500',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-500',
};

/** Ce bouton applique les styles communs et l'etat disabled de facon lisible. */
export function Button({ children, className = '', variant = 'primary', ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}