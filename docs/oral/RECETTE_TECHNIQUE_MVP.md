<!--
Ce fichier documente la recette technique du MVP GarageFlow.
Il existe pour prouver au jury que le backend, le web et le mobile ont ete verifies ensemble apres les refontes UX.
Il communique avec les commandes de validation, les parcours API et le scenario de demonstration.
-->

# Recette technique MVP GarageFlow

Date de recette : 1 juillet 2026

## Etat Git initial

| Zone | Test | Resultat | Commentaire |
|---|---|---|---|
| Git | `git status` | OK | Working tree propre au depart. |
| Git | `git log --oneline -10` | OK | Dernier commit : `b118733 feat(mobile): improve guided booking date selection`. |
| Git | Fichiers sensibles suivis | OK | Aucun `.env.local`, `.pem`, `node_modules`, `vendor`, `var`, `dist` ou `build` suivi par Git. |

## Environnement utilise

| Element | Valeur |
|---|---|
| OS | Windows, PowerShell |
| Backend | Symfony API, PHP 8.2, MySQL Docker |
| Web | React, Vite, Vitest |
| Mobile | Expo SDK 54, React Native |
| API locale | `http://127.0.0.1:8000` avec serveur PHP temporaire |
| Donnees | `php bin/console app:create-demo-data` |

## Backend

| Zone | Test | Resultat | Commentaire |
|---|---|---|---|
| Docker | `docker compose up -d database` | OK | Container MySQL deja en cours d'execution. |
| Doctrine | `php bin/console doctrine:migrations:migrate --no-interaction` | OK | Schema deja a la derniere migration `Version20260626031000`. |
| Demo data | `php bin/console app:create-demo-data` | OK | Commande idempotente : roles, statuts, garage, utilisateurs, prestations, horaires, vehicules, RDV, interventions, notes et notifications reutilises. |
| Composer | `composer validate --strict` | OK | `composer.json` valide. |
| Symfony | `php bin/console lint:container` | OK | Container valide. |
| Doctrine | `php bin/console doctrine:schema:validate` | OK | Mapping correct et schema synchronise. |
| PHPUnit | `php bin/phpunit` | OK | 27 tests, 191 assertions. |
| Routes | `php bin/console debug:router` | OK | Routes auth, client, garage, interventions, notes, notifications et vehicules presentes. |

Note : PHPUnit affiche des logs `Access Denied` attendus pendant certains tests de securite. Les tests restent verts.

## Parcours API client

| Zone | Test | Resultat | Commentaire |
|---|---|---|---|
| Auth | Login client | OK | Token JWT recu avec `client.demo@garageflow.local`. |
| Auth | `GET /api/me` client | OK | Role `ROLE_CLIENT`, pas de mot de passe expose. |
| Garages | `GET /api/garages` | OK | Liste non vide, `Garage Demo GarageFlow` present. |
| Garages | `GET /api/garages/{id}` | OK | Detail garage accessible. |
| Prestations | `GET /api/garages/{id}/services` | OK | Prestations actives disponibles. |
| Vehicules | `GET /api/client/vehicles` | OK | 2 vehicules de demo presents. |
| Creneaux | `GET /available-slots` | OK | Creneaux disponibles sur `2030-01-14`, avec `dateDebut` et `dateFin`. |
| RDV | `POST /api/client/appointments` | OK | RDV cree en `EN_ATTENTE` avec `dateDebut`. |
| RDV | `GET /api/client/appointments` | OK | RDV cree visible cote client. |
| RDV | `PATCH /api/client/appointments/{id}/cancel` | OK | Annulation valide avec statut `ANNULE`. |

## Parcours API gerant

| Zone | Test | Resultat | Commentaire |
|---|---|---|---|
| Auth | Login gerant | OK | Token JWT recu avec `gerant.demo@garageflow.local`. |
| Auth | `GET /api/me` gerant | OK | Role `ROLE_GERANT`. |
| RDV garage | `GET /api/garage/me/appointments` | OK | RDV de demo et RDV crees par le client visibles cote garage. |
| Acceptation | `PATCH /api/garage/me/appointments/{id}/accept` | OK | RDV passe en `CONFIRME` et intervention creee. |
| Refus | `PATCH /api/garage/me/appointments/{id}/refuse` | OK | RDV passe en `REFUSE`, sans intervention creee pour ce RDV. |

## Interventions et notes internes

