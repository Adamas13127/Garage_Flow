<!--
Ce fichier prepare les questions et reponses probables du jury pour GarageFlow.
Il existe pour aider a repondre clairement sur les choix produit, techniques, securite, qualite et limites du MVP.
Il communique avec les fiches d'architecture, de limites et l'audit final du dossier docs/oral.
-->

# Questions reponses jury

## Produit

### Pourquoi ce projet ?

GarageFlow repond a un probleme concret : les garages independants gerent souvent les rendez-vous et le suivi client avec beaucoup d'appels et d'informations dispersees. Le projet permet de centraliser ces informations et de rendre le client plus autonome.

### Pourquoi les garages independants ?

Les grands reseaux ont souvent deja des outils internes. Les garages independants ont moins de moyens et peuvent avoir besoin d'une solution simple, ciblee et adaptee a leur quotidien.

### Pourquoi un MVP ?

Le MVP permet de valider le parcours principal sans partir dans trop de fonctionnalites. Ici, le coeur du projet est : client, vehicule, rendez-vous, intervention, statut et notification.

### Pourquoi pas paiement, devis ou facturation ?

Ces sujets sont importants mais ils ajoutent beaucoup de complexite juridique, technique et metier. Pour le MVP, j'ai choisi de me concentrer sur l'organisation du rendez-vous et le suivi de reparation.

### Quelle valeur pour le garage ?

Le garage gagne une vue claire sur ses demandes, ses rendez-vous, ses interventions et ses notifications. Il perd moins d'informations et peut mieux organiser son activite.

### Quelle valeur pour le client ?

Le client peut prendre rendez-vous, suivre l'avancement de son vehicule et retrouver ses informations sans appeler le garage a chaque etape.

## Technique

### Pourquoi Symfony ?

Symfony est adapte pour construire une API REST structuree. Il fournit une base solide pour la securite, la validation, les services, les controleurs et l'integration avec Doctrine.

### Pourquoi React ?

React permet de construire un dashboard web dynamique avec des composants reutilisables. C'est adapte pour une interface garage qui affiche des listes, des actions et des etats.

### Pourquoi React Native et Expo ?

React Native permet de creer une application mobile avec TypeScript et une logique proche de React. Expo simplifie le lancement, les tests sur telephone et la compatibilite avec Expo Go.

### Pourquoi MySQL ?

MySQL est une base relationnelle adaptee aux donnees du projet : utilisateurs, garages, vehicules, rendez-vous, interventions, historiques et notifications.

### Pourquoi JWT ?

JWT permet d'authentifier les appels API entre le backend, le web et le mobile. Le token est envoye avec les requetes protegees pour identifier l'utilisateur connecte.

### Pourquoi Docker ?

Docker permet de lancer MySQL de facon reproductible en local. Cela evite d'installer et configurer manuellement un serveur MySQL sur chaque machine.

### Pourquoi Doctrine ?

Doctrine permet de mapper les entites PHP vers les tables MySQL. Cela facilite les requetes, les relations et les migrations de schema.

### Pourquoi separer web garage et mobile client ?

Les besoins sont differents. Le garage a besoin d'un dashboard plus large pour gerer son activite. Le client a besoin d'une application mobile simple pour reserver et suivre son vehicule.


### Pourquoi Mailtrap pour les emails ?

Mailtrap permet de tester un vrai flux SMTP sans envoyer de messages a de vraies adresses. Cela securise la demonstration : je peux montrer les emails generes par GarageFlow tout en gardant les identifiants dans `.env.local` et hors du depot Git.

### Les notes internes peuvent-elles partir par email ?

Non. Le service email construit des messages clients simples a partir du rendez-vous, du vehicule, du garage et du statut visible. Les notes internes garage ne sont pas ajoutees dans les emails clients.

## Securite

### Comment les roles sont geres ?

Les utilisateurs ont un role comme `ROLE_CLIENT`, `ROLE_EMPLOYE`, `ROLE_GERANT` ou `ROLE_ADMIN`. Le backend verifie ces roles sur les routes protegees.

### Comment eviter qu'un client voie les donnees du garage ?

Le backend filtre les donnees selon l'utilisateur connecte. Un client accede a ses vehicules, ses rendez-vous et ses interventions, pas aux notes internes du garage.

### Comment eviter qu'un garage voie les donnees d'un autre garage ?

Les requetes garage sont rattachees au garage de l'utilisateur connecte. Le backend reste la source de verite et ne fait pas confiance au frontend pour choisir les donnees accessibles.

### Les mots de passe sont-ils securises ?

Les mots de passe sont stockes sous forme hashee, pas en clair. Les mots de passe de demonstration servent seulement a une base locale.

### Les notes internes sont-elles visibles cote client ?

Non. Les notes internes sont reservees au garage. Le client voit uniquement les informations prevues pour son suivi.

## Qualite

### Quels tests ont ete faits ?

Le backend a des tests PHPUnit sur les routes API. Le web et le mobile ont des tests de composants ou d'ecrans, du lint, du TypeScript et des controles npm.

### Pourquoi des tests backend ?

Le backend contient les regles importantes : droits, filtrage des donnees, creation des rendez-vous, interventions et notifications. Il faut donc le tester en priorite.

### Pourquoi des tests front et mobile ?

Ils permettent de verifier que les ecrans principaux s'affichent et que les interactions essentielles restent stables.

### Que fait la commande de demo data ?

Elle cree des donnees realistes et idempotentes : comptes, garage, prestations, horaires, vehicules, rendez-vous, interventions, historiques, notes et notifications.

### Que reste-t-il a ameliorer ?

Il reste a renforcer la production : CI/CD, deploiement cloud, refresh token, SecureStore mobile, design system plus complet et notifications push.

## Limites

### Pourquoi pas de paiement ?

Le paiement demande une integration externe, une gestion des erreurs, des remboursements et des obligations supplementaires. Ce n'etait pas le coeur du MVP.

### Pourquoi pas de notifications push ?

Les notifications push demandent une configuration mobile supplementaire. Le MVP utilise des notifications applicatives pour valider le parcours.

### Pourquoi pas de temps reel ?

Le temps reel ajoute de la complexite avec WebSocket ou un systeme equivalent. Pour le MVP, les ecrans se mettent a jour apres les actions ou rechargements.

### Pourquoi stockage token simple cote mobile ?

AsyncStorage suffit pour une demonstration MVP. Pour une version production, j'utiliserais une solution plus securisee comme SecureStore.

### Que feriez-vous en V2 ?

Je commencerais par CI/CD, deploiement cloud, refresh token, notifications push, paiement ou devis/factures selon la priorite metier, puis un design system plus complet.
