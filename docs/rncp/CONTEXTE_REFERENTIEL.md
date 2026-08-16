# Contraintes du référentiel RNCP36463

> **À lire avant tout travail technique sur ce dépôt jusqu'au 17 septembre.**
> Ce fichier explique *pourquoi* certaines exigences techniques de ce projet peuvent sembler arbitraires. Elles ne le sont pas : elles proviennent des critères d'évaluation d'un titre professionnel.

## Le cadre

Ce dépôt sert de support au titre **RNCP36463 — Concepteur Développeur d'Applications Numériques** (certificateur IGS/IPI).

- **Dossier écrit** : 20 août
- **Soutenance** : 17 septembre, 20 minutes devant deux professionnels de l'informatique externes au certificateur
- **36 compétences** réparties en 4 blocs
- **Aucune compensation** : une seule compétence non validée = titre non obtenu

Conséquence pratique : un critère d'évaluation formulé littéralement doit être satisfait littéralement. Si le référentiel écrit « déclencheurs », une contrainte `CHECK` ne suffit pas. Si le référentiel écrit « tests unitaires », des tests fonctionnels ne suffisent pas.

---

## Critères qui pilotent des décisions techniques dans ce dépôt

### Qualité du code
Le référentiel exige une programmation orientée objet, l'usage de gabarits, une charte de nommage, un taux de réutilisation du code utile supérieur à 80 %, et un **taux de documentation interne du code strictement supérieur à 8 % et inférieur à 15 %**.

C'est ce dernier seuil qui explique le travail sur le ratio de commentaires. Être **au-dessus** de 15 % échoue au critère au même titre qu'être en dessous de 8 %. La méthode de mesure doit être documentée et reproductible, car elle sera citée dans le dossier.

### Contrôle automatique du code
Le référentiel demande que des outils de contrôle automatique du code soient utilisés et qu'**aucun défaut visible ne persiste**.

Un outil installé mais qui remonte des centaines d'erreurs échoue au critère. Mieux vaut un niveau d'analyse modeste et vert qu'un niveau ambitieux et rouge.

### Sécurité de la base de données
Le référentiel demande de garantir l'accès aux données « par l'usage de contraintes d'intégrité **et** de déclencheurs ».

Le « et » est déterminant. Les contraintes existent (23 clés étrangères, 6 `CHECK` vérifiées). Les déclencheurs restent à créer.

### Tests
Deux compétences distinctes portent sur les tests, et le référentiel emploie explicitement le terme **tests unitaires**, avec pour livrable attendu un « plan de tests unitaires ».

Les tests fonctionnels de type `WebTestCase` ne satisfont pas ce critère à eux seuls. D'où la création de `tests/Unit/`.

### Accessibilité
Le référentiel exige le respect d'une norme de présentation et de législation, « tel que le **RGAA** ».

La norme est nommée. Des bonnes pratiques non rattachées à un référentiel ne suffisent pas.

### Interfaces d'échange de données
Un bloc entier porte sur les échanges entre logiciels : **rétro-documentation** d'un logiciel existant, **tables de correspondance** de données, agrégation, flux d'import/export, et **scripts d'automatisation** de l'environnement de tests.

C'est ce qui donne sa valeur au travail sur `API.md`, à Docker, aux commandes console et à un éventuel export CSV/JSON.

### Mise en exploitation
Le référentiel demande une procédure d'intégrabilité selon les bonnes pratiques ITIL, avec une **liste de contrôle** dont l'intégralité des points doit être positive.

D'où la transformation de la fiche de lancement en liste de contrôle vérifiable.

---

## Règles de travail permanentes

1. **Aucun commit antidaté, jamais.** L'historique Git doit refléter la réalité. Une falsification détectée coûterait le titre.

2. **Aucune affirmation non vérifiée dans la documentation.** Tout fichier du dépôt peut être lu par le jury. Un chiffre périmé ou une fonctionnalité annoncée mais absente détruit la crédibilité de l'ensemble. En cas de doute, mesure plutôt que d'estimer, et date tes constats.

3. **Franchise sur ce qui ne marche pas.** Un problème signalé est traitable ; un problème masqué se découvre en soutenance.

4. **Toute production doit être explicable par le candidat.** Le jury posera des questions sur le code. Quand une modification est non triviale, explique-la dans le message de commit ou dans la documentation — pas seulement ce qui change, mais pourquoi.

5. **Le périmètre MVP défini dans `AGENTS.md` reste la référence.** Les critères ci-dessus justifient des ajouts d'outillage, de tests et de documentation, jamais de nouvelles fonctionnalités métier.

6. **Signaler les opportunités.** Si tu repères dans le code quelque chose qui satisfait ou pourrait facilement satisfaire un des critères ci-dessus, dis-le. Certaines compétences se valident avec un livrable de quelques heures.

---

## État au jour de rédaction de ce fichier

| Sujet | État |
|---|---|
| PHPStan niveau 6 | 0 erreur |
| PHP-CS-Fixer | 0 violation |
| Tests backend | 65 tests, 359 assertions (dont 12 tests unitaires isolés dans `tests/Unit/`, 4 tests des déclencheurs SQL en base réelle et 7 tests de journalisation applicative avec vérification de l'auteur) |
| Routes documentées | 48 / 48 |
| Ratio de commentaires | 14,00 % — **cible 8-15 % atteinte** |
| Sécurité dépendances npm (web) | 0 vulnérabilité (6 corrigées le 2026-08-16) |
| Sécurité dépendances npm (mobile) | 19 vulnérabilités restantes, documentées et datées (`docs/technique/SECURITE_DEPENDANCES.md`) — nécessitent une migration majeure du SDK Expo, hors périmètre du durcissement en cours |
| Déclencheurs SQL | **2 déclencheurs créés** (migration `Version20260816200000`) : contrôle sur `notification` (BEFORE INSERT/UPDATE, rejette une notification sans rendez-vous ni intervention) et audit sur `user` (AFTER UPDATE, journalise dans `action_log` tout changement de rôle ou d'état actif) |
| Journalisation applicative (`action_log`) | **fait** : `ActionLogService` alimente `action_log` avec l'auteur authentifié pour les rendez-vous, interventions, prestations, indisponibilités et garage — voir `docs/technique/TRACABILITE.md`, qui fait autorité sur ce point et signale les PDF de référence dépassés (matrice des droits, dictionnaire de données) |
| Audit RGAA | **non réalisé** |
| Pipeline CI | **absent** |
| Export de données | **fait** : export CSV/JSON des rendez-vous et interventions du garage, filtré par période (`GET /api/garage/me/export/appointments`, `.../interventions`, documenté dans `backend/docs/API.md`) |
| Communication bilingue | **fait** : `README.en.md` ajouté à la racine |

Mise à jour : 2026-08-16 (branche `feat/rncp-triggers-i18n-export`, fusionnée depuis `chore/rncp-hardening`). Ce tableau doit être tenu à jour à chaque lot.