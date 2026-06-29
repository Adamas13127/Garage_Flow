<!--
Ce fichier propose un scenario de demonstration jury pour GarageFlow.
Il existe pour presenter le MVP dans un ordre clair, en separant le parcours garage, le parcours client et l'explication technique.
Il communique avec les donnees de demonstration, le dashboard web, l'application mobile et l'API Symfony.
-->

# Scenario de demo jury

## Preparation

1. Lancer MySQL avec Docker.
2. Lancer le backend Symfony sur `http://127.0.0.1:8000`.
3. Executer `php bin/console app:create-demo-data`.
4. Lancer le web avec `npm run dev`.
5. Lancer le mobile avec `npx expo start -c`.

## Partie 1 - Web garage

Compte conseille : `gerant.demo@garageflow.local` / `Password123`. Le web garage est reserve aux roles gerant, employe et admin ; un compte client doit utiliser l application mobile.

1. Se connecter au dashboard web.
2. Montrer le cockpit garage : priorites du jour, demandes a valider, planning et vehicules en atelier.
3. Ouvrir la page des rendez-vous et montrer la separation entre demandes a traiter, planning et historique.
4. Accepter un rendez-vous en attente.
5. Expliquer que le backend cree l'intervention associee apres confirmation.
6. Ouvrir la page des interventions et montrer le pipeline atelier par statut.
7. Changer le statut d'une intervention.
8. Consulter ou ajouter une note interne garage.
9. Ouvrir les notifications et marquer une notification comme lue.
10. Montrer la configuration garage : informations, prestations, horaires et indisponibilites.

## Partie 2 - Mobile client

Compte conseille : `client.demo@garageflow.local` / `Password123`.

1. Se connecter a l'application mobile.
2. Presenter l'accueil client.
3. Consulter la liste des garages.
4. Ouvrir un garage et montrer les prestations.
5. Consulter les vehicules du client.
6. Montrer le parcours de reservation d'un rendez-vous.
7. Consulter la liste des rendez-vous.
8. Annuler un rendez-vous annulable si la base de demo en contient un adapte.
9. Ouvrir le suivi d'une intervention et montrer la timeline.
10. Consulter les notifications.
11. Afficher le profil client.

## Partie 3 - Explication technique

1. Backend Symfony API REST : les controleurs recoivent les requetes et les services portent la logique metier.
2. Doctrine ORM et MySQL : les entites representent les donnees du MVP.
3. JWT et roles : les routes privees sont protegees selon client, employe, gerant ou admin.
4. Web React : le dashboard garage consomme l'API avec `VITE_API_BASE_URL`.
5. Mobile Expo : l'application client consomme la meme API avec `EXPO_PUBLIC_API_BASE_URL`.
6. Donnees de demonstration : la commande `app:create-demo-data` cree un parcours coherent et idempotent.
7. Tests : backend, web et mobile disposent de commandes de validation adaptees au MVP.

## Message de conclusion

GarageFlow montre un MVP coherent : le garage gere son activite depuis le web, le client suit son parcours depuis le mobile, et le backend reste la source de verite pour les droits, les donnees et les regles metier.
