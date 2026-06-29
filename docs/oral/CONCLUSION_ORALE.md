<!--
Ce fichier prepare les conclusions orales de GarageFlow.
Il existe pour terminer la soutenance avec une synthese claire et rappeler les competences demontrees.
Il communique avec le pitch, le plan de soutenance et l'audit final du MVP.
-->

# Conclusion orale GarageFlow

## Conclusion courte

GarageFlow est un MVP complet qui relie un backend Symfony, un dashboard web garage et une application mobile client. Le projet montre un parcours coherent : le client demande un rendez-vous, le garage le gere, une intervention est creee et le client peut suivre l'avancement. Le tout repose sur une API REST, une base MySQL, une authentification JWT, des roles et des tests.

## Conclusion longue

Pour conclure, GarageFlow repond a un probleme concret des garages independants : organiser les rendez-vous, centraliser les informations et mieux communiquer avec les clients. Le MVP ne cherche pas a tout remplacer dans un garage, mais il couvre le parcours essentiel entre le client et l'atelier.

Cote client, l'application mobile permet de gerer ses vehicules, consulter les garages, demander un rendez-vous, suivre une intervention et lire ses notifications. Cote garage, le dashboard web permet de gerer les rendez-vous, les interventions, les statuts, les notes internes, les notifications et la configuration du garage.

Techniquement, le projet m'a permis de travailler sur une architecture complete : Symfony pour l'API REST, Doctrine et MySQL pour la persistance, JWT pour la securite, React pour le web, Expo pour le mobile, plus des tests et une documentation de demonstration. Les limites sont assumees : pas de paiement, pas de facturation, pas de push natif et pas encore de deploiement production. Ces sujets deviennent des pistes naturelles pour une V2.

Le resultat est donc un socle MVP coherent, testable localement et presentable devant un jury, avec une separation claire entre backend, web, mobile et documentation.

## Phrase de fin impactante

"GarageFlow montre comment un garage independant peut passer d'une organisation dispersee a un suivi clair, partage et securise entre le garage et son client."

## Competences demontrees

* Backend Symfony avec une API REST structuree.
* Utilisation de Doctrine ORM et MySQL.
* Gestion de l'authentification JWT.
* Gestion des roles et de la securite des routes.
* Developpement frontend React avec Vite et Tailwind CSS.
* Developpement mobile React Native avec Expo.
* Separation des responsabilites entre backend, web et mobile.
* Tests backend, web et mobile.
* Donnees de demonstration idempotentes.
* Documentation technique et orale.
* Gestion de projet avec un perimetre MVP clair.

## Reponse finale si le jury demande ce que le projet prouve

"Ce projet prouve que je sais construire une application complete avec plusieurs interfaces, une API securisee, une base relationnelle, des tests et une documentation claire, tout en respectant un perimetre MVP realiste."
