<!--
Ce fichier sert de fiche de lancement local pour GarageFlow.
Il existe pour aider le jury ou un developpeur a demarrer rapidement le backend, le web et le mobile
sans rien deviner, y compris depuis un clone tout juste recupere.
Il communique avec Docker, Symfony, React/Vite, Expo et les variables d'environnement locales.
-->

# Fiche de lancement local

Checklist a derouler dans l'ordre. Chaque etape indique le resultat attendu qui permet de
verifier qu'elle a reussi avant de passer a la suivante.

## 1. Lancer Docker (MySQL + Mailpit)

Depuis `backend/` :

```bash
docker compose up -d
```

**Resultat attendu** : `docker ps` liste deux conteneurs `Up` (`backend-database-1` sur le port
3306 et `backend-mailer-1` sur les ports 1025/8025).

## 2. Creer le fichier d'environnement backend

Depuis `backend/` :

```bash
cp .env.example .env
```

**Resultat attendu** : `backend/.env` existe et contient `APP_ENV=dev`. Ce fichier ne contient
aucun secret reel ; il suffit tel quel pour demarrer en local (Mailpit ne demande pas
d'identifiant, la base utilise les valeurs par defaut du conteneur Docker).

## 3. Installer les dependances PHP

Depuis `backend/` :

```bash
composer install
```

**Resultat attendu** : un dossier `vendor/` est cree, la commande se termine sans erreur
(`Generating autoload files` puis `Executing script cache:clear [OK]`).

## 4. Generer la paire de cles JWT

Methode principale (commande Lexik) :

```bash
php bin/console lexik:jwt:generate-keypair
```

**Resultat attendu** : `backend/config/jwt/private.pem` et `public.pem` sont crees.

**Repli si la commande echoue** (erreur OpenSSL type `No such process`, frequente sous PHP
Windows/XAMPP) : generer les cles directement avec la CLI OpenSSL. Choisir une valeur pour
`JWT_PASSPHRASE` dans `backend/.env`, puis :

```bash
mkdir -p config/jwt
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096 -pass pass:VOTRE_PASSPHRASE
openssl pkey -in config/jwt/private.pem -passin pass:VOTRE_PASSPHRASE -out config/jwt/public.pem -pubout
```

Puis completer `backend/.env` :

```env
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=VOTRE_PASSPHRASE
JWT_TOKEN_TTL=3600
```

**Resultat attendu (dans les deux cas)** :

```bash
php bin/console lexik:jwt:check-config
```

affiche `The configuration seems correct.`

## 5. Preparer la base de donnees

Depuis `backend/` :

```bash
php bin/console doctrine:database:create --if-not-exists
php bin/console doctrine:migrations:migrate --no-interaction
```

**Resultat attendu** : le message `Successfully migrated to version: ...` s'affiche sans erreur.

## 6. Lancer l'API

Depuis `backend/` :

```bash
php -S 0.0.0.0:8000 -t public
```

URL API locale : `http://127.0.0.1:8000` (accessible aussi depuis le reseau local via l'IP du
PC, utile pour le mobile).

**Resultat attendu** :

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"client.test@example.com\",\"password\":\"Password123\"}"
```

repond en JSON (un `token` si le compte existe deja, sinon une erreur 401 propre — dans les deux
cas cela prouve que l'API repond).

## 7. Creer les donnees de demo

Depuis `backend/` :

```bash
php bin/console app:create-demo-data
```

**Resultat attendu** : un recapitulatif s'affiche (garage, comptes, vehicules, prestations,
rendez-vous, interventions). La commande est idempotente : la relancer reutilise les donnees
existantes sans creer de doublons.

## 8. Installer et lancer le web React

Depuis `web/` :

```bash
npm install
npm run dev
```

**Resultat attendu** : `npm install` se termine sans conflit de peer dependency (vitest 4 declare
officiellement vite 7), le serveur Vite demarre et annonce `http://127.0.0.1:5173`. Le script `dev`
est fige sur ce port (`--port 5173 --strictPort`) : si le port est deja occupe (par exemple un
ancien `npm run dev` reste ouvert dans un terminal oublie), la commande echoue clairement au lieu
de basculer silencieusement sur un autre port — voir "Port 5173 deja occupe" dans les problemes
frequents.

La variable utile est :

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## 9. Installer et lancer le mobile Expo

Depuis `mobile/` :

```bash
npm install
npx expo start -c
```

**Resultat attendu** : `npm install` se termine sans conflit de peer dependency. Expo affiche un
QR code et le project est aligne avec Expo SDK 54 (compatible Expo Go 54).

## 10. Variable mobile avec IP du PC

Sur telephone physique, `127.0.0.1` pointe vers le telephone. Il faut utiliser l'IP locale du
PC :

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.144:8000
```

Cette IP est un exemple. Elle depend du reseau et ne doit pas etre commitee dans `.env.local`.

**Resultat attendu** : l'application mobile installee via Expo Go contacte l'API sans erreur
reseau (l'ecran d'accueil client charge les garages recommandes).

## 11. Comptes de connexion

Mot de passe commun : `Password123`.

| Interface | Role | Email |
| --- | --- | --- |
| Web garage | Gerant | `gerant.demo@garageflow.local` |
| Web garage | Employe | `employe.demo@garageflow.local` |
| Mobile client | Client | `client.demo@garageflow.local` |

**Resultat attendu** : chaque compte se connecte et accede a l'interface correspondant a son
role.

## 12. Verifier les emails de demonstration

Ouvrir `http://127.0.0.1:8025` (interface web Mailpit).

**Resultat attendu** : les emails envoyes par le backend (confirmation de rendez-vous, refus,
statut vehicule pret) apparaissent dans la liste, sans avoir ete envoyes a une vraie adresse.

## 13. Problemes frequents

### CORS

Verifier que le backend autorise les origines locales du web et du mobile. Redemarrer le serveur
Symfony apres modification de configuration.

### IP qui change

Si le mobile ne contacte plus l'API, verifier l'IP locale du PC et mettre a jour
`mobile/.env.local`.

### Telephone pas sur le meme Wi-Fi

Expo Go en mode local demande que le PC et l'iPhone soient sur le meme reseau Wi-Fi.

### Expo Go incompatible

Verifier que l'iPhone utilise Expo Go 54 et que le projet reste en Expo SDK 54 :

```bash
npx expo install --check
```

### Port 5173 deja occupe

`npm run dev` echoue avec `Port 5173 is already in use`. Un ancien serveur web oublie dans un
terminal (parfois vieux de plusieurs semaines) peut squatter le port. Identifier puis fermer ce
processus :

```bash
netstat -ano | findstr :5173
taskkill /PID <pid_affiche> /F
```

Si `taskkill` refuse (acces refuse), le processus appartient a une autre session Windows : fermer
la fenetre ou le terminal d'origine, ou redemarrer la session concernee.

### Docker non lance

Si Doctrine ne se connecte pas a MySQL, ou si les emails n'apparaissent pas dans Mailpit,
relancer :

```bash
docker compose up -d
```

### Cle JWT introuvable ou invalide

Si l'API repond `500` sur les routes d'authentification, verifier que
`backend/config/jwt/private.pem` et `public.pem` existent (etape 4) et que
`lexik:jwt:check-config` est au vert.

### Esbuild bloque sur Windows

Si `npm test` ou `npm run build` affiche `spawn EPERM`, fermer les terminaux, verifier
l'antivirus, puis relancer :

```bash
npm rebuild esbuild
```

## 14. Validation de cette fiche

Cette fiche a ete deroulee integralement (etapes 1 a 9) depuis un clone Git propre du depot,
sans reutiliser d'environnement backend/web deja configure : creation de `.env` depuis
`.env.example`, `composer install`, generation des cles JWT (repli OpenSSL inclus, la commande
Lexik ayant echoue sur ce poste), migrations, donnees de demo, demarrage de l'API et appel
`/api/auth/login` avec succes, puis `npm install` web et mobile sans aucun probleme. Toutes les
etapes sont passees.

Note : au moment de cette validation, `npm install` web necessitait encore
`--legacy-peer-deps` (conflit vitest 2.x / vite 7). Ce conflit a depuis ete resolu (vitest 4.1.10,
cf. historique Git) et l'etape ci-dessus reflete l'etat actuel, sans ce contournement.
