# GarageFlow

GarageFlow est une plateforme web et mobile de prise de rendez-vous et de suivi d'intervention pour garages automobiles independants.

## Objectif du MVP

Le MVP doit permettre aux clients de gerer leurs vehicules, prendre rendez-vous et suivre leurs interventions.
Il doit aussi permettre aux garages de gerer leurs prestations, horaires, rendez-vous, interventions, statuts, notes internes et notifications.

## Architecture prevue

```text
garageflow/
|-- backend/  -> API Symfony REST
|-- web/      -> dashboard web garage avec React
|-- mobile/   -> application mobile client avec Expo
`-- docs/     -> documentation fonctionnelle et technique
```

## Stack technique

* Backend : Symfony API REST
* ORM : Doctrine ORM
* Base de donnees : MySQL
* Authentification : JWT
* Frontend web : React + Vite + Tailwind CSS
* Mobile : React Native + Expo
* Documentation : Markdown
* Versioning : GitHub

## Statut du projet

Le repository est en phase de preparation.
Aucune fonctionnalite metier n'est encore developpee.

## Installation

Les commandes d'installation seront completees lorsque les applications backend, web et mobile seront initialisees.

```bash
# Backend Symfony
# A completer plus tard

# Frontend web React
# A completer plus tard

# Mobile Expo
# A completer plus tard
```

## Documentation

La documentation du projet se trouve dans le dossier `docs/`.
Le fichier `AGENTS.md` a la racine reste la source de verite principale pour les prochaines missions.
## Frontend web

Le dossier `web/` contient le dashboard garage React/Vite. Commandes principales :

```bash
cd web
npm install
npm run dev
npm run build
npm run lint
npm test
```

Le frontend utilise `VITE_API_BASE_URL` pour joindre le backend Symfony. Le fichier local `.env.local` ne doit pas etre commite.

## Mobile client

Le dossier `mobile/` contient l'application client Expo/React Native. Commandes principales :

```bash
cd mobile
npm install
npm start
npm run lint
npm test
```

Le mobile utilise `EXPO_PUBLIC_API_BASE_URL` pour joindre l'API Symfony. Sur telephone reel, utiliser l'IP locale du PC plutot que `127.0.0.1`.
