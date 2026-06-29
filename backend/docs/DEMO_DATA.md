<!--
Ce fichier documente les donnees de demonstration backend GarageFlow.
Il existe pour aider a preparer une presentation jury avec une base locale deja remplie.
Il communique avec la commande Symfony app:create-demo-data, le dashboard web garage et l'application mobile client.
-->

# Donnees de demonstration GarageFlow

## Commande

Depuis `backend/` :

```bash
php bin/console app:create-demo-data
```

La commande est idempotente : elle cree les donnees manquantes et reutilise les donnees deja presentes. Elle ne supprime pas la base et ne remet pas a zero les donnees existantes.

## Comptes disponibles

Mot de passe local pour tous les comptes : `Password123`.

| Role | Email |
| --- | --- |
| Gerant | `gerant.demo@garageflow.local` |
| Employe | `employe.demo@garageflow.local` |
| Client | `client.demo@garageflow.local` |

Ces identifiants sont uniquement prevus pour une base locale de demonstration.

## Scenario de demonstration

1. Se connecter au dashboard web avec le compte gerant.
2. Montrer le garage `Garage Demo GarageFlow`, ses prestations et ses horaires.
3. Montrer les rendez-vous en attente, confirmes, refuses et annules.
4. Ouvrir les interventions pour presenter les statuts et les notes internes cote garage.
5. Se connecter a l'application mobile avec le compte client.
6. Montrer les vehicules du client, ses rendez-vous, le suivi des reparations et les notifications non lues.

## Donnees visibles cote web garage

* Garage actif a Paris.
* Prestations actives : vidange, diagnostic electronique, plaquettes de frein, revision complete, controle climatisation.
* Horaires d'ouverture du lundi au samedi.
* Plusieurs rendez-vous avec statuts differents.
* Interventions en cours avec historiques de statut.
* Notes internes garage sur certaines interventions.
* Notifications non lues pour le gerant.

## Donnees visibles cote mobile client

* Compte client `Demo Client`.
* Deux vehicules : Renault Clio IV et Peugeot 308.
* Rendez-vous en attente, confirmes, annules, refuses et termines.
* Timeline de suivi pour plusieurs interventions.
* Notifications lues et non lues liees aux rendez-vous et interventions.

## Limites

La commande ne cree pas de paiement, facture, stock de pieces, SMS ou chat temps reel. Ces elements sont hors MVP selon `AGENTS.md`.