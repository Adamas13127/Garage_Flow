/*
 * Ce fichier declare le composant FormRow du frontend GarageFlow.
 * Il existe pour aligner proprement les champs de formulaire de configuration.
 * Il communique avec GarageSettingsPage.
 */
import type { PropsWithChildren } from 'react';

/** Cette ligne de formulaire garde une grille responsive simple pour les champs. */
export function FormRow({ children }: PropsWithChildren) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}