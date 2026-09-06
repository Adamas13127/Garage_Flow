<!--
Ce fichier propose un scenario de demonstration jury pour GarageFlow.
Il existe pour presenter le MVP dans un ordre clair, en separant le parcours garage, le parcours client et l'explication technique.
Il communique avec les donnees de demonstration, le dashboard web, l'application mobile et l'API Symfony.
-->

# Scenario de demo jury

## Preparation le jour J

A lancer le matin de la soutenance, dans cet ordre, depuis un poste deja configure (voir
`FICHE_LANCEMENT_LOCAL.md` pour un poste neuf). Les dates du scenario (rendez-vous en attente,
rendez-vous annulable, interventions en cours) sont toujours calculees par rapport au jour
d'execution de la commande : les relancer le 17 septembre au matin suffit a obtenir un jeu de
donnees a jour, sans modification manuelle.

1. Docker (depuis `backend/`) :
   ```bash
   docker compose up -d
   ```
   **Resultat attendu** : `docker ps` liste `backend-database-1` et `backend-mailer-1` a l'etat `Up`.

2. Backend (depuis `backend/`) :
   ```bash
   php -S 0.0.0.0:8000 -t public
   ```
   **Resultat attendu** : aucune erreur au demarrage ; `curl http://127.0.0.1:8000/api/auth/login`
   repond (401 ou 200 selon les identifiants envoyes).

3. Donnees de demonstration fraiches (depuis `backend/`) :
   ```bash
   php bin/console app:create-demo-data --fresh
   ```
   **Resultat attendu** : le resume affiche `9 cree(s), 0 reutilise(s)` pour les rendez-vous,
   `4 cree(s)` pour les interventions, `3 cree(s)` pour les notes internes et `6 cree(s)` pour les
   notifications. `--fresh` supprime d'abord les rendez-vous/interventions/notes/notifications
   d'une eventuelle repetition de la veille avant de tout regenerer avec des dates fraiches ; sans
   cette option, la commande reste idempotente et recalcule quand meme les dates a chaque
   lancement, mais peut laisser trainer un rendez-vous cree manuellement pendant un essai.

4. Web (depuis `web/`) :
   ```bash
   npm run dev
   ```
   **Resultat attendu** : le serveur demarre sur `http://127.0.0.1:5173` (port fige). Si la
   commande echoue avec `Port 5173 is already in use`, un ancien serveur oublie dans un terminal
   occupe le port : voir "Port 5173 deja occupe" dans `FICHE_LANCEMENT_LOCAL.md`.

5. Mobile (depuis `mobile/`, sur le telephone de demonstration) :
   ```bash
   npx expo start -c
   ```
   **Resultat attendu** : Expo affiche un QR code, l'application se connecte a l'API sans erreur
   reseau une fois `EXPO_PUBLIC_API_BASE_URL` verifie.

6. Verification rapide des trois preuves (optionnel mais recommande avant l'oral) : relire l'id et
   la date exacte du rendez-vous "confirme_annulable" affiches dans le dashboard web ou par
   ```bash
   php bin/console dbal:run-sql "SELECT id, statut, date_debut FROM appointment WHERE commentaire_client LIKE '%annuler pour la demonstration%'"
   ```
   avant de tenter la double reservation : la date change a chaque `--fresh`, ne pas se fier a un
   identifiant ou une date notee lors d'une repetition precedente.

### Si un port est occupe

Un serveur de repetition oublie dans un terminal ferme sans `Ctrl+C` peut rester actif des
semaines et bloquer 5173 (web), 8000 (backend) ou 8081 (Metro/Expo mobile) le jour J. Identifier
puis tuer le processus fautif :

```bash
netstat -ano | findstr :5173
taskkill /PID <pid_affiche> /F
```

**Si `taskkill` echoue avec un refus d'acces** (le processus appartient a une autre session
Windows) : ouvrir un terminal en tant qu'administrateur et relancer la meme commande
`taskkill /PID <pid> /F`, ou fermer directement la fenetre/le terminal d'origine si elle est encore
ouverte. En dernier recours, redemarrer la session Windows concernee libere le port.

## Preparation

1. Lancer MySQL avec Docker.
2. Lancer le backend Symfony avec php -S 0.0.0.0:8000 -t public
3. Executer `php bin/console app:create-demo-data`.
4. Lancer le web avec `npm run dev`.
5. Lancer le mobile avec `npx expo start -c`.

## Partie 1 - Web garage

Compte conseille : `gerant.demo@garageflow.local` / `Password123`. Le web garage est reserve aux roles gerant, employe et admin ; un compte client doit utiliser l application mobile.

1. Se connecter au dashboard web.
2. Montrer le cockpit garage : priorites du jour, demandes a valider, planning et vehicules en atelier.
3. Ouvrir la page des rendez-vous et montrer la separation entre demandes a traiter, planning et historique.
4. Accepter un rendez-vous en attente.
5. Ouvrir Mailpit (`http://127.0.0.1:8025`) et montrer l'email de confirmation capture sans envoi reel.
6. Expliquer que le backend cree l'intervention associee apres confirmation.
7. Ouvrir la page Atelier, montrer le resume des vehicules puis filtrer la liste par statut.
8. Ouvrir le detail d une intervention, montrer la timeline, puis cliquer sur Changer statut et confirmer une mise a jour.
9. Cliquer sur Notes, rappeler que les notes internes ne sont pas visibles par le client ni dans les emails, puis consulter ou ajouter une note interne garage.
10. Ouvrir les notifications et marquer une notification comme lue.
11. Montrer la configuration garage : informations, prestations, horaires et indisponibilites.

## Partie 2 - Mobile client

Compte conseille : `client.demo@garageflow.local` / `Password123`.

1. Se connecter a l'application mobile.
2. Presenter l'accueil client : CTA reservation, categories de services, garages recommandes et suivis.
3. Consulter la liste des garages : recherche, categories, filtres et cartes garage.
4. Ouvrir un garage et montrer la banniere, les informations et les prestations avec le bouton Reserver.
5. Consulter les vehicules du client puis ouvrir le formulaire uniquement avec + Ajouter un vehicule.
6. Montrer le parcours de reservation depuis la fiche garage : prestation, vehicule, date choisie dans une liste, creneau disponible groupe par moment de journee puis confirmation du RDV.
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
7. Emails : Symfony Mailer envoie les messages clients et Mailpit les capture localement pour la demonstration sans vrai envoi.
8. Tests : backend, web et mobile disposent de commandes de validation adaptees au MVP.

## Message de conclusion

GarageFlow montre un MVP coherent : le garage gere son activite depuis le web, le client suit son parcours depuis le mobile, et le backend reste la source de verite pour les droits, les donnees et les regles metier.
