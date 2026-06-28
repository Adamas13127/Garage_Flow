<!--
Ce fichier presente un mini audit qualite et securite du backend GarageFlow.
Il existe pour montrer au jury les protections deja en place et les limites connues du MVP.
Il communique indirectement avec la configuration Symfony, Doctrine, JWT et les tests PHPUnit.
-->

# Audit qualite et securite backend

## Authentification

Le backend utilise JWT pour proteger les routes privees. Les mots de passe sont hashes par Symfony Security et la route `/api/me` necessite un utilisateur connecte. Les tests verifient le login valide, le mauvais mot de passe, l'acces sans token et l'absence du champ `password` dans les reponses JSON.

## Autorisation

Les roles principaux sont `ROLE_CLIENT`, `ROLE_EMPLOYE`, `ROLE_GERANT` et `ROLE_ADMIN`. Les routes client sont reservees aux clients, tandis que les routes garage utilisent `ROLE_EMPLOYE` ou `ROLE_GERANT` selon l'action. La hierarchie de roles permet aux profils superieurs d'acceder aux droits inferieurs.

## Isolation des donnees

Un client ne peut consulter que ses vehicules, rendez-vous, interventions et notifications. Un garage ne voit que ses rendez-vous, interventions et notes internes. Les repositories et services filtrent les donnees par utilisateur ou garage avant de retourner une ressource.

## Donnees sensibles

Le mot de passe n'est jamais expose dans les reponses API. Les fichiers `.env.local`, `.env.test.local`, `.rnd`, `var/`, `vendor/` et les cles JWT `.pem` sont ignores par Git. Les cles JWT de test sont separees des cles de developpement dans `config/jwt/test/` et restent locales.

## Base de donnees

Doctrine Migrations versionne le schema. Les fixtures chargent les roles et statuts de reference. Les tests utilisent une base separee `garageflow_test` grace au suffixe Doctrine `_test`, ce qui evite de supprimer les donnees de developpement.

## Tests

PHPUnit couvre une premiere campagne Mission12 : 26 tests et 180 assertions. Les tests verifient l'authentification, les vehicules, les garages, les rendez-vous, les interventions, les notes internes, les notifications et plusieurs cas d'entrees invalides.

## Points de vigilance restants

* Les emails reels ne sont pas encore envoyes.
* Il n'y a pas encore de rate limit sur le login.
* Le refresh token n'est pas encore implemente.
* Le frontend React n'est pas encore implemente.
* La CI GitHub Actions n'est pas encore configuree.
* Les tests couvrent les parcours critiques, mais pas toutes les combinaisons possibles de validation.