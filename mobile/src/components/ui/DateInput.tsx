/*
 * Ce fichier declare un champ date simple pour GarageFlow mobile.
 * Il existe pour saisir une date au format YYYY-MM-DD pour les creneaux.
 * Il communique avec BookingScreen.
 */
import type { TextInputProps } from 'react-native';
import { AppInput } from './AppInput';

/** Ce champ reste volontairement simple pour le MVP mobile. */
export function DateInput(props: TextInputProps & { label: string }) { return <AppInput placeholder="2026-07-01" {...props} />; }