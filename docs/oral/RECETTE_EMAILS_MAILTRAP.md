<!--
Ce fichier prepare la recette des emails Mailtrap pour la soutenance GarageFlow.
Il existe pour montrer au jury que les emails externes sont testes sans envoyer de vrais messages.
Il communique avec le backend Symfony, Mailtrap et les parcours rendez-vous/intervention.
-->

# Recette emails Mailtrap

## Objectif

Verifier que GarageFlow sait envoyer des emails clients via un service SMTP externe de demonstration. Mailtrap capture les messages dans une boite de test et evite tout envoi reel.

Phrase a dire : "J'ai integre un service externe SMTP via Mailtrap pour capturer les emails de demonstration sans envoyer de vrais messages."

## Preparation

1. Configurer `backend/.env.local` avec la valeur Mailtrap locale :

```env
MAILER_DSN=smtp://USERNAME:PASSWORD@sandbox.smtp.mailtrap.io:2525
```

2. Lancer le backend Symfony.
3. Ouvrir la boite Mailtrap du projet.
4. Utiliser les donnees de demonstration GarageFlow.

## Scenario de demonstration

1. Depuis le web garage, accepter un rendez-vous en attente.
2. Verifier dans Mailtrap l'email "Votre rendez-vous GarageFlow est confirme".
3. Refuser un autre rendez-vous avec un motif.
4. Verifier dans Mailtrap l'email "Votre rendez-vous GarageFlow a ete refuse" avec le motif.
5. Changer le statut d'une intervention vers `VEHICULE_PRET`.
6. Verifier dans Mailtrap l'email "Votre vehicule est pret" avec la phrase : "Votre vehicule est pret a etre recupere aupres du garage."
7. Ajouter une note interne puis verifier qu'elle n'apparait pas dans les emails clients.

## Points a expliquer

* Les emails sont declenches par les services backend, pas par le frontend.
* Les notifications applicatives restent disponibles dans l'application.
* Mailtrap est un outil de demonstration et de test, pas un fournisseur final de production.
* Aucun identifiant Mailtrap reel n'est commite.

## Alternatives production

Pour une version production, GarageFlow pourrait utiliser Brevo, SendGrid, Resend ou Mailgun. Il faudrait aussi configurer un domaine expediteur, SPF/DKIM et une surveillance des erreurs.