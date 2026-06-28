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
## Prise de rendez-vous client

Le calcul des creneaux disponibles utilise les horaires actifs du garage, les indisponibilites exceptionnelles et les rendez-vous deja pris. Les rendez-vous en statut `EN_ATTENTE` et `CONFIRME` bloquent un creneau. Les rendez-vous `REFUSE` et `ANNULE` ne bloquent pas.

### Consulter les creneaux disponibles

Cette route est publique afin qu'un client puisse verifier les disponibilites avant de finaliser sa demande.

```bash
curl "http://127.0.0.1:8000/api/garages/1/available-slots?serviceId=1&date=2030-01-10"
```

La reponse contient des creneaux de 30 minutes bases sur la duree de la prestation :

```json
[
  {
    "dateDebut": "2030-01-10T09:00:00+01:00",
    "dateFin": "2030-01-10T10:00:00+01:00"
  }
]
```

### Creer une demande de rendez-vous

Cette route necessite un token client. Le vehicule doit appartenir au client connecte. Le statut initial du rendez-vous est `EN_ATTENTE`.

```bash
curl -X POST http://127.0.0.1:8000/api/client/appointments \
  -H "Authorization: Bearer VOTRE_TOKEN_CLIENT" \
  -H "Content-Type: application/json" \
  -d "{\"garageId\":1,\"vehicleId\":1,\"serviceId\":1,\"dateDebut\":\"2030-01-10T09:00:00+01:00\",\"commentaireClient\":\"Merci de verifier les freins.\"}"
```

Si le creneau est deja bloque par une indisponibilite ou par un rendez-vous `EN_ATTENTE` ou `CONFIRME`, l'API retourne `409`.

### Lister ses rendez-vous

```bash
curl http://127.0.0.1:8000/api/client/appointments \
  -H "Authorization: Bearer VOTRE_TOKEN_CLIENT"
```

### Consulter un rendez-vous client

```bash
curl http://127.0.0.1:8000/api/client/appointments/1 \
  -H "Authorization: Bearer VOTRE_TOKEN_CLIENT"
```

Un client ne peut consulter que ses propres rendez-vous. Sinon, l'API retourne `404`.

### Annuler un rendez-vous client

```bash
curl -X PATCH http://127.0.0.1:8000/api/client/appointments/1/cancel \
  -H "Authorization: Bearer VOTRE_TOKEN_CLIENT"
```

Un rendez-vous `EN_ATTENTE` ou `CONFIRME` peut etre annule. Un rendez-vous `REFUSE`, `ANNULE` ou `TERMINE` ne peut pas etre annule a nouveau.
## Gestion des rendez-vous cote garage

Ces routes permettent a un gerant ou employe de consulter les demandes de rendez-vous recues par son garage, puis de les accepter ou refuser. Elles necessitent un token garage (`ROLE_GERANT`, `ROLE_EMPLOYE` ou `ROLE_ADMIN` avec un garage rattache).

Cycle metier :

* le client cree un rendez-vous en statut `EN_ATTENTE` ;
* le garage accepte le rendez-vous : le rendez-vous passe en `CONFIRME` et une intervention est creee automatiquement ;
* le garage refuse le rendez-vous : le rendez-vous passe en `REFUSE` et aucune intervention n'est creee ;
* le client peut continuer a consulter son rendez-vous avec ses routes client.

### Lister les rendez-vous du garage

```bash
curl http://127.0.0.1:8000/api/garage/me/appointments \
  -H "Authorization: Bearer VOTRE_TOKEN_GARAGE"
```

Filtres possibles :

```bash
curl "http://127.0.0.1:8000/api/garage/me/appointments?statut=EN_ATTENTE&date=2030-01-10" \
  -H "Authorization: Bearer VOTRE_TOKEN_GARAGE"
```

### Consulter un rendez-vous du garage

```bash
curl http://127.0.0.1:8000/api/garage/me/appointments/1 \
  -H "Authorization: Bearer VOTRE_TOKEN_GARAGE"
```

Le backend retourne `404` si le rendez-vous n'appartient pas au garage connecte.

### Accepter un rendez-vous

```bash
curl -X PATCH http://127.0.0.1:8000/api/garage/me/appointments/1/accept \
  -H "Authorization: Bearer VOTRE_TOKEN_GARAGE"
```

