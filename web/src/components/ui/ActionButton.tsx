/*
 * Ce fichier declare le composant ActionButton du frontend GarageFlow.
 * Il existe pour afficher des boutons d'action avec un etat de chargement lisible.
 * Il communique avec les pages qui declenchent des appels API de modification.
 */
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { Button } from './Button';

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
};

/** Ce bouton desactive l'action pendant un appel API pour eviter les doubles clics. */
export function ActionButton({ children, disabled, loading = false, loadingLabel = 'Traitement...', variant = 'primary', ...props }: PropsWithChildren<ActionButtonProps>) {
  return (
    <Button disabled={disabled || loading} variant={variant} {...props}>
      {loading ? loadingLabel : children}
    </Button>
  );
}