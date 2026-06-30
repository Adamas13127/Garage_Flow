<!--
Ce fichier documente l'application mobile client GarageFlow.
Il existe pour expliquer l'installation, la configuration API et les limites du socle Expo.
Il communique avec le projet Expo, l'API Symfony et les futurs developpeurs du mobile.
-->

# GarageFlow Mobile

Ce dossier contient l'application mobile client GarageFlow. Elle permet aux clients de gerer leurs vehicules, consulter les garages, prendre rendez-vous, suivre leurs reparations et lire leurs notifications.

## Stack

* Expo
* React Native
* TypeScript
* React Navigation
* AsyncStorage pour le token JWT en MVP
* Fetch API
* Jest et Testing Library React Native
* ESLint

## Installation

```bash
cd mobile
npm install
```

## Variables d'environnement

Copier `.env.example` vers `.env.local` si l'URL de l'API doit changer localement. Ne jamais commiter `.env.local`.

```env
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Attention : sur telephone reel, `127.0.0.1` pointe vers le telephone, pas vers le PC.

* Emulateur Android : utiliser souvent `http://10.0.2.2:8000`.
* Telephone physique : utiliser l'IP locale du PC, par exemple `http://192.168.x.x:8000`.
* Simulateur iOS local : `127.0.0.1` peut fonctionner selon la configuration.


## Compatibilite Expo Go

Le projet mobile est aligne avec Expo SDK 54 pour rester compatible avec Expo Go 54 sur l'iPhone de test.

```bash
npx expo start -c
```

Pour scanner le QR code avec Expo Go, le PC et l'iPhone doivent etre connectes au meme reseau Wi-Fi. Ne pas utiliser `--tunnel` sauf si le reseau local bloque la connexion.

Sur iPhone physique, l'API Symfony doit etre appelee avec l'adresse IP locale du PC, pas avec `127.0.0.1`. Exemple local possible :

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.144:8000
```

Cette IP depend du PC et du reseau. Elle peut etre placee dans `.env.local`, mais ce fichier ne doit jamais etre commite.
## Commandes

```bash
npm start
npm run android
npm run ios
npm run lint
npm test
npx tsc --noEmit
npm audit --omit=dev
```

## Structure

```text
src/
|-- api/          -> client HTTP et appels API mobiles
|-- components/   -> composants UI, layout, feedback, cartes et timeline
|-- contexts/     -> AuthContext mobile
|-- hooks/        -> hooks reutilisables
|-- navigation/   -> navigation auth, onglets et piles de detail
|-- screens/      -> ecrans de l'application
|-- types/        -> types TypeScript
`-- utils/        -> theme, stockage et formatage
```

## Ecrans disponibles

* Login et Register
* Home marketplace avec CTA reservation, categories, garages recommandes et suivis
* Garages avec recherche, categories, filtres et detail des prestations
* Reservation guidee avec vehicule, date cliquable et creneaux disponibles groupes
* Vehicles avec liste prioritaire, formulaire masquable, creation, modification et suppression
* Appointments avec liste, detail et annulation des rendez-vous annulables
* Interventions avec liste, detail et timeline de suivi reparation
* Notifications avec filtre toutes/non lues et actions de lecture
* Profile avec acces vehicules, notifications et deconnexion


## Compte de demonstration

Apres execution de `php bin/console app:create-demo-data` dans `backend/`, l'application mobile peut etre testee avec le compte client suivant :

```text
Client : client.demo@garageflow.local / Password123
```

Ce compte sert uniquement a presenter le parcours client du MVP localement.
## Parcours client MVP

L'application mobile permet au client de gerer ses vehicules, de consulter les garages, de choisir une prestation et de demander un rendez-vous sur un creneau disponible. Le client peut aussi consulter le detail d'un rendez-vous, annuler un rendez-vous au statut `EN_ATTENTE` ou `CONFIRME`, suivre une intervention avec une timeline et gerer ses notifications lues ou non lues.

## Suivi reparation

La timeline client affiche les etapes MVP suivantes :

* `VEHICULE_DEPOSE`
* `DIAGNOSTIC_EN_COURS`
* `ATTENTE_VALIDATION_CLIENT`
* `REPARATION_EN_COURS`
* `VEHICULE_PRET`
* `VEHICULE_RECUPERE`

Si le backend renvoie un historique de statuts, l'application l'utilise. Sinon, elle affiche une timeline simplifiee selon le statut actuel. Les notes internes garage ne sont jamais affichees cote client.

## Notifications

L'ecran Notifications permet de consulter toutes les notifications ou seulement les non lues. Une notification non lue peut etre marquee comme lue, et un bouton permet de tout marquer comme lu.


## Polish UI/UX MVP

L'interface mobile utilise un theme centralise pour les couleurs, espacements, tailles de texte et ombres legeres. Les choix restent sobres pour une presentation jury : fond clair, bleu GarageFlow, cartes compactes, boutons moins hauts et onglets courts (`Autos`, `RDV`, `Suivi`, `Alertes`) pour eviter les labels tronques sur iPhone.

Limites assumees : le design reste MVP, sans animations avancees, sans design system complet de production et sans notifications push.

## Experience marketplace mobile

La refonte UX mobile presente le parcours client dans un ordre plus naturel : decouvrir les categories, comparer les garages, choisir une prestation, reserver un rendez-vous puis suivre l'intervention. Les cartes sont compactes, les garages ont une couverture visuelle de remplacement et les actions principales restent lisibles sur iPhone.

La barre du bas garde volontairement cinq entrees visibles : `Accueil`, `Garages`, `RDV`, `Suivi` et `Profil`. Les ecrans `Vehicules` et `Notifications` ne disparaissent pas : ils sont accessibles depuis l'accueil, le profil et la cloche de notifications lorsque l'ecran l'affiche.

## Reservation mobile

Le parcours de reservation part de la fiche garage : le client choisit une prestation, selectionne un vehicule, choisit une date dans une liste de jours cliquables, consulte les creneaux disponibles puis confirme le rendez-vous. Il n y a plus de saisie manuelle de date. Les creneaux affiches viennent de la valeur `dateDebut` renvoyee par l'API de disponibilite et sont presentes en heure lisible, par exemple `09:00 - 09:30`.

Les creneaux sont groupes par moment de journee : Matin, Apres-midi et Soir si necessaire. Si aucun creneau n est disponible aujourd hui, le mobile affiche `Aucun creneau restant aujourd hui.` puis propose de tester le jour suivant. Pour les autres dates, il affiche `Aucun creneau disponible pour cette date.` et invite le client a essayer une autre date.`r`n`r`nLors de la creation du rendez-vous, le mobile envoie `garageId`, `serviceId`, `vehicleId`, `dateDebut` et `commentaireClient`. `dateDebut` doit rester une date ISO compatible avec le backend Symfony. Si aucun vehicule n'existe, le mobile affiche `Ajoutez un vehicule avant de reserver.` et ne montre pas un formulaire inutilisable.
## Securite

Le token JWT est stocke avec AsyncStorage pour le MVP. Pour une application en production, une solution plus securisee comme SecureStore serait preferable.

## Limites actuelles

* Pas de notifications push.
* Pas de temps reel WebSocket.
* Pas de paiement en ligne.
* Stockage token AsyncStorage adapte au MVP, SecureStore recommande en production.
* Design encore MVP, optimise pour une presentation jury.
