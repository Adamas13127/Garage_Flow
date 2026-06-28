<!--
Ce fichier documente le backend Symfony de GarageFlow.
Il existe pour expliquer au jury et aux developpeurs comment installer, lancer et tester l'API.
Il communique indirectement avec les commandes Symfony, Docker, Doctrine et les routes HTTP du backend.
-->

# Backend GarageFlow

Ce dossier contient le backend Symfony de GarageFlow. Il fournit l'API REST utilisee par le dashboard web garage et l'application mobile client.

## Role du backend

Le backend est la source de verite de l'application. Il recoit les requetes HTTP, verifie les droits, applique la logique metier dans les services et enregistre les donnees avec Doctrine ORM et MySQL.

## Stack utilisee

* Symfony Framework Bundle
* Doctrine ORM
* Doctrine Migrations
* MySQL
* Symfony Validator
* Symfony Serializer
* Symfony Security Bundle
* LexikJWTAuthenticationBundle
* Doctrine Fixtures Bundle
* Symfony Mailer
* Composer

## Structure des dossiers

```text
backend/
|-- bin/                 -> commandes Symfony
|-- config/              -> configuration Symfony, Doctrine, routes et securite
|-- migrations/          -> migrations Doctrine
|-- public/              -> point d'entree HTTP
|-- src/
|   |-- Command/         -> commandes Symfony de developpement
|   |-- Controller/      -> controleurs HTTP de l'API
|   |-- DTO/             -> objets qui portent et valident les donnees recues
|   |-- Entity/          -> entites Doctrine synchronisees avec MySQL
|   |-- EventSubscriber/ -> abonnements aux evenements Symfony
|   |-- Repository/      -> requetes vers la base de donnees
|   |-- Security/        -> exceptions et classes liees a la securite
|   |-- Service/         -> logique metier appelee par les controleurs
|   `-- Validator/       -> validations personnalisees futures
```

## Installation

Depuis le dossier `backend/` :

```bash
composer install
```

Creer ensuite un fichier `.env.local` pour les valeurs locales. Ne jamais versionner de vrais secrets.

## Base de donnees MySQL

La variable `DATABASE_URL` doit pointer vers MySQL :

```env
DATABASE_URL="mysql://app:!ChangeMe!@127.0.0.1:3306/app?serverVersion=8.0&charset=utf8mb4"
```

Demarrer le service Docker MySQL :

```bash
docker compose up -d database
```

Creer la base si besoin :

```bash
php bin/console doctrine:database:create --if-not-exists
```

## Migrations Doctrine

Creer une migration apres modification du modele :

```bash
php bin/console make:migration
```

Executer les migrations :

```bash
php bin/console doctrine:migrations:migrate
```

Verifier le schema :

```bash
php bin/console doctrine:schema:validate
```

## Fixtures de reference

Les fixtures chargent les donnees indispensables au fonctionnement de base : roles Symfony et statuts d'intervention du MVP.

```bash
php bin/console doctrine:fixtures:load --append --no-interaction
```

Les roles charges sont `ROLE_ADMIN`, `ROLE_GERANT`, `ROLE_EMPLOYE` et `ROLE_CLIENT`.

## Authentification JWT

Le backend utilise JWT pour proteger les routes privees. Les cles locales ne doivent jamais etre commitees.

```bash
php bin/console lexik:jwt:generate-keypair --overwrite
```

Sur Windows/XAMPP, si OpenSSL ne trouve pas sa configuration :

```bash
set OPENSSL_CONF=C:\xampp_neuf\php\extras\openssl\openssl.cnf
php bin/console lexik:jwt:generate-keypair --overwrite
```

Connexion :

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"client.test@example.com\",\"password\":\"Password123\"}"
```

## Commande de demonstration garage

La commande suivante cree localement un garage actif et un compte gerant pour tester les routes protegees du garage. Elle est idempotente : si les donnees existent deja, elle les reutilise.

```bash
php bin/console app:create-demo-garage
```

Identifiants locaux crees par la commande :

```text
Email: gerant.demo@garageflow.local
Mot de passe: Password123
```

Ces identifiants sont uniquement destines au developpement local.

## Lancer le backend localement

Avec le serveur PHP integre :

```bash
php -S 127.0.0.1:8000 -t public
```

Avec la CLI Symfony si elle est installee :

```bash
symfony server:start
```

## Catalogue public des garages

Ces routes sont publiques car un client doit pouvoir consulter les garages avant de se connecter.

```bash
curl http://127.0.0.1:8000/api/garages
curl http://127.0.0.1:8000/api/garages/1
curl http://127.0.0.1:8000/api/garages/1/services
```

## Gestion du garage connecte

Ces routes sont protegees par JWT. Les routes de lecture acceptent `ROLE_EMPLOYE`, `ROLE_GERANT` et `ROLE_ADMIN`. Les modifications acceptent `ROLE_GERANT` et `ROLE_ADMIN`.

Consulter son garage :

```bash
curl http://127.0.0.1:8000/api/garage/me \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

Modifier son garage :

```bash
curl -X PATCH http://127.0.0.1:8000/api/garage/me \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d "{\"telephone\":\"0102030405\",\"description\":\"Garage de demonstration\"}"
```

### Prestations

```bash
curl http://127.0.0.1:8000/api/garage/me/services \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"

curl -X POST http://127.0.0.1:8000/api/garage/me/services \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d "{\"nom\":\"Vidange\",\"description\":\"Vidange moteur\",\"dureeMinutes\":60,\"actif\":true}"

curl -X PATCH http://127.0.0.1:8000/api/garage/me/services/1 \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d "{\"dureeMinutes\":75}"

curl -X DELETE http://127.0.0.1:8000/api/garage/me/services/1 \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

La suppression d'une prestation la desactive avec `actif=false`.

### Horaires

```bash
curl http://127.0.0.1:8000/api/garage/me/opening-hours \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"

curl -X POST http://127.0.0.1:8000/api/garage/me/opening-hours \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d "{\"jourSemaine\":1,\"heureDebut\":\"09:00\",\"heureFin\":\"18:00\",\"actif\":true}"
```

`heureDebut` doit etre avant `heureFin`. La suppression d'un horaire le desactive avec `actif=false`.

### Indisponibilites

```bash
curl http://127.0.0.1:8000/api/garage/me/unavailabilities \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"

curl -X POST http://127.0.0.1:8000/api/garage/me/unavailabilities \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d "{\"dateDebut\":\"2030-01-10T09:00:00+01:00\",\"dateFin\":\"2030-01-10T12:00:00+01:00\",\"motif\":\"Formation\"}"
```

`dateDebut` doit etre avant `dateFin`. La suppression d'une indisponibilite est physique car l'entite n'a pas de champ `actif`.

## Gestion des vehicules client

Les routes de gestion des vehicules sont protegees par JWT et reservees aux utilisateurs ayant le role `ROLE_CLIENT`.

```bash
curl http://127.0.0.1:8000/api/client/vehicles \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

Un client ne peut voir, modifier ou supprimer que ses propres vehicules.

## Verification technique

```bash
composer validate --strict
php bin/console lint:container
php bin/console doctrine:schema:validate
php bin/console debug:router
```

Ne jamais versionner `.env.local`, les cles JWT locales, `vendor/`, `var/` ou de vrais secrets.
