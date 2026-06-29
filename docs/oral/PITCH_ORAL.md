<!--
Ce fichier prepare les pitchs oraux de GarageFlow.
Il existe pour aider a presenter rapidement le probleme, la solution et la valeur du MVP devant un jury.
Il communique avec les supports d'oral et le scenario de demonstration du dossier docs/oral.
-->

# Pitch oral GarageFlow

## Pitch 30 secondes

GarageFlow est une plateforme web et mobile pour les garages independants. L'objectif est de simplifier la prise de rendez-vous, le suivi des reparations et la communication avec les clients. Cote client, on peut choisir un garage, demander un rendez-vous, gerer ses vehicules et suivre l'avancement d'une intervention. Cote garage, le dashboard permet de gerer les rendez-vous, les prestations, les horaires, les interventions, les notes internes et les notifications. Le MVP reduit les appels repetitifs, limite les pertes d'informations et donne une vision claire a chaque utilisateur.

## Pitch 1 minute

GarageFlow part d'un probleme simple : beaucoup de garages independants gerent encore les rendez-vous, les demandes clients et le suivi des reparations par telephone, carnet papier ou messages disperses. Cela cree des oublis, des pertes d'informations et beaucoup d'appels pour savoir ou en est un vehicule.

La solution proposee est une plateforme composee de deux interfaces. Le garage utilise un dashboard web pour gerer son activite : rendez-vous, prestations, horaires, interventions, notes internes et notifications. Le client utilise une application mobile pour enregistrer ses vehicules, prendre rendez-vous et suivre l'avancement de la reparation.

Le MVP se concentre sur la valeur principale : mieux organiser le garage et rassurer le client. Le backend Symfony reste la source de verite, avec une API REST, une base MySQL, des roles utilisateurs et une authentification JWT.

## Pitch 3 minutes

GarageFlow est un projet de plateforme type Doctolib, mais adaptee aux garages automobiles independants. Le constat de depart est que beaucoup de petits garages n'ont pas d'outil simple pour centraliser les demandes clients, les rendez-vous, le suivi des interventions et les notifications. Le client appelle souvent pour demander un creneau, rappeler les informations de son vehicule ou savoir si la reparation avance. De son cote, le garage doit jongler entre les appels, les notes internes, les prestations, les horaires et les demandes en attente.

Le probleme principal est donc la dispersion de l'information. Une information peut etre dans un appel, une note papier, un message ou la memoire d'un employe. Cela peut provoquer des retards, des oublis et une experience client moins rassurante.

GarageFlow propose une solution simple avec deux interfaces complementaires. Le dashboard web est pense pour le garage. Il permet au gerant ou a l'employe de visualiser les rendez-vous, accepter ou refuser une demande, suivre les interventions, changer les statuts, ajouter des notes internes et gerer les notifications. Il permet aussi de configurer le garage, les prestations, les horaires et les indisponibilites.

L'application mobile est pensee pour le client. Elle permet de se connecter, consulter les garages, voir les prestations, enregistrer ses vehicules, demander un rendez-vous, consulter ses rendez-vous, suivre une intervention et lire ses notifications. Le client gagne en autonomie, car il peut voir l'etat de son dossier sans appeler le garage.

Techniquement, le projet est organise en monorepo. Le backend Symfony expose une API REST et utilise Doctrine ORM avec MySQL. L'authentification repose sur JWT et les roles separent les droits client, employe, gerant et admin. Le web est developpe avec React, Vite et Tailwind CSS. Le mobile est developpe avec React Native et Expo SDK 54 pour rester compatible avec Expo Go sur iPhone.

Le MVP ne cherche pas a tout faire. Il ne contient pas encore le paiement, la facturation, les devis complexes, le stock de pieces ou le temps reel. Ces choix sont volontaires pour rester concentre sur le parcours essentiel : demander un rendez-vous, le gerer cote garage, creer une intervention et permettre au client de suivre la reparation.
