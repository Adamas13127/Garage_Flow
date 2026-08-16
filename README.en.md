<!--
This file presents the GarageFlow project at the root of the repository.
It exists to give the jury and developers a quick view of the MVP, its architecture and its main commands.
It communicates with the backend, web, mobile and docs folders that make up the monorepo.
-->

# GarageFlow

GarageFlow is a web and mobile platform for booking appointments and tracking vehicle repairs for independent car garages.

English version of `README.md`. In case of discrepancy between the two, `README.md` (French) is the reference version.

## MVP goal

The MVP lets clients manage their vehicles, book appointments and track their repairs. It also lets garages manage their services, opening hours, unavailability periods, appointments, repairs, statuses, internal notes and notifications.

## Architecture

```text
garageflow/
|-- backend/  -> Symfony REST API, Doctrine ORM, MySQL and JWT
|-- web/      -> garage web dashboard with React, Vite and Tailwind CSS
|-- mobile/   -> client mobile app with Expo SDK 54
|-- docs/     -> functional and technical documentation, defense materials
|-- README.md -> project overview (French, reference version)
`-- AGENTS.md -> project development rules
```

## Tech stack

* Backend: Symfony REST API
* ORM: Doctrine ORM
* Database: MySQL with Docker
* Authentication: JWT
* Web frontend: React + Vite + Tailwind CSS
* Mobile: React Native + Expo SDK 54
* Documentation: Markdown
* Versioning: GitHub

## Project status

The MVP is functional for a local demonstration: the backend API, the garage web dashboard, the client mobile app, demo data and automated tests are all in place. Features outside the MVP scope, such as payment, invoicing, parts inventory, SMS and real-time chat, are not implemented.

## Quick start

See `docs/oral/FICHE_LANCEMENT_LOCAL.md` (French) for the full local setup walkthrough. Summary:

```bash
cd backend
docker compose up -d database
php bin/console doctrine:migrations:migrate
php bin/console app:create-demo-data
php -S 0.0.0.0:8000 -t public
```

```bash
cd web
npm install
npm run dev
```

```bash
cd mobile
npm install
npx expo start -c
```

## Demo accounts

Shared password: `Password123`.

| Interface | Role | Email |
| --- | --- | --- |
| Garage web | Manager | `gerant.demo@garageflow.local` |
| Garage web | Employee | `employe.demo@garageflow.local` |
| Mobile client | Client | `client.demo@garageflow.local` |

## Further reading (French)

The project's functional, technical and defense documentation is written in French, the language of the RNCP36463 certification this project supports:

* `backend/README.md`: backend installation and commands.
* `backend/docs/API.md`: main API routes.
* `backend/docs/DEMO_DATA.md`: demo data.
* `docs/oral/AUDIT_FINAL_MVP.md`: final MVP status.
* `docs/oral/FICHE_LANCEMENT_LOCAL.md`: local launch checklist.
* `docs/oral/SCENARIO_DEMO_JURY.md`: recommended demo walkthrough for the defense.

## Git safety

Never commit `.env.local`, `.env.test.local`, `.pem` files, `node_modules/`, `vendor/`, `var/`, `dist/`, `build/` or temporary files.
