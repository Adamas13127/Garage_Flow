<!--
Ce fichier explique simplement l'architecture de GarageFlow.
Il existe pour aider a presenter le role du backend, du web, du mobile, de l'API, de JWT et de MySQL pendant l'oral.
Il communique avec le plan de soutenance, le script de demonstration et les documents techniques du projet.
-->

# Architecture expliquee simplement

## Schema textuel

```text
Client mobile Expo
        |
        | appels HTTP avec token JWT
        v
Backend Symfony API REST ---- Doctrine ORM ---- MySQL Docker
        ^
        | appels HTTP avec token JWT
        |
Dashboard web React
```

## Backend Symfony

Le backend est la source de verite de GarageFlow. Il recoit les requetes HTTP, verifie l'utilisateur connecte, applique les regles metier dans les services et enregistre les donnees en base.

Exemple : quand un garage accepte un rendez-vous, le backend change le statut et cree l'intervention associee. Le frontend ne fait pas cette logique lui-meme.

## Web React

Le web est l'interface du garage. Il sert au gerant et aux employes pour consulter les rendez-vous, gerer les interventions, changer les statuts, lire les notifications et configurer le garage.

Le web appelle l'API Symfony avec `VITE_API_BASE_URL` et envoie le token JWT dans les requetes protegees.

## Mobile Expo

Le mobile est l'interface client. Il sert a consulter les garages, gerer ses vehicules, demander un rendez-vous, suivre les interventions et lire les notifications.

Sur telephone reel, le mobile doit appeler l'API avec l'IP locale du PC, par exemple `http://192.168.1.144:8000`.

## Base de donnees MySQL

MySQL stocke les donnees du MVP : utilisateurs, roles, garages, prestations, horaires, indisponibilites, vehicules, rendez-vous, interventions, historiques de statut, notes internes et notifications.

Doctrine permet au backend de manipuler ces donnees avec des entites PHP au lieu d'ecrire toutes les requetes SQL a la main.

## API REST

L'API REST relie les interfaces au backend. Le web et le mobile ne parlent pas directement a MySQL. Ils passent toujours par l'API, ce qui permet au backend de verifier les droits et de garder des regles coherentes.

Exemples de routes :

* `/api/auth/login` pour la connexion.
* `/api/garages` pour consulter les garages.
* `/api/client/appointments` pour les rendez-vous client.
* `/api/garage/me/interventions` pour les interventions garage.

## JWT

JWT sert a prouver qu'un utilisateur est connecte. Apres connexion, le backend renvoie un token. Le web ou le mobile renvoie ensuite ce token dans l'en-tete `Authorization`.

Le backend utilise ce token pour connaitre l'utilisateur et ses roles. Cela permet de separer les droits client, employe, gerant et admin.

## Docker et MySQL

Docker sert a lancer MySQL localement avec une configuration reproductible. C'est pratique pour travailler sur le projet sans installer une base manuellement sur chaque poste.

La commande principale est :

```bash
docker compose up -d database
```

## Flux exemple complet

```text
1. Le client mobile choisit un garage, une prestation, un vehicule et un creneau.
2. Le mobile envoie la demande de rendez-vous au backend Symfony.
3. Le backend verifie le client, valide les donnees et enregistre le rendez-vous dans MySQL.
4. Le dashboard web du garage affiche la demande en attente.
5. Le garage accepte le rendez-vous.
6. Le backend confirme le rendez-vous et cree une intervention.
7. Le garage change les statuts de l'intervention pendant la reparation.
8. Le client suit l'avancement depuis l'application mobile.
```

## Idee importante a retenir

Le frontend web et le mobile affichent et envoient les actions, mais le backend decide. C'est lui qui verifie les roles, protege les donnees et applique les regles metier.
