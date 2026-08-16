<!--
Ce fichier fait autorite sur la tracabilite du backend GarageFlow.
Il existe pour decrire l'etat reel des trois mecanismes de tracabilite du projet, apres qu'une
verification factuelle (2026-08-16) a montre que deux documents de reference (matrice des droits
et securite, dictionnaire de donnees) presentaient la journalisation des actions metier dans
action_log/LOG_ACTION comme acquise alors qu'aucun code applicatif ne l'alimentait.
Il communique avec ActionLogService, les services metier du backend et Doctrine ORM.
-->

# Tracabilite -- etat reel (2026-08-16)

## Ce document fait autorite sur ce point precis

Les PDF de reference du dossier (`docs/reference/Matrice des droits et sécurité — GarageFlow.pdf`,
section « Traçabilité » et section 9 ; `docs/reference/Dictionnaire de données - GarageFlow.pdf`,
table `LOG_ACTION`) presentent la journalisation des actions metier (creation/acceptation/refus/
annulation d'un rendez-vous, creation d'intervention, changement de statut, creation/modification
d'une prestation ou d'une indisponibilite, modification d'un garage) comme un fait acquis. Ce
n'etait pas le cas au moment de leur redaction, et **les PDF ne sont pas modifies** (format non
editable par les outils utilises pour ce durcissement). Sur ce point precis -- l'etat de la
journalisation applicative -- ce document Markdown fait foi, pas les PDF.

## Les trois mecanismes de tracabilite du projet

GarageFlow utilise trois mecanismes distincts, avec des roles differents. Ils ne font pas double
emploi : chacun couvre un besoin que les autres ne couvrent pas.

### 1. `intervention_status_history` -- historique metier des statuts

**Implemente et fonctionnel depuis l'origine du projet.** Chaque changement de statut d'une
intervention (`GarageInterventionService::updateStatus()`) cree une ligne dans
`InterventionStatusHistory` : nouveau statut, utilisateur ayant change le statut, commentaire
optionnel, date. C'est la timeline montree au client dans le suivi de son intervention
(`GET /api/client/interventions/{id}`) et au garage (`GET /api/garage/me/interventions/{id}`).

Perimetre : uniquement les changements de statut d'intervention. Ne couvre ni les rendez-vous, ni
les prestations, ni les indisponibilites, ni les garages.

### 2. Declencheurs SQL -- garantie structurelle independante du chemin d'acces

**Ajoutes le 2026-08-16** (migration `Version20260816200000.php`, voir
`docs/rncp/CONTEXTE_REFERENTIEL.md`). Deux declencheurs MySQL :

* Controle sur `notification` (BEFORE INSERT/UPDATE) : rejette toute ligne sans `appointment_id`
  ni `intervention_id`.
* Audit sur `user` (AFTER UPDATE) : journalise dans `action_log` tout changement de `role_id` ou
  `actif`, quel que soit le chemin d'acces emprunte -- ORM applicatif, script de maintenance,
  requete SQL directe.

Interet specifique de ce mecanisme : il s'applique **meme si le code applicatif est contourne**
(acces direct a la base, script de migration de donnees, bug applicatif). C'est une garantie que
ni `ActionLogService` ni `intervention_status_history` ne peuvent offrir, puisque tous deux
dependent du code PHP etant reellement execute.

Limite structurelle et definitive : **un declencheur MySQL n'a aucune notion de l'utilisateur
applicatif JWT.** Il ne connait que la connexion MySQL (`garageflow`@`%`, la meme pour toutes les
requetes du backend). C'est pour cette raison precise qu'il ne peut pas remplacer le mecanisme
n°3 ci-dessous : attribuer une action a un utilisateur precis exige que le code applicatif, qui
connait cet utilisateur, l'ecrive lui-meme.

### 3. `ActionLogService` -- journal d'audit applicatif avec attribution de l'auteur

