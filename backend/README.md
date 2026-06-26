# Backend GarageFlow

Ce dossier contient le backend Symfony de GarageFlow.
Il fournit le socle de l'API REST qui servira plus tard au dashboard web, a l'application mobile et a la base de donnees MySQL.

## Role du backend

Le backend sera la source de verite de l'application.
Il recevra les requetes HTTP, appliquera les regles de securite, executera la logique metier dans les services et enregistrera les donnees avec Doctrine ORM.

Aucune entite metier, aucun endpoint garage, vehicule, rendez-vous ou intervention n'est encore cree dans cette mission.

## Stack utilisee

* Symfony Framework Bundle
* Doctrine ORM
* Doctrine Migrations
* MySQL
* Symfony Validator
* Symfony Serializer
* Symfony Security Bundle
* Symfony Mailer
* Composer

## Structure des dossiers

```text
backend/
|-- bin/                 -> commandes Symfony
|-- config/              -> configuration Symfony, Doctrine, routes et securite
|-- public/              -> point d'entree HTTP
|-- migrations/          -> futures migrations Doctrine
|-- src/
|   |-- Controller/      -> futurs controleurs HTTP de l'API
|   |-- Entity/          -> futures entites Doctrine
|   |-- Repository/      -> futures requetes vers la base de donnees
|   |-- Service/         -> future logique metier
|   |-- Security/        -> future preparation de l'authentification et des roles
|   |-- DTO/             -> futurs objets de transfert de donnees
|   |-- Validator/       -> futures validations personnalisees
|   `-- EventSubscriber/ -> futurs abonnements aux evenements Symfony
```

## Installation

Depuis le dossier `backend/` :

```bash
composer install
```

CrÃ©er ensuite un fichier `.env.local` si des valeurs locales doivent remplacer celles de `.env`.
Ne jamais versionner de vrais secrets.

## Lancer le backend localement

Avec le serveur PHP integre :

```bash
php -S 127.0.0.1:8000 -t public
```

Si la CLI Symfony est installee plus tard :

```bash
symfony server:start
```

## Base de donnees MySQL

La variable `DATABASE_URL` attend une base MySQL :

```env
DATABASE_URL="mysql://user:password@127.0.0.1:3306/garageflow?serverVersion=8.0&charset=utf8mb4"
```

Un service Docker MySQL de developpement est prepare dans `compose.yaml`.

```bash
docker compose up -d database
```

## Migrations Doctrine

Les entites metier ne sont pas encore creees.
Les commandes suivantes serviront plus tard, quand le modele de donnees sera defini :

```bash
php bin/console make:migration
php bin/console doctrine:migrations:migrate
```

## Verification technique

```bash
php bin/console about
php bin/console lint:container
composer audit
```
## Fixtures de reference

Les fixtures de reference servent a charger les donnees indispensables au fonctionnement de base du backend.
Elles ajoutent uniquement les roles Symfony et les statuts d'intervention du MVP.
Elles ne creent pas de faux utilisateur, de garage de demonstration, de rendez-vous ou d'intervention.

```bash
php bin/console doctrine:fixtures:load --append
```

Les roles charges sont `ROLE_ADMIN`, `ROLE_GERANT`, `ROLE_EMPLOYE` et `ROLE_CLIENT`.
Les statuts charges sont les etapes de suivi atelier comme `VEHICULE_DEPOSE`, `DIAGNOSTIC_EN_COURS` et `VEHICULE_PRET`.