<!--
Ce fichier explique l'organisation des tests automatises du backend GarageFlow.
Il existe pour aider les futures missions a garder une qualite stable et mesurable.
Il communique avec PHPUnit, Symfony, Doctrine et les dossiers de tests par mission.
-->

# Tests backend GarageFlow

## Organisation

Les tests sont ranges dans `backend/tests/`.

```text
tests/
|-- Shared/      -> helpers reutilisables pour les tests API
`-- Mission12/   -> premiere campagne de tests automatises du backend
```

`Shared/BaseApiTestCase.php` prepare le client HTTP Symfony, nettoie uniquement la base de test et fournit les assertions communes. `Shared/TestDataFactory.php` cree les roles, statuts, garages, utilisateurs et vehicules necessaires aux scenarios. `Shared/JwtTestHelper.php` obtient un token JWT reel via `/api/auth/login`.

## Base de test

La variable `.env.test` pointe vers la base racine `garageflow`. En environnement test, Doctrine ajoute automatiquement le suffixe `_test`, donc la base utilisee est `garageflow_test`. Les tests refusent de nettoyer une base qui ne se termine pas par `_test`.

## Lancer les tests

```bash
php bin/phpunit
php bin/phpunit tests/Mission12
composer test
composer test:mission12
```

Avant une livraison, lancer aussi :

```bash
composer quality
```

## Strategie par mission

Chaque mission importante peut ajouter un sous-dossier `tests/MissionXX/`. Les tests doivent couvrir les droits, les cas valides, les cas invalides, les erreurs attendues et au moins un parcours de non-regression.

## Regles futures

* Ne pas supprimer un test qui echoue pour masquer un probleme.
* Ne pas utiliser la base de developpement pour les tests automatises.
* Ne pas commiter de cles JWT, `.env.local`, `.env.test.local`, `var/` ou `vendor/`.
* Garder les helpers partages simples et lisibles.
* Documenter dans le README de mission ce qui est couvert et ce qui reste hors scope.