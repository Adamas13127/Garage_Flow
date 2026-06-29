/*
 * Ce fichier est le point d'entree natif de l'application Expo GarageFlow.
 * Il existe pour enregistrer le composant React principal aupres d'Expo.
 * Il communique avec App.tsx.
 */
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);