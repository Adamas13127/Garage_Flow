<!--
Ce fichier presente l'audit final du MVP GarageFlow.
Il existe pour aider a preparer l'oral en resumant l'etat reel du backend, du web, du mobile et des tests.
Il communique avec les README, les commandes de verification et les donnees de demonstration du projet.
-->

# Audit final MVP GarageFlow

## Etat global

Le MVP GarageFlow est presentable localement. Le backend Symfony expose l'API REST, le dashboard web React couvre le parcours garage et l'application mobile Expo couvre le parcours client. Les donnees de demonstration permettent de montrer un garage, des comptes, des vehicules, des rendez-vous, des interventions, des notes internes et des notifications.

## Architecture validee

```text
garageflow/
|-- backend/  -> API Symfony, Doctrine ORM, MySQL, JWT et donnees de demo
|-- web/      -> dashboard garage React, Vite et Tailwind CSS
|-- mobile/   -> application client Expo SDK 54
`-- docs/     -> documentation projet, reference et oral
```

Aucun fichier sensible suivi par Git n'a ete detecte pendant l'audit. Les dossiers generes `node_modules/`, `vendor/`, `var/` et `dist/` restent ignores.

## Fonctionnalites backend validees

* Authentification JWT avec roles `ROLE_CLIENT`, `ROLE_EMPLOYE`, `ROLE_GERANT` et `ROLE_ADMIN`.
* Catalogue public des garages et prestations.
* Gestion des vehicules client.
* Creation, consultation et annulation de rendez-vous client.
* Acceptation et refus de rendez-vous cote garage.
* Creation d'intervention apres acceptation d'un rendez-vous.
* Changement de statut d'intervention et historique.
* Notes internes visibles uniquement cote garage.
* Notifications applicatives.
* Commande idempotente `app:create-demo-data`.

## Fonctionnalites web validees

* Connexion garage.
* Dashboard garage avec resume des rendez-vous, interventions et notifications.
* Liste et actions sur les rendez-vous.
* Liste et changement de statut des interventions.
* Gestion des notes internes.
* Lecture et marquage des notifications.
* Configuration garage, prestations, horaires et indisponibilites.

Routes principales : `/login`, `/dashboard`, `/appointments`, `/interventions`, `/notifications`, `/garage-settings`.

## Fonctionnalites mobile validees

* Connexion et inscription client.
* Accueil client.
* Consultation des garages et prestations.
* Reservation de rendez-vous.
* Gestion des vehicules.
* Consultation et annulation des rendez-vous.
* Suivi des interventions avec timeline.
* Notifications client.
* Profil client.
* Compatibilite Expo SDK 54 pour Expo Go 54 sur iPhone.

## Commandes de lancement

Backend :

```bash
cd backend
docker compose up -d database
php bin/console doctrine:migrations:migrate
php bin/console app:create-demo-data
php -S 127.0.0.1:8000 -t public
```

Web :

```bash
cd web
npm install
npm run dev
```

Mobile :

```bash
cd mobile
npm install
npx expo start -c
```

Sur iPhone physique, `EXPO_PUBLIC_API_BASE_URL` doit utiliser l'IP locale du PC, par exemple `http://192.168.1.144:8000`.

## Comptes de demonstration

Mot de passe commun : `Password123`.

| Interface | Role | Email |
| --- | --- | --- |
| Web garage | Gerant | `gerant.demo@garageflow.local` |
| Web garage | Employe | `employe.demo@garageflow.local` |
| Mobile client | Client | `client.demo@garageflow.local` |

## Resultats des tests

Backend :

* `composer validate --strict` : OK.
* `php bin/console lint:container` : OK.
* `php bin/console doctrine:schema:validate` : OK.
* `php bin/phpunit` : OK, 27 tests et 191 assertions.
* `php bin/console debug:router` : OK, routes API listees.
* `php bin/console app:create-demo-data` : OK, commande idempotente.

Web :

* `npm run lint` : OK.
* `npm run build` : OK.
* `npm audit --omit=dev` : OK, 0 vulnerabilite.
* `npm test` : bloque localement par `spawn EPERM` sur esbuild dans Vitest. Le build fonctionne, donc le probleme observe correspond a une execution locale Windows du binaire esbuild, pas a un echec d'assertion du code.

Mobile :

* `npm run lint` : OK.
* `npm test` : OK, 13 suites et 22 tests.
* `npx tsc --noEmit` : OK.
* `npm audit --omit=dev` : OK, 0 vulnerabilite.
* `npx expo install --check` : OK, dependances a jour.

## Scenario de demo recommande

1. Lancer le backend, charger les donnees de demonstration et ouvrir le dashboard web.
2. Se connecter en gerant et presenter le dashboard rempli.
3. Afficher les rendez-vous, accepter un rendez-vous en attente et montrer l'intervention creee.
4. Changer le statut d'une intervention, consulter les notes internes et les notifications.
5. Ouvrir la configuration garage pour montrer les prestations, horaires et indisponibilites.
6. Lancer le mobile avec Expo Go 54, se connecter en client et montrer garages, vehicules, rendez-vous, suivi d'intervention, notifications et profil.
7. Terminer par l'architecture : Symfony API, Doctrine/MySQL, JWT, React web, Expo mobile et tests.

## Limites assumees du MVP

* Pas de paiement en ligne.
* Pas de facturation.
* Pas de stock de pieces.
* Pas de devis complexe.
* Pas de chat temps reel.
* Pas de SMS.
* Pas de notifications push natives.
* Pas de marketplace.
* Pas de temps reel WebSocket.

Ces limites respectent le perimetre MVP defini dans `AGENTS.md`.

## Risques restants

* Le test web peut rester bloque sur certains postes Windows si l'antivirus ou le terminal empeche l'execution d'esbuild.
* L'application mobile sur telephone physique depend de l'IP locale du PC et du meme reseau Wi-Fi.
* Les cles JWT et les fichiers `.env.local` doivent etre recrees localement et ne doivent pas etre versionnes.
* La base de demonstration est locale et ne remplace pas une strategie de seed de production.

## Prochaines ameliorations possibles

* Ajouter une integration continue pour backend, web et mobile.
* Securiser davantage le stockage du token mobile avec une solution adaptee a la production.
* Ajouter des tests end-to-end de demo.
* Ajouter des notifications push dans une evolution future.
* Ajouter un design system plus complet apres validation MVP.