**Ajoute le 2026-08-16** (`backend/src/Service/ActionLogService.php`). Service dedie, appele
depuis les services metier existants, qui ecrit dans `action_log` l'utilisateur authentifie a
l'origine de l'action, l'entite concernee et son identifiant.

Actions journalisees (correspondant a la liste des deux PDF de reference) :

| Action | Constante | Service appelant |
|---|---|---|
| Creation d'un rendez-vous | `APPOINTMENT_CREATED` | `AppointmentService::createAppointment()` |
| Acceptation d'un rendez-vous | `APPOINTMENT_ACCEPTED` | `GarageAppointmentService::accept()` |
| Refus d'un rendez-vous | `APPOINTMENT_REFUSED` | `GarageAppointmentService::refuse()` |
| Annulation d'un rendez-vous | `APPOINTMENT_CANCELLED` | `AppointmentService::cancelAppointment()` |
| Creation d'une intervention | `INTERVENTION_CREATED` | `GarageAppointmentService::accept()` |
| Changement de statut d'intervention | `INTERVENTION_STATUS_CHANGED` | `GarageInterventionService::updateStatus()` |
| Creation d'une prestation | `SERVICE_CREATED` | `ServicePrestationService::create()` |
| Modification d'une prestation | `SERVICE_UPDATED` | `ServicePrestationService::update()` |
| Creation d'une indisponibilite | `UNAVAILABILITY_CREATED` | `UnavailabilityService::create()` |
| Modification d'une indisponibilite | `UNAVAILABILITY_UPDATED` | `UnavailabilityService::update()` |
| Modification d'un garage | `GARAGE_UPDATED` | `GarageManagementService::updateGarage()` |

Chaque entree porte `user` (l'auteur authentifie), `garage` (le garage concerne quand pertinent),
`action` (code ci-dessus), `entiteConcernee` (nom de classe) et `idEntiteConcernee`. Verifie par
7 tests dans `tests/Mission12/ActionLogApiTest.php` : chaque test cree l'action via l'API HTTP
reelle (pas de mock) et relit la ligne `action_log` correspondante pour verifier l'auteur.

Perimetre non couvert (hors liste des deux PDF, donc hors scope de cet ajout) : creation d'un
garage (aucune route ne l'expose dans le MVP -- seule la modification du garage rattache existe),
suppression d'une prestation ou d'une indisponibilite (soft-delete pour les prestations,
suppression physique deja tracable autrement pour les indisponibilites), gestion des employes.

### Pourquoi le changement de statut d'intervention est journalise deux fois

`GarageInterventionService::updateStatus()` cree a la fois une ligne
`InterventionStatusHistory` (mecanisme 1) et une ligne `action_log` (mecanisme 3). Ce n'est pas
une duplication accidentelle : `InterventionStatusHistory` reste **la seule source pour la
timeline client**, avec son propre cycle de vie (visible dans les reponses API, filtree par
`visible_client` sur le statut) ; `action_log` est **un journal d'audit transverse**, pense pour
un usage gerant/admin (voir la matrice des droits, section « Voir les logs d'action »), qui
melange dans une seule table toutes les actions sensibles du projet, pas seulement les statuts
d'intervention. Les deux repondent a des besoins differents et coexistent volontairement.

## Recapitulatif pour le dossier RNCP

| Mecanisme | Depuis | Couvre | Connait l'auteur applicatif | Resiste a un acces hors application |
|---|---|---|---|---|
| `intervention_status_history` | Origine du projet | Statuts d'intervention uniquement | Oui | Non |
| Declencheurs SQL | 2026-08-16 | Integrite `notification`, audit `user.role_id`/`actif` | Non (limite structurelle) | Oui |
| `ActionLogService` | 2026-08-16 | Rendez-vous, interventions, prestations, indisponibilites, garage | Oui | Non |

Aucun mecanisme seul ne couvre tout : c'est le cumul des trois qui satisfait a la fois l'exigence
de contraintes+declencheurs et l'exigence de tracabilite avec attribution d'auteur.
