<!--
Ce fichier donne un script detaille pour la demonstration orale de GarageFlow.
Il existe pour savoir quoi cliquer, quoi dire et quelle valeur produit expliquer pendant la soutenance.
Il communique avec les donnees de demonstration, le dashboard web, l'application mobile et la fiche de lancement local.
-->

# Script de demo orale GarageFlow

## Preparation avant de commencer

Action a faire : lancer le backend, le web, le mobile et executer `php bin/console app:create-demo-data`.

Phrase a dire : "Je vais presenter GarageFlow avec des donnees de demonstration locales, ce qui permet de montrer un parcours complet sans creer les donnees a la main pendant l'oral."

Valeur produit : la demo est stable et reproductible.

Risque a ne pas oublier : verifier que le telephone et le PC sont sur le meme Wi-Fi si la demo mobile se fait sur iPhone.

## Partie web garage

### 1. Connexion gerant

Action a faire : ouvrir le web et se connecter avec `gerant.demo@garageflow.local` / `Password123`.

Phrase a dire : "Je commence cote garage avec le compte gerant. Ce role permet de piloter l'activite du garage."

Valeur produit : le garage accede a son espace securise.

Risque a ne pas oublier : utiliser le compte gerant, pas le compte client.

### 2. Dashboard rempli

Action a faire : montrer le dashboard avec les compteurs, rendez-vous, interventions et notifications.

Phrase a dire : "Le dashboard donne une vue rapide de la journee et des actions importantes."

Valeur produit : le garage gagne du temps car les informations utiles sont centralisees.

Risque a ne pas oublier : expliquer que les donnees viennent de l'API Symfony.

### 3. Rendez-vous

Action a faire : ouvrir la page des rendez-vous.

Phrase a dire : "Ici, le garage voit les demandes de rendez-vous et leur statut."

Valeur produit : les demandes ne restent plus dans des appels ou messages disperses.

Risque a ne pas oublier : choisir un rendez-vous en attente pour l'action suivante.

### 4. Accepter un rendez-vous

Action a faire : accepter un rendez-vous en attente.

Phrase a dire : "Quand le garage accepte, le backend confirme le rendez-vous et prepare le suivi atelier."

Valeur produit : le passage de la demande client a l'organisation garage est structure.

Risque a ne pas oublier : si aucun rendez-vous en attente n'est visible, expliquer que la base de demo est idempotente et passer a une intervention deja creee.

### 5. Intervention creee

Action a faire : ouvrir les interventions et montrer l'intervention liee au rendez-vous.

Phrase a dire : "Une intervention represente le travail reel sur le vehicule apres confirmation du rendez-vous."

Valeur produit : le garage suit l'etat atelier et le client peut suivre les etapes visibles.

Risque a ne pas oublier : ne pas promettre de facturation ou de devis avance, car c'est hors MVP.

### 6. Changer un statut

Action a faire : changer le statut d'une intervention.

Phrase a dire : "Le changement de statut permet de tracer l'avancement de la reparation."

Valeur produit : le client est informe sans appeler le garage.

Risque a ne pas oublier : choisir un statut logique dans la timeline.

### 7. Notes internes

Action a faire : ouvrir les notes internes d'une intervention.

Phrase a dire : "Les notes internes sont utiles a l'equipe garage, mais elles ne sont pas exposees au client."

Valeur produit : le garage garde ses informations de travail tout en protegeant ce qui ne doit pas etre visible cote client.

Risque a ne pas oublier : insister sur la separation garage/client.

### 8. Notifications

Action a faire : ouvrir les notifications et marquer une notification comme lue.

Phrase a dire : "Les notifications aident l'utilisateur a suivre les evenements importants."

Valeur produit : moins d'oublis et meilleure visibilite sur les actions recentes.

Risque a ne pas oublier : les notifications push natives ne sont pas dans ce MVP.

### 9. Configuration garage

Action a faire : ouvrir la configuration garage.

Phrase a dire : "Le gerant peut maintenir les informations du garage, les prestations, les horaires et les indisponibilites."

Valeur produit : le garage controle les donnees qui servent aux reservations.

Risque a ne pas oublier : montrer rapidement, sans passer trop de temps dans chaque formulaire.

## Partie mobile client

### 1. Connexion client

Action a faire : se connecter avec `client.demo@garageflow.local` / `Password123`.

Phrase a dire : "Je passe maintenant cote client, avec une application mobile separee du dashboard garage."

Valeur produit : chaque utilisateur a une interface adaptee a son besoin.

Risque a ne pas oublier : l'URL API mobile doit pointer vers l'IP locale du PC sur telephone reel.

### 2. Accueil

Action a faire : montrer l'ecran d'accueil.

Phrase a dire : "L'accueil resume les informations principales du client."

Valeur produit : le client retrouve rapidement ses actions utiles.

Risque a ne pas oublier : rester bref pour garder du temps pour le parcours.

### 3. Vehicules

Action a faire : ouvrir la liste des vehicules.

Phrase a dire : "Le client peut enregistrer ses vehicules, ce qui simplifie les demandes de rendez-vous."

Valeur produit : moins d'informations a redonner a chaque contact.

Risque a ne pas oublier : ne pas supprimer de vehicule pendant la demo si cela peut perturber le scenario.

### 4. Garages

Action a faire : consulter les garages.

Phrase a dire : "Le client peut consulter les garages disponibles avant de reserver."

Valeur produit : la recherche de garage devient plus simple et plus autonome.

Risque a ne pas oublier : verifier que le backend est bien lance si la liste ne charge pas.

### 5. Prestations

Action a faire : ouvrir un garage et montrer les prestations.

Phrase a dire : "Les prestations viennent de la configuration du garage."

Valeur produit : le client sait ce que le garage propose avant de faire sa demande.

Risque a ne pas oublier : rappeler que le prix/devis avance n'est pas dans le MVP.

### 6. Rendez-vous

Action a faire : ouvrir les rendez-vous client.

Phrase a dire : "Le client retrouve l'historique de ses demandes et leur statut."

Valeur produit : le client n'a plus besoin d'appeler pour savoir si une demande est en attente ou confirmee.

Risque a ne pas oublier : annuler seulement un rendez-vous annulable si la demo le permet.

### 7. Suivi reparation

Action a faire : ouvrir une intervention avec timeline.

Phrase a dire : "Le suivi de reparation affiche les etapes visibles cote client."

Valeur produit : la communication est plus claire et le client est rassure.

Risque a ne pas oublier : preciser que les notes internes garage ne sont pas visibles ici.

### 8. Notifications

Action a faire : ouvrir les notifications client.

Phrase a dire : "Les notifications regroupent les informations liees aux rendez-vous et aux interventions."

Valeur produit : le client garde une trace des evenements importants.

Risque a ne pas oublier : ne pas annoncer de notification push native dans le MVP.

### 9. Profil

Action a faire : ouvrir le profil.

Phrase a dire : "Le profil termine le parcours client avec les informations du compte connecte."

Valeur produit : l'application reste centree sur l'utilisateur connecte.

Risque a ne pas oublier : conclure rapidement sur la coherence web/mobile/backend.
