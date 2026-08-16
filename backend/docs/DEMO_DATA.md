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

Les dates des rendez-vous et des historiques sont calculees par rapport a l'instant d'execution
(`aujourd'hui +/- N jours`), pas figees sur une annee fixe : le scenario reste coherent quel que
soit le jour ou la commande est lancee. La recherche d'idempotence se fait sur le contenu du
commentaire client (stable) plutot que sur la date de rendez-vous (qui change a chaque
execution) : relancer la commande un autre jour met a jour les rendez-vous existants au lieu
d'en creer de nouveaux a cote des anciens.

**Avant une demonstration jury**, repartir d'une base propre est recommande plutot que de
relancer la commande sur une base deja utilisee pour des tests manuels ou automatises :

```bash
php bin/console doctrine:database:drop --force
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate --no-interaction
php bin/console app:create-demo-data
```

Point d'attention : `backend/.env.test` pointe vers la meme base que le developpement local
(`garageflow`), pas vers une base dediee aux tests. Lancer `php bin/phpunit` localement peut donc
laisser des donnees de test (comptes, rendez-vous nommes par les scenarios de test) dans la base
utilisee pour la demo. La commande `app:create-demo-data` ne les supprime pas -- elles ne
correspondent a aucune des definitions ci-dessous, donc rien ne les reutilise ni ne les nettoie.
La sequence de reset ci-dessus est la seule facon fiable de repartir d'un etat garanti propre.

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
3. Ouvrir les rendez-vous en attente (`attente_vidange`, dans 2 jours) et en accepter un.
4. Ouvrir les interventions en cours (`diagnostic`, `reparation`) pour presenter les statuts, leur
   historique et les notes internes cote garage.
5. Se connecter a l'application mobile avec le compte client.
6. Montrer les vehicules du client, puis annuler le rendez-vous confirme "vidange programmee"
   (`confirme_annulable`, dans 3 jours) pour illustrer le parcours d'annulation.
7. Montrer le suivi des reparations en cours et les notifications, lues et non lues.

## Garantie de scenario (cas necessaires a la demonstration)

Chaque execution de la commande garantit la presence des cas suivants, quel que soit le jour :

* **Un rendez-vous en attente a accepter** : `attente_vidange` (dans 2 jours) et `attente_clim`
  (dans 4 jours).
* **Un rendez-vous confirme annulable, sans intervention en cours** : `confirme_annulable` (dans
  3 jours) -- distinct des rendez-vous deja lies a une intervention, pour ne pas perturber une
  reparation en cours pendant la demonstration.
* **Une intervention en cours avec historique** : `diagnostic` (statut `DIAGNOSTIC_EN_COURS`,
  2 lignes d'historique) et `reparation` (statut `REPARATION_EN_COURS`, 4 lignes d'historique).
* **Des notifications lues et non lues** : 5 notifications non lues, 1 notification deja lue.

## Donnees visibles cote web garage

* Garage actif a Paris.
* Prestations actives : vidange, diagnostic electronique, plaquettes de frein, revision complete, controle climatisation.
* Horaires d'ouverture du lundi au samedi.
* Rendez-vous avec les cinq statuts possibles (en attente, confirme, refuse, annule, termine).
* Interventions en cours avec historiques de statut.
* Notes internes garage sur certaines interventions.
* Notifications non lues pour le gerant.

## Donnees visibles cote mobile client

* Compte client `Demo Client`.
* Deux vehicules : Renault Clio IV et Peugeot 308.
* Rendez-vous en attente, confirmes (dont un annulable), annules, refuses et termines.
* Timeline de suivi pour plusieurs interventions.
* Notifications lues et non lues liees aux rendez-vous et interventions.

## Limites

La commande ne cree pas de paiement, facture, stock de pieces, SMS ou chat temps reel. Ces elements sont hors MVP selon `AGENTS.md`.