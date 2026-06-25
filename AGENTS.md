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

Chaque fichier cree ou modifie doit commencer par un commentaire d'en-tete expliquant :

* le role du fichier ;
* pourquoi il existe dans le projet ;
* avec quelles parties du projet il communique si necessaire.

Chaque classe, fonction, methode importante ou service doit avoir un commentaire simple et pedagogique.

Les commentaires doivent etre ecrits comme si un etudiant expliquait son code a un jury.

Exemples :

* "Cette fonction sert a recuperer les utilisateurs depuis la base de donnees."
* "Ce service contient la logique metier liee a la creation d'un rendez-vous."
* "Ce controleur recoit la requete HTTP et appelle le service adapte."
* "Ce repository centralise les requetes vers la table des rendez-vous."

Les commentaires doivent aider a comprendre le code.

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

## Regles Git

Utiliser des commits clairs :

* feat(auth): add JWT login endpoint
* feat(appointments): create appointment request
* fix(security): restrict garage data access
* docs(mcd): add data model documentation

Ne pas commit :

* .env reel ;
* secrets ;
* vendor/ ;
* node_modules/ ;
* fichiers generes inutiles.
