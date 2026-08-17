<!--
Ce fichier est le dictionnaire des donnees et la table de correspondance du backend GarageFlow.
Il existe pour documenter, champ par champ, l'etat reel du schema (migrations Doctrine), du mapping
ORM (entites) et de l'exposition API (controleurs), verifie par lecture directe du code le 2026-08-17.
Il communique avec les migrations backend/migrations/*.php, les entites backend/src/Entity/*.php
et les controleurs backend/src/Controller/*.php.
-->

# Dictionnaire de données — GarageFlow

Document de référence, vérifié par lecture directe du code le 17 août 2026 (migrations, entités,
contrôleurs). Aucune valeur n'est estimée : quand une information n'a pas pu être établie avec
certitude dans le code, ce document l'indique explicitement plutôt que de l'approximer.

## Avertissement sur la colonne « clé exposée dans l'API »

Ce backend n'a **pas de couche de DTO de sortie**. Les seuls DTO du projet
(`backend/src/DTO/*.php`) valident les données **entrantes** (création/modification). La
sérialisation des réponses est faite par des méthodes privées `serializeXxx()` dans chaque
contrôleur, qui construisent un tableau à la main. La colonne « clé exposée » référence donc,
pour chaque champ, la méthode réelle qui l'expose (`Contrôleur::méthode()`), ou `non exposé` si
aucun contrôleur ne le renvoie. Quand l'exposition diffère selon le destinataire (client ou
garage), les deux sont indiquées séparément.

---

## Table `role`

| Champ | Type SQL | Contraintes | Propriété Doctrine | Clé exposée dans l'API | Libellé métier | Commentaire |
|---|---|---|---|---|---|---|
| id | INT AUTO_INCREMENT | PK | `id` | non exposé | Identifiant du rôle | |
| code | VARCHAR(50) NOT NULL | UNIQUE (`uniq_role_code`) | `code` | `role` sur `/api/me` (`AuthController::me()`), uniquement pour l'utilisateur authentifié lui-même | Code technique du rôle | Valeurs réelles : `ROLE_ADMIN`, `ROLE_GERANT`, `ROLE_EMPLOYE`, `ROLE_CLIENT` (`CreateDemoDataCommand::ensureRoles()`) |
| libelle | VARCHAR(100) NOT NULL | — | `libelle` | non exposé | Libellé humain du rôle | |

Table référencée par `user.role_id`.

---

## Table `garage`

| Champ | Type SQL | Contraintes | Propriété Doctrine | Clé exposée dans l'API | Libellé métier | Commentaire |
|---|---|---|---|---|---|---|
| id | INT AUTO_INCREMENT | PK | `id` | `id` (public : `GarageCatalogController::serializeGarage()` ; garage : `GarageManagementController::serializeGarage()`) | Identifiant du garage | |
| nom | VARCHAR(150) NOT NULL | — | `nom` | `nom` (idem) | Nom du garage | |
| adresse | VARCHAR(255) NOT NULL | — | `adresse` | `adresse` (idem) | Adresse postale | |
| ville | VARCHAR(100) NOT NULL | — | `ville` | `ville` (idem) | Ville | |
| code_postal | VARCHAR(20) NOT NULL | — | `codePostal` | `codePostal` (idem) | Code postal | |
| telephone | VARCHAR(30) NULL | — | `telephone` | `telephone` (idem) | Téléphone | |
| email | VARCHAR(180) NULL | — | `email` | `email` (idem) | Email de contact | |
| description | LONGTEXT NULL (`type: text`) | — | `description` | `description` (idem) | Description libre | |
| logo_url | VARCHAR(255) NULL | — | `logoUrl` | `logoUrl` (idem) | URL du logo | |
| actif | TINYINT(1) NOT NULL DEFAULT 1 | — | `actif` | `actif` (idem) | Garage actif | Un garage inactif n'apparaît pas dans le catalogue public (`GarageCatalogService::getActiveGarages()` filtre `actif = true`) |
| created_at | DATETIME NOT NULL | — | `createdAt` | non exposé | Date de création | Non exposé ni côté public ni côté garage |
| updated_at | DATETIME NULL | — | `updatedAt` | non exposé | Date de dernière modification | Mis à jour par `GarageManagementService::updateGarage()` mais jamais renvoyé au client |

Table référencée par `user.garage_id`, `opening_hour.garage_id`, `unavailability.garage_id`,
`service_prestation.garage_id`, `appointment.garage_id`, `action_log.garage_id`.

---

## Table `user`

| Champ | Type SQL | Contraintes | Propriété Doctrine | Clé exposée dans l'API | Libellé métier | Commentaire |
|---|---|---|---|---|---|---|
| id | INT AUTO_INCREMENT | PK | `id` | `client.id` / `changedBy.id` / `author.id` selon le contexte (jamais comme champ isolé) | Identifiant de l'utilisateur | |
| role_id | INT NOT NULL | FK → `role.id` (`FK_USER_ROLE`), index `IDX_8D93D649D60322AC` | `role` (ManyToOne) | via `role` (code seulement) sur `/api/me` | Rôle de l'utilisateur | |
| garage_id | INT NULL | FK → `garage.id` (`FK_USER_GARAGE`), index `idx_user_garage` | `garage` (ManyToOne) | non exposé comme champ | Garage de rattachement (employé/gérant) | Récupéré via `GarageManagementService::getGarageForUser()`, jamais renvoyé comme propriété de l'utilisateur |
| nom | VARCHAR(100) NOT NULL | — | `nom` | `/api/me` (self) ; `client.nom` (garage, `GarageAppointmentController`/`GarageInterventionController`) ; `changedBy.nom` (`GarageInterventionController::serializeHistory`) ; `author.nom` (`GarageInterventionController::serializeNote`) | Nom de famille | |
| prenom | VARCHAR(100) NOT NULL | — | `prenom` | idem `nom` | Prénom | |
| email | VARCHAR(180) NOT NULL | UNIQUE (`uniq_user_email`) | `email` | `/api/me` (self) ; `client.email` (vue garage) — absent de `changedBy`/`author` | Email de connexion | Sert d'identifiant de connexion (`security.yaml`, provider `property: email`) |
| password | VARCHAR(255) NOT NULL | — | `password` | non exposé | Mot de passe (haché) | Jamais sérialisé (`PasswordAuthenticatedUserInterface`) |
| telephone | VARCHAR(30) NULL | — | `telephone` | `/api/me` (self) ; `client.telephone` (vue garage) — absent de `changedBy`/`author` | Téléphone | |
| actif | TINYINT(1) NOT NULL DEFAULT 1 | — | `actif` | `/api/me` (self) uniquement | Compte actif | Tout changement déclenche `trg_user_audit_sensitive_changes` (AFTER UPDATE), qui journalise dans `action_log` — voir [TRACABILITE.md](TRACABILITE.md) |
| created_at | DATETIME NOT NULL | — | `createdAt` | non exposé | Date de création | |
| updated_at | DATETIME NULL | — | `updatedAt` | non exposé | Date de dernière modification | |

Table référencée par `vehicle.client_id`, `appointment.client_id`, `unavailability.created_by_id`,
`intervention_status_history.changed_by_id`, `internal_note.author_id`, `notification.recipient_id`,
`action_log.user_id`.

---

## Table `opening_hour`

| Champ | Type SQL | Contraintes | Propriété Doctrine | Clé exposée dans l'API | Libellé métier | Commentaire |
|---|---|---|---|---|---|---|
| id | INT AUTO_INCREMENT | PK | `id` | `id` (public : `GarageCatalogController::serializeOpeningHour()` ; garage : `GarageManagementController::serializeOpeningHour()`) | Identifiant du créneau | |
| garage_id | INT NOT NULL | FK → `garage.id` (`FK_OPENING_HOUR_GARAGE`), index `idx_opening_hour_garage` | `garage` (ManyToOne) | non exposé | Garage concerné | Implicite : le contexte garage vient de la route |
| jour_semaine | SMALLINT NOT NULL | CHECK `chk_opening_hour_day` (entre 1 et 7) | `jourSemaine` | `jourSemaine` (public + garage) | Jour de la semaine | Codé 1 à 7 ; aucune convention jour↔numéro (ex. « 1 = lundi ») n'est fixée explicitement dans le code — seule la borne `[1,7]` est validée (`CreateOpeningHourRequest`, `Assert\Range`) |
| heure_debut | TIME NOT NULL (`type: time_immutable`) | CHECK `chk_opening_hour_time` (heure_debut < heure_fin) | `heureDebut` | `heureDebut`, format `H:i` (public + garage) | Heure d'ouverture | |
| heure_fin | TIME NOT NULL | même CHECK que `heure_debut` | `heureFin` | `heureFin`, format `H:i` (idem) | Heure de fermeture | |
| actif | TINYINT(1) NOT NULL DEFAULT 1 | — | `actif` | `actif` (idem) | Créneau actif | La suppression (route DELETE) désactive en réalité le créneau (`OpeningHourService::disable()`) sans le supprimer |

---

## Table `unavailability`

| Champ | Type SQL | Contraintes | Propriété Doctrine | Clé exposée dans l'API | Libellé métier | Commentaire |
|---|---|---|---|---|---|---|
| id | INT AUTO_INCREMENT | PK | `id` | `id` (public + garage) | Identifiant de l'indisponibilité | |
| garage_id | INT NOT NULL | FK → `garage.id` (`FK_UNAVAILABILITY_GARAGE`), index `idx_unavailability_garage` | `garage` (ManyToOne) | non exposé | Garage concerné | Implicite (contexte de route) |
| created_by_id | INT NULL | FK → `user.id` (`FK_UNAVAILABILITY_CREATED_BY`), index `IDX_F0016D1B03A8386` | `createdBy` (ManyToOne) | non exposé | Auteur de la création | Jamais renvoyé, ni côté public ni côté garage |
| date_debut | DATETIME NOT NULL | CHECK `chk_unavailability_dates` (date_debut < date_fin) | `dateDebut` | `dateDebut` (public + garage) | Début de l'indisponibilité | |
| date_fin | DATETIME NOT NULL | même CHECK que `date_debut` | `dateFin` | `dateFin` (idem) | Fin de l'indisponibilité | |
| motif | VARCHAR(255) NULL | — | `motif` | `motif` (idem) | Motif | |
| created_at | DATETIME NOT NULL | — | `createdAt` | `createdAt` **côté garage uniquement** (`GarageManagementController::serializeUnavailability()`) — absent côté public (`GarageCatalogController::serializeUnavailability()` ne l'inclut pas) | Date de création | |

---

## Table `service_prestation`

| Champ | Type SQL | Contraintes | Propriété Doctrine | Clé exposée dans l'API | Libellé métier | Commentaire |
|---|---|---|---|---|---|---|
| id | INT AUTO_INCREMENT | PK | `id` | `id` (public + garage + imbriqué `appointment.service`/`intervention.service`) | Identifiant de la prestation | |
| garage_id | INT NOT NULL | FK → `garage.id` (`FK_SERVICE_PRESTATION_GARAGE`), index `idx_service_prestation_garage` | `garage` (ManyToOne) | non exposé | Garage propriétaire | Implicite (contexte de route) |
| nom | VARCHAR(150) NOT NULL | — | `nom` | `nom` (public, garage, et imbriqué partout où le service apparaît) | Nom de la prestation | |
| description | LONGTEXT NULL (`type: text`) | — | `description` | `description` (public + garage) — **absent** des vues imbriquées (`appointment.service`, `intervention.service` ne contiennent que `id`/`nom`/`dureeMinutes`) | Description | |
| duree_minutes | INT NOT NULL | CHECK `chk_service_prestation_duration` (> 0) | `dureeMinutes` | `dureeMinutes` (public + garage + `appointment.service` (client et garage) + `intervention.service` **côté garage seulement**, absent de `intervention.service` côté client) | Durée en minutes | |
| actif | TINYINT(1) NOT NULL DEFAULT 1 | — | `actif` | `actif` (public + garage) | Prestation active | Désactivation logique via `ServicePrestationService::disable()` (route DELETE) |
| created_at | DATETIME NOT NULL | — | `createdAt` | `createdAt` **côté garage uniquement** (`GarageManagementController::serializeService()`) | Date de création | |
| updated_at | DATETIME NULL | — | `updatedAt` | `updatedAt` **côté garage uniquement** (idem) | Date de dernière modification | |

---

## Table `vehicle`

| Champ | Type SQL | Contraintes | Propriété Doctrine | Clé exposée dans l'API | Libellé métier | Commentaire |
|---|---|---|---|---|---|---|
| id | INT AUTO_INCREMENT | PK | `id` | `id` (`VehicleController` + imbriqué `appointment.vehicle`/`intervention.vehicle`) | Identifiant du véhicule | |
| client_id | INT NOT NULL | FK → `user.id` (`FK_VEHICLE_CLIENT`), index `idx_vehicle_client` | `client` (ManyToOne) | non exposé comme champ | Client propriétaire | Le véhicule est toujours accédé via le client authentifié |
| marque | VARCHAR(100) NOT NULL | — | `marque` | `marque` (`VehicleController` + imbriqué partout) | Marque | |
| modele | VARCHAR(100) NOT NULL | — | `modele` | `modele` (idem) | Modèle | |
| plaque_immatriculation | VARCHAR(20) NOT NULL | UNIQUE (`uniq_vehicle_client_plate`, sur `client_id` + `plaque_immatriculation`) | `plaqueImmatriculation` | `plaqueImmatriculation` (idem) | Plaque d'immatriculation | L'unicité est **par client**, pas globale : la même plaque peut exister pour deux clients différents dans ce MVP |
| kilometrage | INT NULL | — | `kilometrage` | `kilometrage` (`VehicleController` uniquement — absent des vues imbriquées `appointment`/`intervention`) | Kilométrage | |
| annee | INT NULL | — | `annee` | `annee` (idem, `VehicleController` uniquement) | Année du véhicule | |
| carburant | VARCHAR(50) NULL | — | `carburant` | `carburant` (idem) | Type de carburant | |
| created_at | DATETIME NOT NULL | — | `createdAt` | `createdAt` (`VehicleController` uniquement) | Date de création | |
| updated_at | DATETIME NULL | — | `updatedAt` | `updatedAt` (idem) | Date de dernière modification | |

---

## Table `appointment`

| Champ | Type SQL | Contraintes | Propriété Doctrine | Clé exposée dans l'API | Libellé métier | Commentaire |
|---|---|---|---|---|---|---|
| id | INT AUTO_INCREMENT | PK | `id` | `id` (client, garage, export) | Identifiant du rendez-vous | |
| garage_id | INT NOT NULL | FK → `garage.id` (`FK_APPOINTMENT_GARAGE`), index composite `idx_appointment_garage_date` (`garage_id`, `date_debut`) | `garage` (ManyToOne) | `garage.{id,nom}` côté client (`ClientAppointmentController::serializeAppointment()`) ; non exposé côté garage (implicite, c'est son propre garage) | Garage concerné | |
| client_id | INT NOT NULL | FK → `user.id` (`FK_APPOINTMENT_CLIENT`), index `idx_appointment_client` | `client` (ManyToOne) | non exposé côté client (implicite) ; `client.{id,nom,prenom,email,telephone}` côté garage | Client demandeur | |
| vehicle_id | INT NOT NULL | FK → `vehicle.id` (`FK_APPOINTMENT_VEHICLE`), index `idx_appointment_vehicle` | `vehicle` (ManyToOne) | `vehicle.{id,marque,modele,plaqueImmatriculation}` (client et garage) | Véhicule concerné | |
| service_id | INT NOT NULL | FK → `service_prestation.id` (`FK_APPOINTMENT_SERVICE`), index `IDX_FE38F844ED5CA9E6` | `service` (ManyToOne) | `service.{id,nom,dureeMinutes}` (client et garage) | Prestation demandée | |
| date_debut | DATETIME NOT NULL | CHECK `chk_appointment_dates` (date_debut < date_fin) | `dateDebut` | `dateDebut` (client, garage, export) | Début du créneau | |
| date_fin | DATETIME NOT NULL | même CHECK que `date_debut` | `dateFin` | `dateFin` (client, garage ; absent de l'export interventions, présent dans l'export rendez-vous) | Fin du créneau | |
| statut | VARCHAR(50) NOT NULL | — (pas de CHECK ni d'ENUM en base) | `statut` | `statut` (client, garage, export) | Statut du rendez-vous | Défaut applicatif `EN_ATTENTE` (`Appointment::$statut`), pas un défaut SQL. 5 valeurs possibles — voir table de correspondance ci-dessous |
| commentaire_client | LONGTEXT NULL (`type: text`) | — | `commentaireClient` | `commentaireClient` (client, garage, export) | Commentaire du client | |
| created_at | DATETIME NOT NULL | — | `createdAt` | `createdAt` (client + garage) — absent de l'export | Date de création | |
| updated_at | DATETIME NULL | — | `updatedAt` | `updatedAt` (client + garage) — absent de l'export | Date de dernière modification | |

`intervention_id` (dérivé, pas une colonne de cette table — FK inverse portée par `intervention.appointment_id`)
est exposé côté garage sous la clé `interventionId` (`GarageAppointmentController::serializeAppointment()`).

---

## Table `intervention_status`

| Champ | Type SQL | Contraintes | Propriété Doctrine | Clé exposée dans l'API | Libellé métier | Commentaire |
|---|---|---|---|---|---|---|
| id | INT AUTO_INCREMENT | PK | `id` | `status.id` côté garage uniquement, dans la réponse d'acceptation (`GarageAppointmentController::serializeIntervention()`) | Identifiant du statut | |
| code | VARCHAR(80) NOT NULL | UNIQUE (`uniq_intervention_status_code`) | `code` | `statutActuel.code`/`status.code` (client + garage) ; `statutCode` (export interventions) | Code technique du statut | 6 valeurs — voir table de correspondance ci-dessous |
| libelle | VARCHAR(150) NOT NULL | — | `libelle` | `libelle` (mêmes contextes) ; `statutLibelle` (export interventions) | Libellé affiché | |
| ordre_affichage | INT NOT NULL | — | `ordreAffichage` | exposé **côté garage uniquement** (`statutActuel.ordreAffichage`, `history[].status.ordreAffichage`) — absent côté client | Ordre d'affichage | |
| visible_client | TINYINT(1) NOT NULL DEFAULT 1 | — | `visibleClient` | exposé **côté garage uniquement** (idem) | Visible du client | Pilote le filtrage : `ClientInterventionService::getVisibleHistory()` ne renvoie que les entrées d'historique dont `status.visibleClient = true` |

---

## Table `intervention`

| Champ | Type SQL | Contraintes | Propriété Doctrine | Clé exposée dans l'API | Libellé métier | Commentaire |
|---|---|---|---|---|---|---|
| id | INT AUTO_INCREMENT | PK | `id` | `id` (client, garage, export) | Identifiant de l'intervention | |
| appointment_id | INT NOT NULL | FK → `appointment.id` (`FK_INTERVENTION_APPOINTMENT`), UNIQUE (`uniq_intervention_appointment`) | `appointment` (OneToOne) | `appointment.{id,dateDebut,dateFin,statut}` (client + garage) | Rendez-vous d'origine | L'UNIQUE garantit qu'un rendez-vous ne peut avoir qu'une seule intervention |
| statut_actuel_id | INT NOT NULL | FK → `intervention_status.id` (`FK_INTERVENTION_STATUS`), index `IDX_D11814ABA831773D` | `statutActuel` (ManyToOne) | voir table `intervention_status` ci-dessus | Statut courant | |
| notes_resume | LONGTEXT NULL (`type: text`) | — | `notesResume` | `notesResume` **côté garage uniquement** (`GarageInterventionController::serializeInterventionSummary()`) — absent côté client | Résumé des notes | |
| created_at | DATETIME NOT NULL | — | `createdAt` | `createdAt` (client + garage + export) | Date de création | |
| closed_at | DATETIME NULL | — | `closedAt` | `closedAt` (client + garage + export) | Date de clôture | Renseigné automatiquement quand le statut passe à `VEHICULE_RECUPERE` (`GarageInterventionService::updateStatus()`), qui bascule aussi le rendez-vous lié à `TERMINE` |

---

## Table `intervention_status_history`

| Champ | Type SQL | Contraintes | Propriété Doctrine | Clé exposée dans l'API | Libellé métier | Commentaire |
|---|---|---|---|---|---|---|
| id | INT AUTO_INCREMENT | PK | `id` | `id` (client + garage, dans `history[]`) | Identifiant de l'entrée d'historique | |
| intervention_id | INT NOT NULL | FK → `intervention.id` (`FK_HISTORY_INTERVENTION`), index `idx_intervention_status_history_intervention` | `intervention` (ManyToOne) | non exposé | Intervention concernée | Implicite : la collection parente porte déjà ce contexte |
| status_id | INT NOT NULL | FK → `intervention_status.id` (`FK_HISTORY_STATUS`), index `IDX_BDA68DD96BF700BD` | `status` (ManyToOne) | `status.{code,libelle}` côté client (uniquement si `status.visibleClient = true`) ; `status.{code,libelle,ordreAffichage,visibleClient}` côté garage (toutes les entrées) | Statut de l'entrée | |
| changed_by_id | INT NOT NULL | FK → `user.id` (`FK_HISTORY_CHANGED_BY`), index `IDX_BDA68DD9828AD0A0` | `changedBy` (ManyToOne) | non exposé côté client ; `changedBy.{id,nom,prenom}` côté garage uniquement | Auteur du changement | |
| commentaire | LONGTEXT NULL (`type: text`) | — | `commentaire` | `commentaire` (client + garage) | Commentaire | |
| changed_at | DATETIME NOT NULL | — | `changedAt` | `changedAt` (client + garage) | Date du changement | |

Alimentée par `InterventionCreationService::createForAcceptedAppointment()` (entrée initiale à
l'acceptation) et `GarageInterventionService::updateStatus()` (chaque changement ultérieur). C'est
la **timeline métier montrée au client** — distincte de `action_log`, voir [TRACABILITE.md](TRACABILITE.md).

---

## Table `internal_note`

| Champ | Type SQL | Contraintes | Propriété Doctrine | Clé exposée dans l'API | Libellé métier | Commentaire |
|---|---|---|---|---|---|---|
| id | INT AUTO_INCREMENT | PK | `id` | `id` (garage uniquement) | Identifiant de la note | |
| intervention_id | INT NOT NULL | FK → `intervention.id` (`FK_INTERNAL_NOTE_INTERVENTION`), index `idx_internal_note_intervention` | `intervention` (ManyToOne) | non exposé | Intervention concernée | Implicite (route `/interventions/{id}/notes`) |
| author_id | INT NOT NULL | FK → `user.id` (`FK_INTERNAL_NOTE_AUTHOR`), index `IDX_233D6BDFF675F31B` | `author` (ManyToOne) | `author.{id,nom,prenom}` (garage uniquement) | Auteur de la note | |
| contenu | LONGTEXT NOT NULL (`type: text`) | — | `contenu` | `contenu` (garage) | Contenu de la note | |
| created_at | DATETIME NOT NULL | — | `createdAt` | `createdAt` (garage) | Date de création | |
| updated_at | DATETIME NULL | — | `updatedAt` | `updatedAt` (garage) | Date de dernière modification | |

Cette table n'est **jamais exposée côté client** : aucune route sous `/api/client/...` ne la
référence — cohérent avec son nom (note strictement interne au garage).

---

## Table `notification`

| Champ | Type SQL | Contraintes | Propriété Doctrine | Clé exposée dans l'API | Libellé métier | Commentaire |
|---|---|---|---|---|---|---|
| id | INT AUTO_INCREMENT | PK | `id` | `id` (`NotificationController::serializeNotification()`) | Identifiant de la notification | |
| recipient_id | INT NOT NULL | FK → `user.id` (`FK_NOTIFICATION_RECIPIENT`), index `idx_notification_recipient` | `recipient` (ManyToOne) | non exposé comme champ | Destinataire | Implicite : `/api/notifications` ne renvoie que les notifications de l'utilisateur connecté |
| appointment_id | INT NULL | FK → `appointment.id` (`FK_NOTIFICATION_APPOINTMENT`), index `IDX_BF5476CAE5B533F9` | `appointment` (ManyToOne) | `appointmentId` | Rendez-vous lié | |
| intervention_id | INT NULL | FK → `intervention.id` (`FK_NOTIFICATION_INTERVENTION`), index `IDX_BF5476CA8EAE3863` | `intervention` (ManyToOne) | `interventionId` | Intervention liée | |
| type | VARCHAR(80) NOT NULL | — | `type` | `type` | Type de notification | 6 constantes sur `Notification` : `TYPE_RDV_DEMANDE`, `TYPE_RDV_ACCEPTE`, `TYPE_RDV_REFUSE`, `TYPE_RDV_ANNULE`, `TYPE_STATUT_INTERVENTION_CHANGE`, `TYPE_VEHICULE_PRET` |
| canal | VARCHAR(20) NOT NULL | — | `canal` | `canal` | Canal d'envoi | 2 constantes : `CANAL_APP`, `CANAL_EMAIL` |
| contenu | LONGTEXT NOT NULL (`type: text`) | — | `contenu` | `contenu` | Contenu du message | |
| lu | TINYINT(1) NOT NULL DEFAULT 0 | — | `lu` | `lu` | Notification lue | Passe à `true` via `NotificationController::read()`/`readAll()` |
| created_at | DATETIME NOT NULL | — | `createdAt` | `createdAt` | Date de création | |
| read_at | DATETIME NULL | — | `readAt` | `readAt` | Date de lecture | |

**Contrainte notable** : `CHECK chk_notification_context` (`appointment_id IS NOT NULL OR
intervention_id IS NOT NULL`) existe depuis la migration initiale (`Version20260626030000`, origine
du projet). Elle est renforcée depuis le 2026-08-16 par deux déclencheurs
(`trg_notification_check_link_insert`, `trg_notification_check_link_update`, migration
`Version20260816200000`) qui appliquent la **même règle**. Cette redondance CHECK + déclencheur sur
la même table n'est pas un correctif d'un trou de sécurité — la CHECK bloquait déjà les insertions
et mises à jour non conformes en MySQL 8.0 — mais elle satisfait littéralement l'exigence du
référentiel RNCP36463 de garantir l'accès aux données « par l'usage de contraintes d'intégrité **et**
de déclencheurs » (voir `docs/rncp/CONTEXTE_REFERENTIEL.md`).

---

## Table `action_log`

| Champ | Type SQL | Contraintes | Propriété Doctrine | Clé exposée dans l'API | Libellé métier | Commentaire |
|---|---|---|---|---|---|---|
| id | INT AUTO_INCREMENT | PK | `id` | non exposé | Identifiant de l'entrée | |
| user_id | INT NULL | FK → `user.id` (`FK_ACTION_LOG_USER`), index `IDX_B2C5F685A76ED395` (renommé depuis `idx_action_log_user`) | `user` (ManyToOne) | non exposé | Auteur de l'action | NULL quand la ligne vient du déclencheur `trg_user_audit_sensitive_changes` (limite structurelle : un déclencheur SQL ne connaît pas l'utilisateur JWT) |
| garage_id | INT NULL | FK → `garage.id` (`FK_ACTION_LOG_GARAGE`), index `idx_action_log_garage` | `garage` (ManyToOne) | non exposé | Garage concerné | |
| action | VARCHAR(150) NOT NULL | — | `action` | non exposé | Code de l'action | 11 constantes de `ActionLogService` (voir [TRACABILITE.md](TRACABILITE.md)) + `'USER_SENSITIVE_UPDATE'` écrite par le déclencheur `trg_user_audit_sensitive_changes` |
| entite_concernee | VARCHAR(100) NULL | — | `entiteConcernee` | non exposé | Type d'entité concernée | Nom de classe métier (ex. `Appointment`, `Intervention`, `User`) |
| id_entite_concernee | INT NULL | — | `idEntiteConcernee` | non exposé | Identifiant de l'entité concernée | |
| description | LONGTEXT NULL (`type: text`) | — | `description` | non exposé | Description libre | |
| created_at | DATETIME NOT NULL | — | `createdAt` | non exposé | Date de l'action | |

**Aucune route API ne lit cette table** (pas de `GET /api/.../action-log`, aucun `ActionLogController`).
Elle est écrite par `ActionLogService` (attribution de l'auteur applicatif) et par le déclencheur
`trg_user_audit_sensitive_changes` (`user_id` toujours NULL). Vérifiée uniquement par lecture
directe en base dans les tests (`tests/Mission12/ActionLogApiTest.php`,
`tests/Mission12/DatabaseTriggersTest.php`). Une route de consultation (réservée à `ROLE_GERANT`/
`ROLE_ADMIN`) est une opportunité non exploitée par ce MVP — voir la règle 6 de
`docs/rncp/CONTEXTE_REFERENTIEL.md`.

---

## Table de correspondance des codes de statut d'intervention

Source : `CreateDemoDataCommand::ensureInterventionStatuses()` — ces 6 lignes sont créées par une
commande console, pas par une migration Doctrine ni une fixture ; rien en base ne les rend
immuables, mais deux d'entre elles sont significatives pour le code applicatif (voir la colonne
Remarque).

| Code | Libellé affiché | Ordre | Visible client | Remarque |
|---|---|---|---|---|
| `VEHICULE_DEPOSE` | Véhicule déposé | 1 | oui | Statut initial automatique à l'acceptation d'un rendez-vous (`InterventionCreationService::getInitialStatus()`) |
| `DIAGNOSTIC_EN_COURS` | Diagnostic en cours | 2 | oui | |
| `ATTENTE_VALIDATION_CLIENT` | Attente validation client | 3 | oui | |
| `REPARATION_EN_COURS` | Réparation en cours | 4 | oui | |
| `VEHICULE_PRET` | Véhicule prêt | 5 | oui | Déclenche un email dédié (`EmailNotificationService::sendVehicleReadyEmail()`) |
| `VEHICULE_RECUPERE` | Véhicule récupéré | 6 | oui | Statut de clôture : renseigne `intervention.closed_at` et bascule le rendez-vous lié à `TERMINE` (`GarageInterventionService::updateStatus()`) |

---

## Table de correspondance des statuts de rendez-vous

Constantes de classe sur `App\Entity\Appointment`. Contrairement à `intervention_status`, il n'y a
**pas de table de référence** pour ce champ : la colonne `appointment.statut` est un simple
`VARCHAR(50)` sans CHECK ni ENUM en base ; les 5 valeurs n'existent que côté code PHP.

| Code | Libellé métier | Posé par |
|---|---|---|
| `EN_ATTENTE` | En attente | Valeur par défaut à la création (`Appointment::$statut = self::STATUT_EN_ATTENTE`) |
| `CONFIRME` | Confirmé | `GarageAppointmentService::accept()` |
| `REFUSE` | Refusé | `GarageAppointmentService::refuse()` |
| `ANNULE` | Annulé | `AppointmentService::cancelAppointment()` |
| `TERMINE` | Terminé | Automatiquement par `GarageInterventionService::updateStatus()` quand l'intervention atteint `VEHICULE_RECUPERE` |

---

## Rôles et hiérarchie (`config/packages/security.yaml`)

```yaml
role_hierarchy:
    ROLE_ADMIN: [ROLE_GERANT, ROLE_EMPLOYE, ROLE_CLIENT]
    ROLE_GERANT: [ROLE_EMPLOYE, ROLE_CLIENT]
    ROLE_EMPLOYE: [ROLE_CLIENT]
```

| Rôle | Hérite de | Libellé (`CreateDemoDataCommand::ensureRoles()`) |
|---|---|---|
| `ROLE_ADMIN` | `ROLE_GERANT`, `ROLE_EMPLOYE`, `ROLE_CLIENT` | Administrateur plateforme |
| `ROLE_GERANT` | `ROLE_EMPLOYE`, `ROLE_CLIENT` | Gérant de garage |
| `ROLE_EMPLOYE` | `ROLE_CLIENT` | Employé de garage |
| `ROLE_CLIENT` | — | Client |

Cette hiérarchie est une donnée de configuration Symfony, **indépendante de la table `role` en
base** : `User::getRoles()` retourne toujours un tableau à une seule entrée (le rôle direct stocké
en base), et c'est le composant Security de Symfony qui, au moment de l'autorisation
(`#[IsGranted(...)]`), déduit les rôles hérités à partir de `role_hierarchy`. Rien n'apparaît en
base pour les rôles hérités : un `ROLE_GERANT` n'a jamais de ligne `role_id` supplémentaire pour
`ROLE_EMPLOYE`/`ROLE_CLIENT`.

---

## Charte de nommage

**Vocabulaire métier en français, structure technique en anglais.** Le vocabulaire du domaine
garage/rendez-vous/intervention est systématiquement en français jusque dans les noms de tables et
de colonnes ; l'ossature technique générique (identifiants, horodatage, contraintes générées,
classes du framework) est en anglais.

Exemples réels tirés du code :

- **Tables et colonnes métier en français** : `service_prestation`, `duree_minutes`,
  `jour_semaine`, `code_postal`, `plaque_immatriculation`, `commentaire_client`, `notes_resume`,
  `motif`, `entite_concernee`.
- **Structure technique en anglais**, y compris sur des tables au nom français : `id`,
  `created_at`, `updated_at`, `closed_at`, `read_at` — présents sur presque toutes les entités,
  quel que soit leur domaine métier.
- **Classes et namespaces techniques en anglais** qui manipulent des concepts métier français :
  `ServicePrestationRepository`, `EntityManagerInterface`, `GarageAppointmentService`.
- **Contraintes générées par Doctrine, toujours en anglais/technique**, même sur des tables
  françaises : `FK_APPOINTMENT_GARAGE`, `IDX_FE38F844ED5CA9E6`, `uniq_vehicle_client_plate`,
  `chk_service_prestation_duration`.
- **Constantes PHP en anglais, valeurs métier stockées en français** : le nom de la constante suit
  la convention du langage (`SCREAMING_SNAKE_CASE` en anglais), mais la chaîne réellement écrite en
  base est le code métier français. Exemples : `ActionLogService::APPOINTMENT_CREATED` a pour
  valeur `'RENDEZ_VOUS_CREE'` ; `Notification::TYPE_RDV_DEMANDE` a pour valeur `'RDV_DEMANDE'` ;
  `Appointment::STATUT_EN_ATTENTE` a pour valeur `'EN_ATTENTE'`.
- **Rôles Symfony** : préfixe `ROLE_` imposé par le framework de sécurité (anglais/technique),
  radical métier en français (`ROLE_GERANT`, `ROLE_EMPLOYE`).

---

Branche courante : `feat/rncp-triggers-i18n-export`.
