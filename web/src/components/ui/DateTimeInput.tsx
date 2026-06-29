/*
 * Ce fichier declare le composant DateTimeInput du frontend GarageFlow.
 * Il existe pour saisir les dates de debut et fin d'indisponibilite.
 * Il communique avec GarageSettingsPage.
 */
import { Input } from './Input';
import type { InputHTMLAttributes } from 'react';

interface DateTimeInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

/** Ce champ specialise utilise le type datetime-local pour les periodes d'indisponibilite. */
export function DateTimeInput(props: DateTimeInputProps) {
  return <Input type="datetime-local" {...props} />;
}