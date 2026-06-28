<!--
Ce fichier resume la campagne de tests Mission12 du backend GarageFlow.
Il existe pour presenter clairement le perimetre teste, les resultats et les limites connues.
Il communique avec les classes PHPUnit situees dans tests/Mission12.
-->

# Mission12 - Campagne de tests API

## Bilan

* Tests : 26
* Assertions : 180
* Resultat actuel : OK
* Commande complete : `php bin/phpunit`
* Commande limitee : `php bin/phpunit tests/Mission12`

## Perimetre couvert

* Authentification : inscription client, validation email/password, doublon email, login, mauvais mot de passe, `/api/me`.
* Vehicules : creation, validations, doublon plaque, isolation entre clients.
* Garages : catalogue public, acces garage connecte, prestations, horaires, indisponibilites.
* Rendez-vous : creneaux, creation, conflit, annulation, acceptation, refus.
* Interventions : liste garage, changement de statut, historique, fermeture avec `VEHICULE_RECUPERE`.
* Notes internes : creation cote garage et absence cote client.
* Notifications : creation automatique, filtre non lu, lecture individuelle, isolation utilisateur.

## Cas limites couverts

Les tests verifient plusieurs entrees invalides : champs vides, nombres negatifs, zero quand il doit etre refuse, annee trop ancienne, annee future excessive, chaines longues, accents, caracteres speciaux, tentative XSS simple et tentative SQL injection simple dans des champs texte acceptes.

## Securite testee

* Les routes privees retournent `401` sans token.
* Les routes garage refusent un client avec `403`.
* Un client ne peut pas consulter ou modifier les donnees d'un autre client.
* Une notification d'un autre utilisateur retourne `404`.
* Les reponses critiques ne contiennent pas `password`.
* Les notes internes ne sont pas retournees cote client.

## Non-regression testee

La campagne verifie que les parcours principaux restent compatibles entre eux : login, creation vehicule, disponibilite, prise de rendez-vous, acceptation garage, creation d'intervention, changement de statut et notifications.

## Limites restantes

La campagne ne couvre pas toutes les variantes de modification `PATCH`, tous les filtres de liste, les cas d'administration plateforme, ni une execution CI distante. Ces points pourront etre ajoutes dans de futures missions.