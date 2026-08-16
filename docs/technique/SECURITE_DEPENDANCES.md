# Etat des vulnerabilites de dependances npm

Derniere mise a jour : 2026-08-16, via `npm audit` sur `web/` et `mobile/`.

Un etat date vaut mieux qu'un chiffre optimiste : ce document liste precisement ce qui reste
vulnerable, pourquoi ce n'est pas corrige aujourd'hui, et ce qu'il faudrait faire. Aucune
correction n'a ete appliquee via `npm audit fix --force` : seules les mises a jour qui ne cassent
aucun test ni le build n'ont ete retenues.

## web/

**0 vulnerabilite** (`npm audit` propre au 2026-08-16).

Corrections appliquees sans `--force`, par bump manuel de version dans `package.json` suivi d'un
`npm install` classique (pas de saut de version majeure) :

| Paquet | Avant | Apres | Raison |
| --- | --- | --- | --- |
| `react-router-dom` | 7.10.1 | 7.18.2 | XSS/DoS/CSRF multiples dans `react-router` (haute severite) |
| `vite` | 7.2.7 | 7.3.6 | Path traversal et lecture de fichiers arbitraire via le serveur de dev (haute severite) |
| `eslint` | 9.17.0 | 9.39.5 | ReDoS dans `@eslint/plugin-kit` (basse severite, outil de dev uniquement) |
| `postcss` | 8.5.6 | 8.5.26 | XSS et lecture de fichiers via source maps (haute severite) |

Verifie apres bump : 31/31 tests (`npm test`), `npm run lint` sans erreur, `npm run build` reussi.

## mobile/

**19 vulnerabilites restantes** (8 moderees, 11 hautes) au 2026-08-16, apres application de
`npm audit fix` (sans `--force`) qui en a deja corrige 5 (`tar`, `undici` et leurs advisories
associees) : 24 -> 19.

Verifie apres fix : 39/39 tests (`npm test`).

### Pourquoi les 19 restantes ne sont pas corrigees

Les 19 avertissements restants remontent tous, dans l'arbre de dependances, a deux paquets
racine : `expo` (SDK ~54.0.0) et, dans une moindre mesure, `react-native` (0.81.5). npm propose
deux chemins de correction, tous les deux ecartes :

* **`expo@57.0.13`** (`npm audit fix --force`) : saut de 3 versions majeures du SDK Expo
  (54 -> 57). Un tel saut implique typiquement une migration du code natif, des plugins de
  configuration et potentiellement des API depreciees -- hors perimetre d'un correctif de
  securite, a traiter comme un chantier dedie avec son propre plan de test.
* **`react-native@0.72.17`** (propose par npm pour `metro`/`@react-native/community-cli-plugin`) :
  ce n'est pas une mise a jour mais une **regression** vers une version anterieure a celle
  installee (0.81.5). npm le propose car une ancienne dependance transitive de `metro` exige ce
  plafond de version -- l'appliquer degraderait le projet, ce n'est pas un correctif utilisable.

Paquets concernes (tous transitifs, aucun ajoute directement par ce projet) : `@expo/cli`,
`@expo/config`, `@expo/config-plugins`, `@expo/metro`, `@expo/metro-config`,
`@expo/prebuild-config`, `@react-native/community-cli-plugin`, `expo`, `expo-asset`,
`expo-constants`, `image-size`, `jest-expo`, `metro`, `metro-config`, `metro-transform-worker`,
`postcss`, `react-native`, `uuid`, `xcode`.

### Exposition reelle

L'essentiel de ces paquets (`metro`, `@expo/cli`, `jest-expo`, `xcode`, `@expo/config-plugins`)
sont des outils de build/dev (bundler, CLI, tests, generation de projet natif) : ils ne sont pas
executes dans l'application mobile publiee, seulement sur les machines de developpement et en CI.
Le risque reel pour un utilisateur final de l'app est donc plus faible que le nombre brut de
19 vulnerabilites ne le suggere, mais reste a corriger avant une mise en production au-dela du
MVP : ce n'est pas traite comme acceptable indefiniment, seulement hors du perimetre de ce
durcissement.

### Action recommandee

Planifier une migration Expo SDK 54 -> 57 (ou au moins vers la derniere version mineure de la
branche 5x la plus proche corrigeant ces CVE) comme chantier separe, avec son propre plan de test
sur les 39 tests mobile et une verification manuelle du build natif (Android/iOS), hors du cadre
du present durcissement qualite.
