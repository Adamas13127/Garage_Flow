<!--
Ce fichier documente le frontend web GarageFlow.
Il existe pour expliquer au jury et aux developpeurs comment installer, lancer, tester et presenter le dashboard garage.
Il communique avec Vite, React, Tailwind CSS et l'API Symfony du dossier backend.
-->

# GarageFlow Web

Ce dossier contient le frontend web destine aux garages. Il permet aux gerants et employes d'acceder au cockpit garage, aux rendez-vous, a la liste Atelier filtrable, aux notifications et a la configuration du garage.

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

Si `npm test` affiche `spawn EPERM` sur `esbuild.exe` dans le sandbox Windows, relancer le test dans un terminal local autorise peut suffire. Si le probleme continue, fermer les terminaux ouverts sur le projet, verifier l'antivirus, puis relancer :

```bash
npm rebuild esbuild
npm test
```

## Structure

```text
src/
|-- api/          -> client HTTP et appels API
|-- assets/       -> futurs assets statiques
|-- components/   -> layout, UI, feedback, rendez-vous, dashboard et atelier
|-- contexts/     -> contexte d'authentification
|-- hooks/        -> hooks reutilisables
|-- pages/        -> pages routees
|-- routes/       -> routeur et routes protegees
|-- types/        -> types TypeScript du domaine
`-- utils/        -> utilitaires partages, formatage et roles
```

## UX garage MVP

### Dashboard cockpit

La page `/dashboard` est organisee comme un cockpit garage. Elle affiche en haut les priorites : demandes de rendez-vous a valider, rendez-vous confirmes a venir, vehicules en atelier et notifications non lues. Elle montre aussi un planning simple et les vehicules en atelier.

### Rendez-vous

La page `/appointments` separe maintenant trois zones :

* demandes a traiter pour les rendez-vous `EN_ATTENTE` avec boutons Accepter et Refuser ;
* planning des rendez-vous `CONFIRME`, groupe par jour avec filtres Aujourd'hui, Semaine et Tous ;
* historique compact pour les rendez-vous refuses, annules ou termines.

### Interventions

La page `/interventions` devient une vue atelier en pipeline. Les colonnes representent les statuts du MVP : depose, diagnostic, validation client, reparation, pret et recupere. Chaque carte garde le changement de statut et l'acces aux notes internes.

### Configuration garage

La page `/garage-settings` est organisee en onglets : Informations, Prestations, Horaires et Indisponibilites. Les formulaires d'ajout et de modification sont ouverts seulement quand le gerant en a besoin pour eviter une page trop longue.

### Protection des comptes client

Le web garage est reserve aux roles `ROLE_GERANT`, `ROLE_EMPLOYE` et `ROLE_ADMIN`. Si un compte `ROLE_CLIENT` se connecte au web, un message explique que ce compte est reserve a l'application mobile GarageFlow et propose la deconnexion.

## Routes principales

* `/login` : connexion garage.
* `/dashboard` : cockpit garage.
* `/appointments` : demandes, planning et historique des rendez-vous.
* `/interventions` : liste Atelier filtrable, detail intervention, timeline, changement de statut et notes internes.
* `/notifications` : notifications applicatives.
* `/garage-settings` : configuration du garage, prestations, horaires et indisponibilites.

## Comptes de demonstration

Apres execution de `php bin/console app:create-demo-data` dans `backend/`, le dashboard web peut etre teste avec les comptes garage suivants :

```text
Gerant : gerant.demo@garageflow.local / Password123
Employe : employe.demo@garageflow.local / Password123
```

Le compte client `client.demo@garageflow.local` est reserve a l'application mobile.

## Lien avec le backend

Le frontend appelle l'API Symfony avec `VITE_API_BASE_URL`. Le token JWT est stocke dans `localStorage` pour le MVP et envoye dans l'en-tete `Authorization: Bearer`. Le backend reste responsable des droits et du filtrage des donnees.

## Limites restantes

* Pas de calendrier avance avec drag and drop.
* Pas de temps reel WebSocket : les listes se rafraichissent apres action ou navigation.
* Design encore MVP, optimise pour une demonstration jury.
* Stockage token web en `localStorage`, acceptable pour le MVP mais a renforcer en production.

## Securite Git

Ne pas commiter `node_modules/`, `dist/`, `.env`, `.env.local`, `.env.*.local`, caches npm ou fichiers temporaires.
