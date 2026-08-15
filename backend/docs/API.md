<!--
Ce fichier documente l'API REST du backend GarageFlow.
Il existe pour aider un jury ou un developpeur a comprendre rapidement les routes disponibles.
Il communique indirectement avec les controleurs Symfony et les tokens JWT utilises par le backend.
-->

# API GarageFlow

Base URL locale : `http://127.0.0.1:8000`

Les routes privees utilisent un token JWT dans l'en-tete :

```http
Authorization: Bearer VOTRE_TOKEN_JWT
```

Document genere a partir du routeur reel (`php bin/console debug:router`) : les 46 routes `api_*`
exposees par le backend y figurent.

## Auth

| Methode | Route | Role | Description | Codes principaux |
|---|---|---|---|---|
| POST | `/api/auth/register/client` | Public | Cree un compte client. | 201, 400, 409 |
| POST | `/api/auth/login` | Public | Retourne un token JWT (traite par le firewall Lexik avant le controleur). | 200, 401 |
| GET | `/api/me` | Connecte | Retourne l'utilisateur connecte. | 200, 401 |

Body inscription :

```json
{
  "nom": "Client",
  "prenom": "Demo",
  "email": "client.demo@example.com",
  "password": "Password123",
  "telephone": "0601020304"
}
```

Body login :

```json
{
  "email": "client.demo@example.com",
  "password": "Password123"
}
```

Reponse login (200) :

```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
}
```

## Vehicules Client

| Methode | Route | Role | Description | Codes principaux |
|---|---|---|---|---|
| GET | `/api/client/vehicles` | ROLE_CLIENT | Liste les vehicules du client. | 200, 401 |
| POST | `/api/client/vehicles` | ROLE_CLIENT | Cree un vehicule. | 201, 400, 409 |
| GET | `/api/client/vehicles/{id}` | ROLE_CLIENT | Consulte un vehicule du client. | 200, 404 |
| PATCH | `/api/client/vehicles/{id}` | ROLE_CLIENT | Modifie un vehicule du client. | 200, 400, 404, 409 |
| DELETE | `/api/client/vehicles/{id}` | ROLE_CLIENT | Supprime un vehicule du client. | 204, 404 |

Body creation/modification vehicule :

```json
{
  "marque": "Renault",
  "modele": "Clio",
  "plaqueImmatriculation": "AA-123-AA",
  "kilometrage": 120000,
  "annee": 2018,
  "carburant": "Essence"
}
```

## Garages (catalogue public)

| Methode | Route | Role | Description | Codes principaux |
|---|---|---|---|---|
| GET | `/api/garages` | Public | Liste les garages actifs. | 200 |
| GET | `/api/garages/{id}` | Public | Detail public d'un garage (avec prestations, horaires, indisponibilites). | 200, 404 |
| GET | `/api/garages/{id}/services` | Public | Prestations actives d'un garage. | 200, 404 |
| GET | `/api/garages/{garageId}/available-slots?serviceId=1&date=2030-01-10` | Public | Creneaux disponibles pour une prestation et une date. | 200, 400, 404 |

## Garage - gestion (garage/me)

Toutes ces routes agissent sur le garage rattache a l'utilisateur connecte (recupere via son
compte gerant/employe), jamais via un id dans l'URL.

| Methode | Route | Role | Description | Codes principaux |
|---|---|---|---|---|
| GET | `/api/garage/me` | ROLE_EMPLOYE | Garage rattache a l'utilisateur. | 200, 403, 404 |
| PATCH | `/api/garage/me` | ROLE_GERANT | Modifie les informations du garage. | 200, 400, 403 |
| GET | `/api/garage/me/services` | ROLE_EMPLOYE | Liste les prestations du garage. | 200, 403 |
| POST | `/api/garage/me/services` | ROLE_GERANT | Cree une prestation. | 201, 400, 403 |
| PATCH | `/api/garage/me/services/{id}` | ROLE_GERANT | Modifie une prestation du garage. | 200, 400, 403, 404 |
| DELETE | `/api/garage/me/services/{id}` | ROLE_GERANT | Desactive une prestation (pas de suppression physique). | 204, 403, 404 |
| GET | `/api/garage/me/opening-hours` | ROLE_EMPLOYE | Liste les horaires du garage. | 200, 403 |
| POST | `/api/garage/me/opening-hours` | ROLE_GERANT | Cree un horaire recurrent. | 201, 400, 403 |
| PATCH | `/api/garage/me/opening-hours/{id}` | ROLE_GERANT | Modifie un horaire du garage. | 200, 400, 403, 404 |
| DELETE | `/api/garage/me/opening-hours/{id}` | ROLE_GERANT | Desactive un horaire (pas de suppression physique). | 204, 403, 404 |
| GET | `/api/garage/me/unavailabilities` | ROLE_EMPLOYE | Liste les indisponibilites du garage. | 200, 403 |
| POST | `/api/garage/me/unavailabilities` | ROLE_GERANT | Cree une indisponibilite exceptionnelle. | 201, 400, 403 |
| PATCH | `/api/garage/me/unavailabilities/{id}` | ROLE_GERANT | Modifie une indisponibilite du garage. | 200, 400, 403, 404 |
| DELETE | `/api/garage/me/unavailabilities/{id}` | ROLE_GERANT | Supprime une indisponibilite (suppression physique, pas de champ actif). | 204, 403, 404 |

