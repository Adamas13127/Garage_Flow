<!--
Ce fichier presente les limites assumees du MVP GarageFlow et les pistes de V2.
Il existe pour montrer au jury que le perimetre est maitrise et que les evolutions futures sont identifiees.
Il communique avec AGENTS.md, l'audit final et les questions reponses jury.
-->

# Limites et ameliorations V2

## Limites assumees du MVP

### Pas de paiement

Le MVP ne gere pas le paiement en ligne. Ce choix evite d'ajouter une integration bancaire et des contraintes de remboursement ou de securite supplementaires avant d'avoir valide le parcours principal.

### Pas de devis ni facture

Le MVP ne produit pas encore de devis ou de facture. L'objectif est d'abord de gerer la demande de rendez-vous, l'intervention et le suivi client.

### Pas de notification push native

Les notifications existent dans l'application, mais il n'y a pas encore de push natif sur telephone. Cela reste une evolution logique pour prevenir le client sans qu'il ouvre l'application.

### Pas de temps reel

Le MVP ne contient pas de WebSocket ou de mise a jour temps reel. Les ecrans sont rafraichis apres les actions ou lors de la navigation.

### UI encore MVP

L'interface est propre pour une demonstration, mais elle n'est pas encore un design system complet de production.

### Pas encore de deploiement production

Le projet est prepare pour une demonstration locale. Une V2 devrait ajouter un environnement de production, des variables securisees et une strategie de deploiement.

### AsyncStorage cote mobile

Le token mobile est stocke avec AsyncStorage pour le MVP. En production, il serait preferable d'utiliser SecureStore ou une solution plus securisee.

### Donnees de demonstration locales

La commande `app:create-demo-data` prepare une base locale realiste. Elle ne remplace pas une strategie de seed ou de donnees de production.

## Ameliorations V2

### Paiement en ligne

Ajouter le paiement permettrait au client de regler une prestation ou un acompte directement depuis la plateforme.

### Devis et factures

Une V2 pourrait gerer les devis, leur validation par le client et la generation de factures.

### Notifications email et push

Les notifications pourraient etre envoyees par email et par push mobile pour prevenir le client en dehors de l'application.

### Planning plus avance

Le planning pourrait prendre en compte plusieurs mecaniciens, des durees variables, des pauses et des contraintes plus fines.

### Avis clients

Les avis clients pourraient aider les garages a valoriser leur qualite de service.

### Dashboard statistiques

Le garage pourrait suivre le nombre de rendez-vous, les prestations les plus demandees, les interventions en retard et les notifications importantes.

### Multi-garage avance

Une version plus complete pourrait gerer plusieurs garages pour un meme groupe, avec des droits plus fins par etablissement.

### Deploiement cloud

Le projet pourrait etre deploie sur un serveur cloud avec une base geree, des sauvegardes et une configuration securisee.

### CI/CD

Une integration continue permettrait de lancer les tests automatiquement a chaque push et de reduire les regressions.

### Refresh token

Le systeme d'authentification pourrait etre renforce avec des refresh tokens pour ameliorer l'experience et la securite.

### Design system complet

Un design system permettrait d'unifier les composants web et mobile, d'accelerer les evolutions et d'ameliorer la coherence visuelle.

## Message a dire au jury

"J'ai volontairement limite le MVP au parcours central pour livrer une application coherente et demonstrable. Les fonctionnalites comme le paiement, la facturation ou les notifications push sont importantes, mais elles ont plus de sens une fois que le socle rendez-vous, intervention et suivi client est valide."
