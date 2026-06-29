<!--
Ce fichier sert de fiche de lancement local pour GarageFlow.
Il existe pour aider le jury ou un developpeur a demarrer rapidement le backend, le web et le mobile.
Il communique avec Docker, Symfony, React/Vite, Expo et les variables d'environnement locales.
-->

# Fiche de lancement local

## 1. Lancer Docker et MySQL

Depuis `backend/` :

```bash
docker compose up -d database
```

## 2. Lancer le backend Symfony

Installer les dependances si necessaire :

```bash
composer install
```

Preparer la base :

```bash
php bin/console doctrine:database:create --if-not-exists
php bin/console doctrine:migrations:migrate
```

Lancer l'API :

```bash
php -S 127.0.0.1:8000 -t public
```

URL API locale : `http://127.0.0.1:8000`.

## 3. Creer les donnees de demo

Depuis `backend/` :

```bash
php bin/console app:create-demo-data
```

La commande est idempotente : elle peut etre relancee sans creer de doublons incoherents.

## 4. Lancer le web React

Depuis `web/` :

```bash
npm install
npm run dev
```

URL web locale habituelle : `http://127.0.0.1:5173`.

La variable utile est :

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## 5. Lancer le mobile Expo

Depuis `mobile/` :

```bash
npm install
npx expo start -c
```

Le projet est aligne avec Expo SDK 54 et compatible avec Expo Go 54 sur iPhone.

## 6. Variable mobile avec IP du PC

Sur telephone physique, `127.0.0.1` pointe vers le telephone. Il faut utiliser l'IP locale du PC :

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.144:8000
```

Cette IP est un exemple. Elle depend du reseau et ne doit pas etre commitee dans `.env.local`.

## 7. Comptes de connexion

Mot de passe commun : `Password123`.

| Interface | Role | Email |
| --- | --- | --- |
| Web garage | Gerant | `gerant.demo@garageflow.local` |
| Web garage | Employe | `employe.demo@garageflow.local` |
| Mobile client | Client | `client.demo@garageflow.local` |

## 8. Problemes frequents

### CORS

Verifier que le backend autorise les origines locales du web et du mobile. Redemarrer le serveur Symfony apres modification de configuration.

### IP qui change

Si le mobile ne contacte plus l'API, verifier l'IP locale du PC et mettre a jour `mobile/.env.local`.

### Telephone pas sur le meme Wi-Fi

Expo Go en mode local demande que le PC et l'iPhone soient sur le meme reseau Wi-Fi.

### Expo Go incompatible

Verifier que l'iPhone utilise Expo Go 54 et que le projet reste en Expo SDK 54 :

```bash
npx expo install --check
```

### Docker non lance

Si Doctrine ne se connecte pas a MySQL, relancer :

```bash
docker compose up -d database
```

### Esbuild bloque sur Windows

Si `npm test` ou `npm run build` affiche `spawn EPERM`, fermer les terminaux, verifier l'antivirus, puis relancer :

```bash
npm rebuild esbuild
```
