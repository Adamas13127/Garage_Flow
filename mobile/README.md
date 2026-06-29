<!--
Ce fichier documente l'application mobile client GarageFlow.
Il existe pour expliquer l'installation, la configuration API et les limites du socle Expo.
Il communique avec le projet Expo, l'API Symfony et les futurs developpeurs du mobile.
-->

# GarageFlow Mobile

Ce dossier contient l'application mobile client GarageFlow. Elle servira aux clients pour gerer leurs vehicules, consulter les garages, prendre rendez-vous, suivre leurs interventions et lire leurs notifications.

## Stack

* Expo
* React Native
* TypeScript
* React Navigation
* AsyncStorage pour le token JWT en MVP
* Fetch API
* Jest et Testing Library React Native
* ESLint

## Installation

```bash
cd mobile
npm install
```

## Variables d'environnement

Copier `.env.example` vers `.env.local` si l'URL de l'API doit changer localement. Ne jamais commiter `.env.local`.

```env
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Attention : sur telephone reel, `127.0.0.1` pointe vers le telephone, pas vers le PC.

* Emulateur Android : utiliser souvent `http://10.0.2.2:8000`.
* Telephone physique : utiliser l'IP locale du PC, par exemple `http://192.168.x.x:8000`.
* Simulateur iOS local : `127.0.0.1` peut fonctionner selon la configuration.

## Commandes

```bash
npm start
npm run android
npm run ios
npm run lint
npm test
npx expo start --help
npm audit --omit=dev
```

## Structure

```text
src/
|-- api/          -> client HTTP et appels API mobiles
|-- components/   -> composants UI, layout et feedback
|-- contexts/     -> AuthContext mobile
|-- hooks/        -> hooks reutilisables
|-- navigation/   -> navigation auth et onglets client
|-- screens/      -> ecrans de l'application
|-- types/        -> types TypeScript
`-- utils/        -> theme, stockage et formatage
```

## Ecrans disponibles

* Login
* Register
* Home
* Garages
* Vehicles
* Appointments
* Interventions
* Notifications
* Profile

## Securite

Le token JWT est stocke avec AsyncStorage pour le MVP. Pour une application en production, une solution plus securisee comme SecureStore serait preferable.

## Limites actuelles

* Pas encore de CRUD complet vehicule.
* Pas encore de parcours complet de reservation.
* Pas encore de design final avance.
* Pas de temps reel WebSocket.
* Les tests couvrent seulement le socle initial.