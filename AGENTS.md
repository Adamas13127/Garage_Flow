# GarageFlow - Instructions pour les agents IA

## Contexte

GarageFlow est une plateforme web et mobile pour les garages independants.
Elle permet aux clients de prendre rendez-vous, gerer leurs vehicules et suivre une intervention.
Elle permet aux garages de gerer leurs prestations, horaires, rendez-vous, interventions, statuts et notifications.

## Stack officielle

* Backend : Symfony API REST
* ORM : Doctrine ORM
* Base de donnees : MySQL
* Authentification : JWT
* Frontend web : React + Vite + Tailwind CSS
* Mobile : React Native + Expo
* Documentation : Markdown dans /docs
* Versioning : GitHub

## Architecture officielle

backend/ : API Symfony
web/ : dashboard web garage
mobile/ : application mobile client
docs/ : documentation fonctionnelle et technique
docs/reference/ : PDF sources et documents de reference

## Scope MVP officiel

Developper uniquement :

* authentification ;
* roles utilisateurs ;
* gestion des garages ;
* gestion des prestations ;
* gestion des horaires ;
* gestion des indisponibilites simples ;
* gestion des vehicules ;
* prise de rendez-vous ;
* acceptation/refus de rendez-vous par le garage ;
* creation d'intervention apres confirmation ;
* changement de statut d'intervention ;
* historique des statuts ;
* notes internes garage ;
* notifications app/email ;
* dashboard garage ;
* interface mobile client.

## Fonctionnalites exclues du MVP

Ne pas developper sans demande explicite :

* paiement en ligne ;
* facturation ;
* stock pieces ;
* devis complexe ;
* chat temps reel ;
* SMS ;
* documents avances ;
* favoris ;
* avis clients ;
* IA ;
* marketplace ;
* multi-langue ;
* panier multi-prestations.

Ces elements peuvent etre mentionnes comme evolutions futures mais ne doivent pas etre codes maintenant.

## Regles de developpement

* Ne jamais inventer une fonctionnalite.
* Ne jamais ajouter une dependance lourde sans justification.
* Respecter l'architecture : Controller -> DTO/Validator -> Service -> Repository -> Doctrine -> MySQL.
* Garder la logique metier dans les services, pas dans les controleurs.
* Proteger les routes selon les roles.
* Toujours filtrer les donnees par utilisateur ou par garage.
* Le backend reste la source de verite.
* Le frontend ne remplace jamais les verifications backend.

## Regles de commentaires obligatoires

Cible : 8 a 15 % de lignes de commentaire dans le code source (mesure par fichier avec
`# lignes de commentaire / # lignes de code source`, commentaires et code comptes hors lignes
vides -- voir la methode de calcul detaillee dans le rapport de refactoring qui a etabli cette
cible). Au-dela de 15 %, les commentaires paraphrasent generalement le code au lieu de lui
apporter une information qu'il ne porte pas deja ; en dessous de 8 %, les regles metier
non triviales risquent de ne plus etre documentees.

Le commentaire d'en-tete de fichier n'est requis que lorsqu'il apporte une information non
deductible du nom de la classe et de son emplacement dans l'arborescence : typiquement les
services metier, les controleurs et les classes qui portent une logique non triviale. Il n'est
pas requis sur les DTO, les entites simples (getters/setters Doctrine sans logique), les
repositories sans requete personnalisee (aucune methode au-dela du constructeur) et les classes
d'exception -- leur nom et leur emplacement (`src/DTO/`, `src/Entity/`, `src/Security/`) disent
deja tout ce que l'en-tete repeterait. Cette regle a d'abord impose un en-tete sur chaque fichier
sans exception ; l'experience a montre qu'un en-tete de 4-5 lignes sur un fichier de 4 lignes de
code (une exception, un DTO) rend la cible de ratio ci-dessus mathematiquement inatteignable sans
rien retirer d'utile -- la regle a donc ete restreinte aux fichiers ou l'en-tete a une vraie
valeur de lecture.

Quand il est requis, l'en-tete explique :

* le role du fichier ;
* pourquoi il existe dans le projet ;
* avec quelles parties du projet il communique si necessaire.

Un commentaire de methode n'est ajoute que si la methode porte une regle metier ou un
comportement non evident a la seule lecture de sa signature et de son nom : un calcul avec un
cas limite, une contrainte imposee par le referentiel MVP, un `@throws` explicatif, un
contournement technique documente. **Aucun commentaire qui se contente de reformuler le nom de
la methode.**

Mauvais exemple (paraphrase, a bannir) :

```php
/** Cette methode recupere l'utilisateur connecte. */
private function user(): User
```

Bon exemple (le commentaire apporte une information absente du code) :

```php
/**
 * Le firewall Lexik authentifie via JWT mais n'attache jamais le role symfony natif :
 * on retombe systematiquement sur l'entite User pour lire son role metier reel.
 */
private function user(): User
```

Bon exemple (regle metier non evidente) :

```php
/** Une prestation desactivee (actif=false) n'est jamais supprimee : les rendez-vous passes doivent
 * pouvoir continuer a l'afficher dans leur historique. */
public function disable(Garage $garage, int $id): void
```

Les commentaires doivent aider a comprendre une decision, jamais repeter ce que le code dit deja.

## Charte de nommage

Convention reellement appliquee dans le code existant, a poursuivre :