Body creation/modification garage (PATCH, tous les champs optionnels) :

```json
{
  "nom": "Garage Dupont",
  "adresse": "12 rue des Lilas",
  "ville": "Lyon",
  "codePostal": "69000",
  "telephone": "0472000000",
  "email": "contact@garage-dupont.fr",
  "description": "Garage generaliste toutes marques.",
  "logoUrl": "https://exemple.fr/logo.png",
  "actif": true
}
```

Body creation/modification prestation :

```json
{
  "nom": "Vidange",
  "description": "Vidange moteur",
  "dureeMinutes": 60,
  "actif": true
}
```

Body creation/modification horaire :

```json
{
  "jourSemaine": 1,
  "heureDebut": "09:00",
  "heureFin": "18:00",
  "actif": true
}
```

`jourSemaine` suit la norme ISO-8601 (1 = lundi ... 7 = dimanche).

Body creation/modification indisponibilite :

```json
{
  "dateDebut": "2030-01-10T00:00:00+01:00",
  "dateFin": "2030-01-12T23:59:59+01:00",
  "motif": "Conges d'ete"
}
```

Sur les routes PATCH, seuls les champs presents dans le body sont modifies (semantique de mise a
jour partielle) : un champ absent conserve sa valeur existante.

## Rendez-vous Client

| Methode | Route | Role | Description | Codes principaux |
|---|---|---|---|---|
| GET | `/api/client/appointments` | ROLE_CLIENT | Liste les rendez-vous du client. | 200, 401 |
| POST | `/api/client/appointments` | ROLE_CLIENT | Cree une demande de rendez-vous. | 201, 400, 404, 409 |
| GET | `/api/client/appointments/{id}` | ROLE_CLIENT | Detail d'un rendez-vous client. | 200, 404 |
| PATCH | `/api/client/appointments/{id}/cancel` | ROLE_CLIENT | Annule un rendez-vous. | 200, 404, 409 |

Body creation RDV :

```json
{
  "garageId": 1,
  "vehicleId": 1,
  "serviceId": 1,
  "dateDebut": "2030-01-10T09:00:00+01:00",
  "commentaireClient": "Merci de verifier les freins."
}
```

## Rendez-vous Garage

| Methode | Route | Role | Description | Codes principaux |
|---|---|---|---|---|
| GET | `/api/garage/me/appointments` | ROLE_EMPLOYE | Liste les rendez-vous du garage. | 200, 403 |
| GET | `/api/garage/me/appointments/{id}` | ROLE_EMPLOYE | Detail d'un rendez-vous garage. | 200, 404 |
| PATCH | `/api/garage/me/appointments/{id}/accept` | ROLE_EMPLOYE | Accepte le rendez-vous et cree l'intervention. | 200, 404, 409 |
| PATCH | `/api/garage/me/appointments/{id}/refuse` | ROLE_EMPLOYE | Refuse le rendez-vous. | 200, 400, 404, 409 |

Body refus (optionnel, motif libre) :

```json
{
  "motifRefus": "Creneau finalement indisponible."
}
```

## Interventions

