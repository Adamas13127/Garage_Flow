<!--
Ce fichier documente les emails externes du backend GarageFlow.
Il existe pour expliquer comment Mailtrap capture les messages de demonstration sans envoyer de vrais emails.
Il communique avec Symfony Mailer, EmailNotificationService et la variable MAILER_DSN.
-->

# Emails GarageFlow avec Mailtrap

## Role

Le backend utilise Symfony Mailer pour envoyer des emails clients lors des evenements importants du MVP. Mailtrap sert de boite de reception de demonstration : il capture les emails SMTP sans les envoyer a de vraies adresses.

Phrase utile a l'oral : "J'ai integre un service externe SMTP via Mailtrap pour capturer les emails de demonstration sans envoyer de vrais messages."

## Configuration locale

Les vrais identifiants Mailtrap doivent rester dans `backend/.env.local`, jamais dans Git.

```env
MAILER_DSN=smtp://USERNAME:PASSWORD@sandbox.smtp.mailtrap.io:2525
```

Remplacer `USERNAME` et `PASSWORD` par les valeurs du sandbox Mailtrap local.

## Evenements couverts

* Rendez-vous accepte : email de confirmation au client.
* Rendez-vous refuse : email de refus avec motif si le garage en fournit un.
* Rendez-vous annule : email d'annulation au client.
* Statut d'intervention modifie : email de mise a jour au client.
* Statut `VEHICULE_PRET` : email specifique indiquant que le vehicule peut etre recupere.

Les notes internes garage ne sont jamais ajoutees dans les emails clients.

## Commandes de verification

```bash
php bin/console lint:container
php bin/phpunit tests/Email
```

## Limites MVP

Les emails sont envoyes de maniere simple par SMTP. En production, on pourrait utiliser Brevo, SendGrid, Resend ou Mailgun avec une configuration de domaine, une adresse expediteur officielle et une surveillance des erreurs d'envoi.