* **Vocabulaire metier en francais** : proprietes d'entites, champs de DTO, messages utilisateur,
  codes de statut. Exemples reels : `Appointment::$dateDebut`, `$commentaireClient`, `$statut` ;
  `ServicePrestation::$dureeMinutes` ; `Unavailability::$motif` ; statuts d'intervention
  `VEHICULE_DEPOSE`, `DIAGNOSTIC_EN_COURS`, `ATTENTE_VALIDATION_CLIENT`, `REPARATION_EN_COURS`,
  `VEHICULE_PRET`, `VEHICULE_RECUPERE` ; roles `ROLE_GERANT`, `ROLE_EMPLOYE`, `ROLE_CLIENT`,
  `ROLE_ADMIN`.
* **Structure technique en anglais** : noms de classes, suffixes d'architecture, verbes
  d'action, noms de routes. Exemples reels : `GarageNotFoundException`,
  `AppointmentConflictException` ; suffixes `Controller` / `Service` / `Repository` / `DTO` ;
  methodes `create`, `update`, `delete`, `list`, `find...` ; routes
  `api_garage_me_appointments_accept`.
* Consequence pratique : une entite ou un service porte un nom de classe anglais (`Appointment`,
  `Garage`, `Intervention`) mais ses champs metier sensibles a la reglementation ou au vocabulaire
  du garage restent en francais. Ne pas traduire les champs metier en anglais, et ne pas nommer
  une classe ou une methode technique en francais.
* Cas limite assume : `ServicePrestation` melange les deux langues dans son propre nom de classe
  (anglais `Service` + francais `Prestation`). C'est une exception historique, pas un modele a
  reproduire pour une nouvelle entite.

## Strategie de branches et format des commits

* `main` reste toujours deployable et presentable au jury.
* Le travail se fait sur des branches courtes prefixees par leur nature :
  `feat/...`, `fix/...`, `chore/...`, `refactor/...`, `docs/...`, `test/...`.
* Une branche est fusionnee dans `main` via pull request une fois la Definition of Done (voir
  ci-dessous) satisfaite, jamais par commit direct sur `main` pour un changement non trivial.
* Un commit correspond a un changement logique unique et suit la convention
  `type(scope): description au present` :
  * `feat(scope): ...` -- nouvelle fonctionnalite ;
  * `fix(scope): ...` -- correction de bug ou d'incoherence ;
  * `docs(scope): ...` -- documentation uniquement ;
  * `chore(scope): ...` -- outillage, dependances, configuration ;
  * `test(scope): ...` -- ajout ou modification de tests uniquement ;
  * `refactor(scope): ...` -- changement de structure du code sans changement de comportement.
* Le `scope` designe la partie du projet touchee (`backend`, `web`, `mobile`, `docs`, `oral`,
  `agents`, ...).
* Ne jamais antidater ou reordonner un commit apres coup : l'historique Git reflete l'ordre reel
  du travail, y compris pour les livrables presentes au jury.
* Ne jamais commiter : `.env` reel, secrets, `vendor/`, `node_modules/`, fichiers generes inutiles.

## Definition of Done

Un changement est considere termine seulement si, au moment du commit ou de la PR :

* les tests concernes passent (`php bin/phpunit` pour le backend, `npm test` pour web et mobile) ;
* `vendor/bin/phpstan analyse` passe sans erreur au niveau configure dans `backend/phpstan.neon`
  (ce niveau ne doit jamais baisser sans decision explicite documentee) ;
* `vendor/bin/php-cs-fixer fix --dry-run --diff` ne signale plus rien sur les fichiers touches
  (ou `php-cs-fixer fix` a ete applique) ;
* la documentation impactee (README, `backend/docs/API.md`, fiches `docs/oral/`) est mise a jour
  dans le meme lot si le comportement documente a change ;
* aucune regression n'a ete introduite sur un perimetre qui fonctionnait avant le changement.

## Politique de tests

* **Tests unitaires** (`backend/tests/Unit/`) : logique metier pure, isolable sans base de
  donnees ni conteneur Symfony, dependances simulees par des mocks PHPUnit. Cible naturelle :
  les services contenant des calculs ou des regles (ex. `AvailabilityService` et le calcul de
  creneaux disponibles). Rapides, executables sans Docker.
* **Tests fonctionnels** (`backend/tests/`, `WebTestCase`) : comportement de bout en bout d'une
  route HTTP -- authentification, autorisation par role, persistance reelle via Doctrine/MySQL,
  format de reponse JSON. Necessaires des qu'un test verifie l'integration entre plusieurs
  couches (controleur + service + base de donnees), pas seulement un calcul isole.
* Une regle metier testable en isolation (un calcul, une validation, une transformation de
  donnees) merite un test unitaire dedie plutot qu'un detour par un test fonctionnel plus lent et
  plus couteux a maintenir. Un test fonctionnel reste necessaire pour verifier qu'une route est
  effectivement protegee par le bon role et qu'elle persiste correctement en base.

## Utilisation des documents de reference

Le dossier docs/reference/ peut contenir des PDF sources :

* grille d'evaluation ;
* cahier des charges ;
* maquettes ;
* MCD ;
* MLD ;
* dictionnaire de donnees ;
* matrice des droits ;
* architecture ;
* plan de developpement.

Ces documents servent de reference.
Mais ils ne doivent pas etre interpretes comme une demande de tout developper.

Regles :

* ne pas lire tous les documents sans consigne ;
* ne pas developper une fonctionnalite simplement parce qu'elle apparait dans une maquette ou un PDF ;
* toujours respecter le scope MVP defini dans AGENTS.md ;
* considerer les fonctionnalites hors MVP comme des evolutions futures ;
* demander confirmation si un document semble contradictoire avec le scope MVP.

AGENTS.md reste la source de verite principale.
