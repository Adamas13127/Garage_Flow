/*
 * Ce fichier declare le composant TimeInput du frontend GarageFlow.
 * Il existe pour saisir des horaires avec un label accessible.
 * Il communique avec GarageSettingsPage.
 */
import { Input } from './Input';
import type { InputHTMLAttributes } from 'react';

interface TimeInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

/** Ce champ specialise utilise le type time pour les horaires d'ouverture. */
export function TimeInput(props: TimeInputProps) {
  return <Input type="time" {...props} />;
}