L'acceptation est possible seulement si le rendez-vous est encore `EN_ATTENTE` et si le creneau reste disponible. Elle cree automatiquement une intervention avec un statut initial, de preference `VEHICULE_DEPOSE`.

### Refuser un rendez-vous

```bash
curl -X PATCH http://127.0.0.1:8000/api/garage/me/appointments/1/refuse \
  -H "Authorization: Bearer VOTRE_TOKEN_GARAGE" \
  -H "Content-Type: application/json" \
  -d "{\"motifRefus\":\"Creneau indisponible.\"}"
```

Le motif est optionnel. Le refus est possible seulement si le rendez-vous est encore `EN_ATTENTE`.
## Suivi des interventions

Quand un rendez-vous est accepte par le garage, le backend cree automatiquement une intervention. Le garage peut ensuite changer son statut, ajouter un historique et gerer des notes internes. Le client peut consulter l'avancement de sa reparation, mais ne voit jamais les notes internes.

### Interventions cote garage

Lister les interventions du garage connecte :

```bash
curl http://127.0.0.1:8000/api/garage/me/interventions \
  -H "Authorization: Bearer VOTRE_TOKEN_GARAGE"
```

Filtres possibles :

```bash
curl "http://127.0.0.1:8000/api/garage/me/interventions?statusCode=DIAGNOSTIC_EN_COURS&date=2030-01-10" \
  -H "Authorization: Bearer VOTRE_TOKEN_GARAGE"
```

Consulter une intervention :

```bash
curl http://127.0.0.1:8000/api/garage/me/interventions/1 \
  -H "Authorization: Bearer VOTRE_TOKEN_GARAGE"
```

Changer le statut d'une intervention :

```bash
curl -X PATCH http://127.0.0.1:8000/api/garage/me/interventions/1/status \
  -H "Authorization: Bearer VOTRE_TOKEN_GARAGE" \
  -H "Content-Type: application/json" \
  -d "{\"statusCode\":\"DIAGNOSTIC_EN_COURS\",\"commentaire\":\"Diagnostic commence.\"}"
```

Chaque changement de statut cree une ligne d'historique. Si le statut devient `VEHICULE_RECUPERE`, l'intervention est cloturee et le rendez-vous lie passe en `TERMINE`.

### Notes internes garage

Les notes internes sont reservees au garage et ne sont jamais retournees dans les routes client.

```bash
curl http://127.0.0.1:8000/api/garage/me/interventions/1/notes \
  -H "Authorization: Bearer VOTRE_TOKEN_GARAGE"

curl -X POST http://127.0.0.1:8000/api/garage/me/interventions/1/notes \
  -H "Authorization: Bearer VOTRE_TOKEN_GARAGE" \
  -H "Content-Type: application/json" \
  -d "{\"contenu\":\"Verifier le bruit au freinage.\"}"

curl -X PATCH http://127.0.0.1:8000/api/garage/me/interventions/1/notes/1 \
  -H "Authorization: Bearer VOTRE_TOKEN_GARAGE" \
  -H "Content-Type: application/json" \
  -d "{\"contenu\":\"Verifier aussi les plaquettes.\"}"

curl -X DELETE http://127.0.0.1:8000/api/garage/me/interventions/1/notes/1 \
  -H "Authorization: Bearer VOTRE_TOKEN_GARAGE"
```

### Interventions cote client

Le client consulte uniquement les interventions liees a ses propres rendez-vous. L'historique retourne cote client est limite aux statuts marques comme visibles client.

```bash
curl http://127.0.0.1:8000/api/client/interventions \
  -H "Authorization: Bearer VOTRE_TOKEN_CLIENT"

curl http://127.0.0.1:8000/api/client/interventions/1 \
  -H "Authorization: Bearer VOTRE_TOKEN_CLIENT"
```

Cycle de suivi : rendez-vous accepte, intervention creee, statut mis a jour par le garage, historique ajoute, client informe via consultation API et notifications applicatives.

## Notifications applicatives

Les notifications applicatives informent les utilisateurs connectes des evenements importants du MVP. Elles utilisent le canal `APP` uniquement pour cette mission : aucun email reel n'est envoye.

Evenements qui creent une notification :

