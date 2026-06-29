/*
 * Ce fichier declare le composant ConfirmDeleteButton du frontend GarageFlow.
 * Il existe pour demander une confirmation simple avant une suppression ou desactivation.
 * Il communique avec GarageSettingsPage.
 */
import { useState } from 'react';
import { ActionButton } from './ActionButton';

interface ConfirmDeleteButtonProps {
  label: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
}

/** Ce bouton demande un second clic pour eviter une action destructive accidentelle. */
export function ConfirmDeleteButton({ confirmLabel = 'Confirmer', label, loading, onConfirm }: ConfirmDeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return <ActionButton loading={loading} type="button" variant="secondary" onClick={onConfirm}>{confirmLabel}</ActionButton>;
  }

  return <ActionButton type="button" variant="ghost" onClick={() => setConfirming(true)}>{label}</ActionButton>;
}