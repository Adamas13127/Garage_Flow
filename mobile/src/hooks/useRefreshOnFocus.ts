/*
 * Ce fichier declare un hook de rafraichissement au retour sur un ecran mobile GarageFlow.
 * Il existe car les onglets restent montes: sans lui, un ecran ne recharge ses donnees qu'une fois.
 * Il communique avec la prop navigation deja recue par chaque ecran.
 */
import { useEffect } from 'react';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

type FocusableNavigation = Pick<NavigationProp<ParamListBase>, 'addListener'>;

/** Ce hook rejoue un callback a chaque fois que l'ecran redevient visible (retour d'un autre onglet ou d'un ecran empile). */
export function useRefreshOnFocus(navigation: FocusableNavigation, callback: () => void) {
  useEffect(() => navigation.addListener('focus', callback), [navigation, callback]);
}