* creation d'une demande de rendez-vous : `RDV_DEMANDE` pour les gerants du garage ;
* acceptation d'un rendez-vous : `RDV_ACCEPTE` pour le client ;
* refus d'un rendez-vous : `RDV_REFUSE` pour le client ;
* annulation par le client : `RDV_ANNULE` pour les gerants du garage ;
* changement de statut d'intervention : `STATUT_INTERVENTION_CHANGE` pour le client ;
* vehicule pret : `VEHICULE_PRET` pour le client, sans doublon avec le changement de statut classique.

Consulter ses notifications :

```bash
curl http://127.0.0.1:8000/api/notifications \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

Consulter seulement les notifications non lues :

```bash
curl "http://127.0.0.1:8000/api/notifications?unreadOnly=true" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

Marquer une notification comme lue :

```bash
curl -X PATCH http://127.0.0.1:8000/api/notifications/1/read \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

Marquer toutes ses notifications comme lues :

```bash
curl -X PATCH http://127.0.0.1:8000/api/notifications/read-all \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

Chaque utilisateur ne peut consulter et modifier que ses propres notifications. Le backend retourne `404` si une notification existe mais appartient a un autre utilisateur.
## Qualite finale et documentation API

Cette section regroupe les commandes a lancer avant de livrer le backend ou de commencer une nouvelle couche frontend.

### Installation backend

```bash
composer install
docker compose up -d database
php bin/console doctrine:database:create --if-not-exists
php bin/console doctrine:migrations:migrate
php bin/console doctrine:fixtures:load --append --no-interaction
```

### Configuration MySQL Docker

Le service Docker `database` expose MySQL sur `127.0.0.1:3306`. En developpement local, `.env.local` doit contenir une `DATABASE_URL` adaptee au container. Ce fichier reste local et ne doit jamais etre commite.

### Configuration JWT dev

Les cles de developpement sont generees dans `config/jwt/private.pem` et `config/jwt/public.pem`.

```bash
php bin/console lexik:jwt:generate-keypair --overwrite
php bin/console lexik:jwt:check-config
```

Sur Windows, si OpenSSL echoue, definir temporairement `OPENSSL_CONF` vers le fichier `openssl.cnf` local avant de relancer la commande.

### Configuration JWT test

Les tests utilisent des cles separees dans `config/jwt/test/private.pem` et `config/jwt/test/public.pem`. Elles sont ignorees par Git. `.env.test` utilise `test_passphrase`, acceptable uniquement pour les tests locaux.

```bash
php bin/console lexik:jwt:generate-keypair --env=test --overwrite
php bin/console lexik:jwt:check-config --env=test
```

### Base et migrations de test

`.env.test` pointe vers la base racine `garageflow`. Doctrine ajoute automatiquement le suffixe `_test`, donc les tests utilisent `garageflow_test`.

```bash
php bin/console doctrine:database:create --env=test --if-not-exists
php bin/console doctrine:migrations:migrate --env=test --no-interaction
```

### Scripts Composer

```bash
composer test
composer test:mission12
composer quality
composer routes
```

`composer quality` lance la validation Composer, le lint du container Symfony, la validation du schema Doctrine et PHPUnit.

### Commandes de verification

```bash
composer validate --strict
php bin/console lint:container
php bin/console doctrine:schema:validate
php bin/console debug:router
php bin/phpunit
php bin/phpunit tests/Mission12
```

### Documentation API

* `docs/API.md` liste les endpoints principaux par domaine.
* `docs/DEMO_SCENARIO.md` propose un scenario oral pour presenter le MVP.
* `docs/QUALITY_AUDIT.md` resume les controles qualite et securite.
* `tests/README.md` explique l'organisation des tests.
* `tests/Mission12/README.md` detaille la premiere campagne PHPUnit.

### Endpoints principaux par domaine

* Auth : `/api/auth/register/client`, `/api/auth/login`, `/api/me`.
* Vehicules : `/api/client/vehicles`.
* Garages : `/api/garages`, `/api/garage/me`, `/api/garage/me/services`, `/api/garage/me/opening-hours`, `/api/garage/me/unavailabilities`.
* RDV client : `/api/client/appointments`.
* RDV garage : `/api/garage/me/appointments`.
* Interventions : `/api/garage/me/interventions`, `/api/client/interventions`.
* Notifications : `/api/notifications`.

### Regles de securite Git

Ne jamais commiter `.env.local`, `.env.test.local`, `.rnd`, `var/`, `vendor/`, `node_modules/`, ni les fichiers `.pem` de `config/jwt/`. Verifier avec `git status --short` avant chaque commit.