| Methode | Route | Role | Description | Codes principaux |
|---|---|---|---|---|
| GET | `/api/garage/me/interventions` | ROLE_EMPLOYE | Liste les interventions garage. | 200, 400, 403 |
| GET | `/api/garage/me/interventions/{id}` | ROLE_EMPLOYE | Detail garage avec historique et notes internes. | 200, 403, 404 |
| PATCH | `/api/garage/me/interventions/{id}/status` | ROLE_EMPLOYE | Change le statut et historise. | 200, 400, 403, 404 |
| GET | `/api/garage/me/interventions/{id}/notes` | ROLE_EMPLOYE | Liste les notes internes de l'intervention. | 200, 403, 404 |
| POST | `/api/garage/me/interventions/{id}/notes` | ROLE_EMPLOYE | Cree une note interne. | 201, 400, 403, 404 |
| PATCH | `/api/garage/me/interventions/{id}/notes/{noteId}` | ROLE_EMPLOYE | Modifie une note interne. | 200, 400, 403, 404 |
| DELETE | `/api/garage/me/interventions/{id}/notes/{noteId}` | ROLE_EMPLOYE | Supprime une note interne. | 204, 403, 404 |
| GET | `/api/client/interventions` | ROLE_CLIENT | Liste les interventions du client. | 200, 403 |
| GET | `/api/client/interventions/{id}` | ROLE_CLIENT | Detail client avec historique visible, sans notes internes. | 200, 404 |

Les notes internes ne sont jamais exposees par les routes client (`/api/client/interventions*`) ni
ajoutees aux emails clients : elles n'existent que sur les routes garage.

Body changement statut :

```json
{
  "statusCode": "DIAGNOSTIC_EN_COURS",
  "commentaire": "Diagnostic commence."
}
```

Body creation/modification note interne :

```json
{
  "contenu": "Piece commandee, delai de 48h."
}
```

## Notifications

| Methode | Route | Role | Description | Codes principaux |
|---|---|---|---|---|
| GET | `/api/notifications` | Connecte | Liste ses notifications. | 200, 401 |
| GET | `/api/notifications?unreadOnly=true` | Connecte | Liste seulement les non lues. | 200, 401 |
| PATCH | `/api/notifications/{id}/read` | Connecte | Marque une notification comme lue. | 200, 404 |
| PATCH | `/api/notifications/read-all` | Connecte | Marque toutes ses notifications comme lues. | 200 |

## Format des reponses d'erreur

Trois formats coexistent selon la couche qui intercepte l'erreur :

**1. Erreurs metier (couche applicative)**, retournees explicitement par les controleurs pour
tous les cas prevus (validation, ressource introuvable, conflit) :

```json
{
  "message": "Les donnees envoyees sont invalides.",
  "errors": {
    "email": ["L email est obligatoire."]
  }
}
```

La cle `errors` n'apparait que sur les 400 de validation Symfony Validator ; les autres erreurs
metier (404, 409) ne renvoient que `message`.

**2. Erreurs d'authentification JWT**, generees directement par LexikJWTAuthenticationBundle
avant d'atteindre un controleur (token absent, invalide ou expire) : format different, avec un
`code` numerique au lieu d'`errors` :

```json
{
  "code": 401,
  "message": "JWT Token not found"
}
```

**3. Erreurs non interceptees par l'application** (route inexistante -> 404, acces refuse par
`#[IsGranted]` sans catch dans le controleur -> 403, exception non prevue -> 500) : aucun
listener JSON dedie n'est configure (`config/packages/` ne definit pas de format d'erreur global,
et le projet ne declare aucun `EventSubscriber` d'exception). Le comportement retombe sur celui
par defaut de Symfony :

- Sans en-tete `Accept: application/json`, Symfony renvoie une page HTML de debug.
- Avec `Accept: application/json`, Symfony renvoie un format "probleme" generique :

```json
{
  "type": "https://tools.ietf.org/html/rfc2616#section-10",
  "title": "An error occurred",
  "status": 403,
  "detail": "Access Denied. The user doesn't have ROLE_GERANT.",
  "class": "Symfony\\Component\\Security\\Core\\Exception\\AccessDeniedException"
}
```

Point d'attention : en environnement `dev` (`APP_ENV=dev`), ces deux variantes incluent une trace
d'appel complete avec les chemins de fichiers locaux du serveur. C'est acceptable en
developpement mais a verifier avant toute demonstration ou mise en ligne sur un environnement
qui ne serait pas strictement local (s'assurer que `APP_ENV=prod` est utilise, ou a defaut ne
jamais exposer ce serveur en dehors de `127.0.0.1`).
