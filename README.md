<!--
Ce fichier presente le projet GarageFlow a la racine du depot.
Il existe pour donner au jury et aux developpeurs une vue rapide du MVP, de son architecture et de ses commandes principales.
Il communique avec les dossiers backend, web, mobile et docs qui composent le monorepo.
-->

# GarageFlow

GarageFlow est une plateforme web et mobile de prise de rendez-vous et de suivi d'intervention pour garages automobiles independants.

## Objectif du MVP

Le MVP permet aux clients de gerer leurs vehicules, prendre rendez-vous et suivre leurs interventions. Il permet aussi aux garages de gerer leurs prestations, horaires, indisponibilites, rendez-vous, interventions, statuts, notes internes et notifications.

## Architecture

```text
garageflow/
|-- backend/  -> API Symfony REST, Doctrine ORM, MySQL et JWT
|-- web/      -> dashboard web garage avec React, Vite et Tailwind CSS
|-- mobile/   -> application mobile client avec Expo SDK 54
|-- docs/     -> documentation fonctionnelle, technique et supports d'oral
|-- README.md -> presentation globale du projet
`-- AGENTS.md -> regles de developpement du projet
```

## Stack technique

* Backend : Symfony API REST
* ORM : Doctrine ORM
* Base de donnees : MySQL avec Docker
* Authentification : JWT
* Frontend web : React + Vite + Tailwind CSS
* Mobile : React Native + Expo SDK 54
* Documentation : Markdown
* Versioning : GitHub

## Statut du projet

Le MVP est fonctionnel pour une demonstration locale : backend API, dashboard web garage, application mobile client, donnees de demonstration et tests automatises sont en place. Les fonctionnalites hors MVP comme paiement, facturation, stock pieces, SMS, chat temps reel et marketplace ne sont pas developpees.

## Lancement rapide

Consulter `docs/oral/FICHE_LANCEMENT_LOCAL.md` pour le demarrage complet. Resume :

```bash
cd backend
docker compose up -d database
php bin/console doctrine:migrations:migrate
php bin/console app:create-demo-data
php -S 127.0.0.1:8000 -t public
```

```bash
cd web
npm install
npm run dev
```

```bash
cd mobile
npm install
npx expo start -c
```

## Comptes de demonstration

Mot de passe commun : `Password123`.

| Interface | Role | Email |
| --- | --- | --- |
| Web garage | Gerant | `gerant.demo@garageflow.local` |
| Web garage | Employe | `employe.demo@garageflow.local` |
| Mobile client | Client | `client.demo@garageflow.local` |

## Documentation utile

* `backend/README.md` : installation et commandes backend.
* `backend/docs/API.md` : routes API principales.
* `backend/docs/DEMO_DATA.md` : donnees de demonstration.
* `docs/oral/AUDIT_FINAL_MVP.md` : etat final du MVP.
* `docs/oral/FICHE_LANCEMENT_LOCAL.md` : fiche de lancement local.
* `docs/oral/SCENARIO_DEMO_JURY.md` : parcours conseille pour l'oral.

## Securite Git

Ne jamais commiter `.env.local`, `.env.test.local`, fichiers `.pem`, `node_modules/`, `vendor/`, `var/`, `dist/`, `build/` ou fichiers temporaires.
