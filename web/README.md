<!--
Ce fichier documente le frontend web GarageFlow.
Il existe pour expliquer au jury et aux developpeurs comment installer, lancer et tester le dashboard garage.
Il communique avec Vite, React, Tailwind CSS et l'API Symfony du dossier backend.
-->

# GarageFlow Web

Ce dossier contient le frontend web destine aux garages. Il permet aux gerants et employes d'acceder au dashboard, aux rendez-vous, aux interventions et aux notifications.

## Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Fetch API
* Vitest et Testing Library
* ESLint

## Installation

Depuis `web/` :

```bash
npm install
```

## Variables d'environnement

Copier `.env.example` vers `.env.local` si l'URL API doit changer localement. Ne jamais commiter `.env.local`.

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Commandes

```bash
npm run dev
npm run build
npm run lint
npm test
npm run preview
```


## Depannage Windows

Si `npm run build` ou `npm test` affiche `spawn EPERM` sur `esbuild.exe`, le probleme vient souvent de Windows Defender, d'un antivirus, d'un terminal sans droits suffisants ou d'une installation `node_modules` bloquee localement.

```bash
npm rebuild esbuild
npm run build
npm test
```

Si l'erreur continue, fermer les terminaux ouverts sur le projet, relancer un terminal en administrateur, supprimer seulement `node_modules/`, puis refaire `npm install` et `npm rebuild esbuild`.`r`n`r`n## Structure

```text
src/
|-- api/          -> client HTTP et appels API
|-- assets/       -> futurs assets statiques
|-- components/   -> layout, UI et feedback
|-- contexts/     -> contexte d'authentification
|-- hooks/        -> hooks reutilisables
|-- pages/        -> pages routees
|-- routes/       -> routeur et routes protegees
|-- types/        -> types TypeScript du domaine
`-- utils/        -> utilitaires partages
```

## Routes principales

* `/login` : connexion garage.
* `/dashboard` : resume du garage connecte.
* `/appointments` : liste des rendez-vous garage.
* `/interventions` : liste des interventions atelier.
* `/notifications` : notifications applicatives.

## Lien avec le backend

Le frontend appelle l'API Symfony avec `VITE_API_BASE_URL`. Le token JWT est stocke dans `localStorage` pour le MVP et envoye dans l'en-tete `Authorization: Bearer`. Pour une version production, une strategie plus robuste avec refresh token ou stockage plus securise serait preferable.

## Securite Git

Ne pas commiter `node_modules/`, `dist/`, `.env`, `.env.local`, `.env.*.local`, caches npm ou fichiers temporaires.