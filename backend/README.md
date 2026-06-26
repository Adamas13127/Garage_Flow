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

CrÃƒÆ’Ã‚Â©er ensuite un fichier `.env.local` si des valeurs locales doivent remplacer celles de `.env`.
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
## Authentification JWT

Le backend utilise LexikJWTAuthenticationBundle pour creer des tokens JWT.
Les cles privee et publique sont locales et ne doivent jamais etre commit.

### Generer les cles JWT

Verifier d'abord que `.env.local` contient les variables JWT :

```env
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=une-passphrase-locale
JWT_TOKEN_TTL=3600
```

Generer ensuite les cles :

```bash
php bin/console lexik:jwt:generate-keypair --overwrite
```

Sur Windows/XAMPP, si OpenSSL ne trouve pas sa configuration, definir `OPENSSL_CONF` avant la commande :

```bash
set OPENSSL_CONF=C:\xampp_neuf\php\extras\openssl\openssl.cnf
php bin/console lexik:jwt:generate-keypair --overwrite
```

Les fichiers `config/jwt/private.pem` et `config/jwt/public.pem` sont ignores par Git.

### Charger les fixtures de reference

```bash
php bin/console doctrine:fixtures:load --append --no-interaction
```

Ces fixtures chargent uniquement les roles (`ROLE_ADMIN`, `ROLE_GERANT`, `ROLE_EMPLOYE`, `ROLE_CLIENT`) et les statuts d'intervention du MVP.

### Exemples de requetes

Inscription client :

```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/client \
  -H "Content-Type: application/json" \
  -d "{\"nom\":\"Client\",\"prenom\":\"Test\",\"email\":\"client.test@example.com\",\"password\":\"Password123\",\"telephone\":\"0600000000\"}"
```

Connexion :

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"client.test@example.com\",\"password\":\"Password123\"}"
```

Utilisateur connecte :

```bash
curl http://127.0.0.1:8000/api/me \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

Ne jamais versionner `.env.local`, les cles JWT locales ou de vrais secrets.
## Gestion des vehicules client

Les routes de gestion des vehicules sont protegees par JWT et reservees aux utilisateurs ayant le role `ROLE_CLIENT`.
Il faut d'abord se connecter avec `/api/auth/login`, puis envoyer le token dans l'en-tete `Authorization`.

### Lister les vehicules

```bash
curl http://127.0.0.1:8000/api/client/vehicles \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### Creer un vehicule

```bash
curl -X POST http://127.0.0.1:8000/api/client/vehicles \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d "{\"marque\":\"Renault\",\"modele\":\"Clio\",\"plaqueImmatriculation\":\"AB-123-CD\",\"kilometrage\":12000,\"annee\":2021,\"carburant\":\"Essence\"}"
```

### Consulter un vehicule

```bash
curl http://127.0.0.1:8000/api/client/vehicles/1 \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### Modifier un vehicule

```bash
curl -X PATCH http://127.0.0.1:8000/api/client/vehicles/1 \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d "{\"kilometrage\":13000,\"carburant\":\"Hybride\"}"
```

### Supprimer un vehicule

```bash
curl -X DELETE http://127.0.0.1:8000/api/client/vehicles/1 \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

Un client ne peut voir, modifier ou supprimer que ses propres vehicules.
Une plaque d'immatriculation ne peut pas etre enregistree deux fois pour le meme client.