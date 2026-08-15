<!--
Ce fichier prepare la recette des emails Mailpit pour la soutenance GarageFlow.
Il existe pour montrer au jury que les emails externes sont testes sans envoyer de vrais messages.
Il communique avec le backend Symfony, Mailpit et les parcours rendez-vous/intervention.
-->

# Recette emails Mailpit

## Objectif

Verifier que GarageFlow sait envoyer des emails clients via un service SMTP local de demonstration. Mailpit capture les messages dans une boite de test et evite tout envoi reel, sans compte externe a configurer.

Phrase a dire : "J'ai integre un service SMTP local via Mailpit pour capturer les emails de demonstration sans envoyer de vrais messages."

## Preparation

1. Lancer Mailpit avec le reste des services Docker :

```bash
docker compose up -d
```

2. Verifier `backend/.env` (ou `.env.local`) :

```env
MAILER_DSN=smtp://127.0.0.1:1025
```

3. Lancer le backend Symfony.
4. Ouvrir l'interface web Mailpit : `http://127.0.0.1:8025`.
5. Utiliser les donnees de demonstration GarageFlow.

## Scenario de demonstration

1. Depuis le web garage, accepter un rendez-vous en attente.
2. Verifier dans Mailpit l'email "Votre rendez-vous GarageFlow est confirme".
3. Refuser un autre rendez-vous avec un motif.
4. Verifier dans Mailpit l'email "Votre rendez-vous GarageFlow a ete refuse" avec le motif.
5. Changer le statut d'une intervention vers `VEHICULE_PRET`.
6. Verifier dans Mailpit l'email "Votre vehicule est pret" avec la phrase : "Votre vehicule est pret a etre recupere aupres du garage."
7. Ajouter une note interne puis verifier qu'elle n'apparait pas dans les emails clients.

## Points a expliquer

* Les emails sont declenches par les services backend, pas par le frontend.
* Les notifications applicatives restent disponibles dans l'application.
* Mailpit est un outil de demonstration et de test local, pas un fournisseur final de production.
* Aucun identifiant externe n'est requis ni commite : tout tourne en local via Docker.

## Alternatives production

Pour une version production, GarageFlow pourrait utiliser Brevo, SendGrid, Resend ou Mailgun. Il faudrait aussi configurer un domaine expediteur, SPF/DKIM et une surveillance des erreurs.