| Zone | Test | Resultat | Commentaire |
|---|---|---|---|
| Interventions | `GET /api/garage/me/interventions` | OK | Interventions presentes avec client, vehicule, prestation et statut. |
| Interventions | `GET /api/garage/me/interventions/{id}` | OK | Detail et historique disponibles. |
| Statut | `PATCH /api/garage/me/interventions/{id}/status` | OK | Passage a `DIAGNOSTIC_EN_COURS`, historique ajoute. |
| Notes | `GET /notes` | OK | Liste des notes internes accessible cote garage. |
| Notes | `POST /notes` | OK | Note interne creee. |
| Notes | `PATCH /notes/{noteId}` | OK | Note interne modifiee. |
| Notes | `DELETE /notes/{noteId}` | OK | Note supprimee, absente apres relecture. |
| Client | `GET /api/client/interventions/{id}` | OK | Aucune `internalNotes` exposee cote client. |

## Notifications

| Zone | Test | Resultat | Commentaire |
|---|---|---|---|
| Client | `GET /api/notifications` | OK | Notifications client visibles. |
| Client | `GET /api/notifications?unreadOnly=true` | OK | Filtre non lues fonctionne. |
| Client | `PATCH /api/notifications/{id}/read` | OK | Marquage unitaire fonctionne. |
| Client | `PATCH /api/notifications/read-all` | OK | Marquage global fonctionne. |
| Gerant | `GET /api/notifications` | OK | Notifications gerant separees des notifications client. |

## Securite et droits

| Zone | Test | Resultat | Commentaire |
|---|---|---|---|
| Droits | Client vers `/api/garage/me/appointments` | OK | HTTP 403. |
| Droits | Client vers notes internes garage | OK | HTTP 403. |
| Droits | Gerant vers `/api/client/vehicles` | OK | HTTP 200 avec liste vide, pas de fuite de vehicule client. Le role hierarchy donne `ROLE_CLIENT` au gerant, mais les donnees restent filtrees par utilisateur. |
| Auth | Route protegee sans JWT | OK | HTTP 401. |
| Perimetre | Mauvais id intervention garage | OK | HTTP 404 propre. |

## Web garage

| Zone | Test | Resultat | Commentaire |
|---|---|---|---|
| Lint | `npm run lint` | OK | Aucun probleme ESLint. |
| Build | `npm run build` | OK | TypeScript et Vite build OK. |
| Tests | `npm test` | OK | 9 fichiers, 31 tests. Premier lancement sandbox bloque par `spawn EPERM` esbuild, relance hors sandbox OK. |
| Audit | `npm audit --omit=dev` | OK | 0 vulnerabilite. |
| Routes | Verification statique | OK | `/login`, `/dashboard`, `/appointments`, `/interventions`, `/notifications`, `/garage-settings` presentes. |

## Mobile client

| Zone | Test | Resultat | Commentaire |
|---|---|---|---|
| Lint | `npm run lint` | OK | Aucun probleme ESLint. |
| Tests | `npm test -- --runInBand` | OK | 16 suites, 39 tests. |
| TypeScript | `npx tsc --noEmit` | OK | Types valides. |
| Audit | `npm audit --omit=dev` | OK | 0 vulnerabilite. |
| Expo | `npx expo install --check` | OK | Premier lancement sandbox bloque par `fetch failed`, relance avec acces reseau OK. |
| Booking | Tests BookingScreen | OK | Jours cliquables, `dateDebut`, creneaux groupes, pas de champ date manuel. |

## Bugs trouves et corrections

| Zone | Bug | Correction | Resultat |
|---|---|---|---|
| Mobile tests | `AppointmentsScreen.test.tsx` utilisait `2026-07-01T10:00:00+02:00`, devenu passe le jour de recette. | Remplacement par `2030-07-01T10:00:00+02:00` pour garder un RDV futur stable. | Tests mobile OK. |
| Recette script | Le premier script supposait a tort que toutes les listes API etaient sous `{ items }`. | Script de recette ajuste localement pour accepter tableau direct ou `{ items }`. | Parcours API valide, pas de correction produit. |

## Risques restants

| Risque | Niveau | Commentaire |
|---|---|---|
| Web Vitest sous sandbox Windows | Faible | `spawn EPERM` apparait seulement dans le sandbox. Les tests passent hors sandbox. |
| Expo check sans reseau | Faible | `fetch failed` dans le sandbox sans acces reseau. Le check passe avec acces reseau. |
| Donnees de recette creees en base locale | Faible | Quelques RDV/interventions/notifications de recette ont ete crees en base locale. La commande demo reste idempotente et le projet est local. |

## Conclusion

Le MVP GarageFlow est pret pour une demonstration technique et fonctionnelle.

Le backend est stable, les parcours API client/garage sont valides, les droits principaux sont verifies, le web garage build/test correctement, et le mobile client valide la reservation guidee avec `dateDebut` et les creneaux disponibles.