<!--
Ce fichier propose un plan de soutenance pour GarageFlow.
Il existe pour structurer l'oral dans un ordre clair et aider a gerer le temps devant le jury.
Il communique avec les fiches de pitch, de demonstration, d'architecture et de conclusion.
-->

# Plan de soutenance GarageFlow

## 1. Presentation du contexte

Objectif : expliquer le domaine du projet.

Ce qu'il faut dire : GarageFlow s'adresse aux garages independants qui veulent mieux organiser les rendez-vous et le suivi des reparations.

Duree : 1 minute.

Element a montrer : titre du projet ou page d'accueil du support.

## 2. Probleme identifie

Objectif : montrer pourquoi le projet a du sens.

Ce qu'il faut dire : les appels, les notes dispersees et le manque de suivi client font perdre du temps au garage et creent de l'incertitude pour le client.

Duree : 1 minute.

Element a montrer : exemple simple du client qui appelle pour connaitre l'avancement.

## 3. Solution GarageFlow

Objectif : presenter la reponse au probleme.

Ce qu'il faut dire : une API centrale, un dashboard web pour le garage et une application mobile pour le client.

Duree : 1 minute.

Element a montrer : schema simple backend/web/mobile.

## 4. Fonctionnalites MVP

Objectif : cadrer ce qui est vraiment livre.

Ce qu'il faut dire : authentification, roles, vehicules, garages, prestations, horaires, rendez-vous, interventions, statuts, notes internes et notifications.

Duree : 1 minute 30.

Element a montrer : liste courte des fonctionnalites.

## 5. Architecture technique

Objectif : expliquer les choix techniques.

Ce qu'il faut dire : Symfony pour l'API, Doctrine/MySQL pour les donnees, JWT pour la securite, React pour le web, Expo pour le mobile.

Duree : 2 minutes.

Element a montrer : `ARCHITECTURE_EXPLIQUEE.md` ou un schema de slides.

## 6. Demonstration web garage

Objectif : prouver que le garage peut gerer son activite.

Ce qu'il faut dire : le gerant voit les demandes, accepte un rendez-vous, suit les interventions et gere les informations du garage.

Duree : 4 minutes.

Element a montrer : dashboard, rendez-vous, interventions, notes, notifications, configuration garage.

## 7. Demonstration mobile client

Objectif : prouver que le client peut suivre son parcours.

Ce qu'il faut dire : le client gere ses vehicules, consulte les garages, reserve et suit sa reparation.

Duree : 4 minutes.

Element a montrer : home, vehicules, garages, prestations, rendez-vous, suivi, notifications, profil.

## 8. Securite et roles

Objectif : rassurer sur la separation des droits.

Ce qu'il faut dire : JWT identifie l'utilisateur, les roles separent client, employe, gerant et admin, et le backend filtre les donnees.

Duree : 1 minute 30.

Element a montrer : exemple web garage contre mobile client.

## 9. Base de donnees

Objectif : expliquer la persistance des donnees.

Ce qu'il faut dire : MySQL stocke les utilisateurs, garages, vehicules, rendez-vous, interventions, historiques, notes et notifications via Doctrine.

Duree : 1 minute.

Element a montrer : MCD/MLD si disponible dans les documents de reference.

## 10. Tests et qualite

Objectif : montrer que le MVP a ete verifie.

Ce qu'il faut dire : tests backend, lint/build web, tests mobile, audit npm et donnees de demonstration idempotentes.

Duree : 1 minute 30.

Element a montrer : resume de `AUDIT_FINAL_MVP.md`.

## 11. Limites du MVP

Objectif : montrer que le perimetre est maitrise.

Ce qu'il faut dire : pas de paiement, pas de facturation, pas de stock, pas de temps reel, pas de push natif, car le MVP cible d'abord le parcours principal.

Duree : 1 minute.

Element a montrer : `LIMITES_ET_V2.md`.

## 12. Ameliorations futures

Objectif : ouvrir vers une V2 realiste.

Ce qu'il faut dire : paiement, devis/factures, push, statistiques, CI/CD, deploiement cloud, refresh token et design system.

Duree : 1 minute.

Element a montrer : liste des evolutions futures.

## 13. Conclusion

Objectif : finir sur une synthese claire.

Ce qu'il faut dire : GarageFlow montre un parcours complet entre client, garage et backend, avec une architecture propre et testee.

Duree : 30 secondes.

Element a montrer : phrase finale ou slide de conclusion.
