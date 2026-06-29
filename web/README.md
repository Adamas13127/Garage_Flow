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


## Pages connectees a l API

Le dashboard garage charge maintenant les donnees du backend Symfony pour afficher le garage connecte, les rendez-vous, les interventions et les notifications. Les appels passent par les fichiers de `src/api/`, qui utilisent le client HTTP commun et ajoutent le token JWT automatiquement.

* `DashboardPage` utilise `/api/garage/me`, `/api/garage/me/appointments`, `/api/garage/me/interventions` et `/api/notifications`.
* `AppointmentsPage` utilise `/api/garage/me/appointments`.
* `InterventionsPage` utilise `/api/garage/me/interventions`.
* `NotificationsPage` utilise `/api/notifications` avec un filtre toutes/non lues cote frontend.

Le dashboard affiche les compteurs principaux du garage : rendez-vous en attente, rendez-vous confirmes, interventions en cours et notifications non lues. Il affiche aussi une liste courte des prochains rendez-vous et des dernieres interventions.



## Configuration garage

La route `/garage-settings` permet au gerant de configurer les donnees principales du garage depuis le dashboard web.

Fonctionnalites disponibles :

* modification des informations du garage : nom, adresse, ville, code postal, telephone, email, description, logo et etat actif ;
* gestion des prestations : creation, modification et desactivation ;
* gestion des horaires d'ouverture : creation, modification et desactivation des plages horaires ;
* gestion des indisponibilites : creation, modification et suppression.

Les formulaires appliquent une validation minimale cote frontend avant d'appeler l'API Symfony, puis affichent les messages de succes ou d'erreur retournes par le backend.
## Actions garage

Le frontend web permet maintenant au garage d'agir sur les donnees du backend sans modifier la logique metier cote client.

* `AppointmentsPage` permet d'accepter ou de refuser un rendez-vous en attente, avec motif de refus optionnel.
* `InterventionsPage` permet de changer le statut d'une intervention et d'ajouter un commentaire optionnel.
* `InterventionsPage` affiche aussi les notes internes, non visibles par le client, avec ajout, modification et suppression.
* `NotificationsPage` permet de marquer une notification comme lue ou de tout marquer comme lu.

Les pages concernees rechargent leurs donnees apres chaque action pour garder les compteurs et les listes coherents avec le backend.
## Limites actuelles

* UI encore simple et volontairement orientee demonstration MVP.
* Pas encore de design final avance.
* Pas encore de CI dediee au frontend.
* Pas de temps reel WebSocket : les listes sont rafraichies apres action.
* Le mobile client reste separe dans le dossier mobile/.

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