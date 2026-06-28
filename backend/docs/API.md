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

## Auth

| Methode | Route | Role | Description | Codes principaux |
|---|---|---|---|---|
| POST | `/api/auth/register/client` | Public | Cree un compte client. | 201, 400, 409 |
| POST | `/api/auth/login` | Public | Retourne un token JWT. | 200, 401 |
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

## Vehicules Client

| Methode | Route | Role | Description | Codes principaux |
|---|---|---|---|---|
| GET | `/api/client/vehicles` | ROLE_CLIENT | Liste les vehicules du client. | 200, 401 |
| POST | `/api/client/vehicles` | ROLE_CLIENT | Cree un vehicule. | 201, 400, 409 |
| GET | `/api/client/vehicles/{id}` | ROLE_CLIENT | Consulte un vehicule du client. | 200, 404 |
| PATCH | `/api/client/vehicles/{id}` | ROLE_CLIENT | Modifie un vehicule du client. | 200, 400, 404, 409 |
| DELETE | `/api/client/vehicles/{id}` | ROLE_CLIENT | Supprime un vehicule du client. | 204, 404 |

Body creation vehicule :

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

## Garages

| Methode | Route | Role | Description | Codes principaux |
|---|---|---|---|---|
| GET | `/api/garages` | Public | Liste les garages actifs. | 200 |
| GET | `/api/garages/{id}` | Public | Detail public d'un garage. | 200, 404 |
| GET | `/api/garages/{id}/services` | Public | Prestations actives d'un garage. | 200, 404 |
| GET | `/api/garages/{id}/available-slots?serviceId=1&date=2030-01-10` | Public | Creneaux disponibles. | 200, 400, 404 |
| GET | `/api/garage/me` | ROLE_EMPLOYE | Garage rattache a l'utilisateur. | 200, 403, 404 |
| PATCH | `/api/garage/me` | ROLE_GERANT | Modifie le garage. | 200, 400, 403 |
| POST | `/api/garage/me/services` | ROLE_GERANT | Cree une prestation. | 201, 400, 403 |
| POST | `/api/garage/me/opening-hours` | ROLE_GERANT | Cree un horaire. | 201, 400, 403 |
| POST | `/api/garage/me/unavailabilities` | ROLE_GERANT | Cree une indisponibilite. | 201, 400, 403 |

Body prestation :

```json
{
  "nom": "Vidange",
  "description": "Vidange moteur",
  "dureeMinutes": 60,
  "actif": true
}
```

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

## Interventions

| Methode | Route | Role | Description | Codes principaux |
|---|---|---|---|---|
| GET | `/api/garage/me/interventions` | ROLE_EMPLOYE | Liste les interventions garage. | 200, 403 |
| GET | `/api/garage/me/interventions/{id}` | ROLE_EMPLOYE | Detail garage avec notes internes. | 200, 404 |
| PATCH | `/api/garage/me/interventions/{id}/status` | ROLE_EMPLOYE | Change le statut et historise. | 200, 400, 404 |
| POST | `/api/garage/me/interventions/{id}/notes` | ROLE_EMPLOYE | Cree une note interne. | 201, 400, 404 |
| GET | `/api/client/interventions` | ROLE_CLIENT | Liste les interventions du client. | 200, 403 |
| GET | `/api/client/interventions/{id}` | ROLE_CLIENT | Detail client sans notes internes. | 200, 404 |

Body changement statut :

```json
{
  "statusCode": "DIAGNOSTIC_EN_COURS",
  "commentaire": "Diagnostic commence."
}
```

## Notifications

| Methode | Route | Role | Description | Codes principaux |
|---|---|---|---|---|
| GET | `/api/notifications` | Connecte | Liste ses notifications. | 200, 401 |
| GET | `/api/notifications?unreadOnly=true` | Connecte | Liste seulement les non lues. | 200, 401 |
| PATCH | `/api/notifications/{id}/read` | Connecte | Marque une notification comme lue. | 200, 404 |
| PATCH | `/api/notifications/read-all` | Connecte | Marque toutes ses notifications comme lues. | 200 |