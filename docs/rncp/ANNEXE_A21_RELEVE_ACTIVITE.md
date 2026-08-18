<!--
Ce fichier est le releve d'activite Git du projet GarageFlow, annexe A21 du dossier RNCP36463.
Il existe pour servir de preuve aux competences d'estimation de delais et de suivi d'activite.
Il communique avec l'historique Git reel du depot (git log), sans aucune donnee estimee.
-->

# Annexe A21 — Relevé d'activité (reconstitué depuis l'historique Git)

Données extraites de `git log` sur la branche `feat/rncp-triggers-i18n-export` (historique linéaire
complet du dépôt) le 18 août 2026. Dates au format ISO, heure locale du commit (UTC+02:00, heure
d'été de Paris — fuseau enregistré par Git au moment de chaque commit).

## Période couverte

| | |
|---|---|
| Premier commit | `3ae4a48` — 2026-06-26T01:56:32+02:00 — *chore(repo): prepare GarageFlow project structure* |
| Dernier commit | `2a55f4a` — 2026-08-17T10:39:46+02:00 — *docs(technique): creer le dictionnaire de donnees et table de correspondance* |
| Durée du calendrier couvert | 53 jours (26 juin → 17 août) |
| Nombre de jours calendaires avec au moins un commit | 8 jours sur les 53 |
| **Nombre total de commits** | **65** |

## Répartition par mois

| Mois | Commits |
|---|---|
| 2026-06 (juin) | 34 |
| 2026-07 (juillet) | 2 |
| 2026-08 (août, jusqu'au 17) | 29 |
| **Total** | **65** |

## Répartition par semaine ISO

| Semaine ISO | Dates | Commits |
|---|---|---|
| 2026-W26 | 22–28 juin | 15 |
| 2026-W27 | 29 juin–5 juillet | 21 |
| 2026-W28 à 2026-W32 | 6 juillet–9 août | 0 |
| 2026-W33 | 10–16 août | 28 |
| 2026-W34 | 17–23 août (1 jour observé) | 1 |
| **Total** | | **65** |

## Répartition par jour de la semaine

| Jour | Commits | Part |
|---|---|---|
| Lundi | 17 | 26,2 % |
| Mardi | 3 | 4,6 % |
| Mercredi | 2 | 3,1 % |
| Jeudi | 0 | 0,0 % |
| Vendredi | 6 | 9,2 % |
| Samedi | 2 | 3,1 % |
| **Dimanche** | **35** | **53,8 %** |
| **Total** | **65** | **100 %** |

Moyenne théorique si l'activité était uniformément répartie sur 7 jours : 9,29 commits/jour, soit
14,3 % par jour.

## Répartition par tranche horaire

| Tranche | Commits | Part |
|---|---|---|
| Nuit (00h–06h) | 15 | 23,1 % |
| Matin (06h–12h) | 9 | 13,8 % |
| Après-midi (12h–18h) | 21 | 32,3 % |
| Soirée (18h–22h) | 19 | 29,2 % |
| Fin de soirée (22h–24h) | 1 | 1,5 % |
| **Total** | **65** | **100 %** |

Détail par heure (heures avec au moins un commit) : 00h:3, 01h:5, 02h:4, 03h:3, 09h:4, 10h:4, 11h:1,
12h:3, 13h:5, 14h:3, 15h:9, 17h:1, 18h:3, 19h:4, 20h:10, 21h:2, 23h:1. Aucun commit entre 04h et 08h,
ni entre 16h et 17h.

Semaine (lundi–vendredi) : 28 commits (43,1 %). Week-end (samedi–dimanche) : 37 commits (56,9 %).

## Périodes d'activité intense et périodes creuses

| Période | Durée | Commits | Jours calendaires actifs dans la période |
|---|---|---|---|
| Bloc 1 — 26 juin au 1er juillet 2026 | 6 jours | 36 | 26, 28, 29, 30 juin ; 1er juillet |
| **Creux** — 1er juillet 14h08 au 15 août 19h46 | **45 jours et 5h38** | 0 | aucun |
| Bloc 2 — 15 au 17 août 2026 | 3 jours | 29 | 15, 16, 17 août |

Journée la plus chargée : **16 août 2026 (dimanche), 26 commits**. Fenêtre glissante de 24h la plus
chargée : 27 commits entre le 15 août 23h43 et le 16 août 23h43. Deuxième journée la plus chargée :
**29 juin 2026 (lundi), 16 commits**.

Écarts les plus longs entre deux commits consécutifs (hors le creux de 45 jours ci-dessus) : 2 jours
et 11h30 (26→28 juin), 17h59 (30 juin→1er juillet), 13h39 (16→17 août).

## Répartition des commits par type (préfixe conventional commit)

| Type | Commits | Part |
|---|---|---|
| feat | 23 | 35,4 % |
| docs | 19 | 29,2 % |
| fix | 7 | 10,8 % |
| chore | 5 | 7,7 % |
| style | 5 | 7,7 % |
| test | 3 | 4,6 % |
| refactor | 3 | 4,6 % |
| **Total** | **65** | **100 %** |

Méthode : préfixe extrait du sujet du commit (`type(scope): ...` ou `type: ...`), avant la première
parenthèse ou le premier deux-points. Les 65 commits du dépôt suivent tous cette convention — aucun
n'a dû être classé en « autre ».

## Répartition des commits par zone du projet

Méthode : chaque commit est classé selon les répertoires racine des fichiers qu'il modifie
(`backend/`, `web/`, `mobile/`, `docs/`, ou `Autre` pour les fichiers à la racine du dépôt comme
`README.md` ou `AGENTS.md`). Un commit qui touche exclusivement un seul de ces répertoires est classé
dans cette zone ; un commit qui touche plusieurs répertoires à la fois est classé « Plusieurs zones »
pour ne pas compter deux fois le même commit.

| Zone | Commits |
|---|---|
| Backend | 25 |
| Docs | 13 |
| Web | 5 |
| Mobile | 4 |
| Autre (racine du dépôt) | 2 |
| Plusieurs zones (commit transverse) | 16 |
| **Total** | **65** |

Détail des 16 commits transverses, par combinaison de zones touchées :

| Zones touchées ensemble | Commits |
|---|---|
| Docs + Mobile | 4 |
| Docs + Web | 3 |
| Autre + Backend | 2 |
| Backend + Docs | 1 |
| Autre + Web | 1 |
| Autre + Mobile | 1 |
| Docs + Mobile + Web | 1 |
| Autre + Docs + Mobile + Web | 1 |
| Autre + Backend + Docs | 1 |
| Autre + Backend + Docs + Mobile + Web | 1 |
| **Total commits transverses** | **16** |

## Réponse à la question posée : concentration par jour de la semaine

**Oui, l'activité se concentre nettement sur deux jours : dimanche et lundi, qui réunissent à eux
seuls 80,0 % des 65 commits (52/65).**

- Le dimanche à lui seul représente 53,8 % des commits (35/65) — plus que tous les autres jours de
  la semaine réunis (46,2 %).
- L'écart entre le dimanche (53,8 %) et le deuxième jour le plus actif, le lundi (26,2 %), est de
  **27,6 points de pourcentage**.
- L'écart entre le dimanche et la moyenne théorique uniforme (14,3 % par jour) est de **+39,5 points**,
  soit un taux d'activité 3,76 fois supérieur à cette moyenne.
- Le jeudi n'a reçu aucun commit sur toute la période (0/65).

Un fait mérite d'être signalé pour interpréter correctement ce chiffre : sur les 53 jours couverts,
seuls **8 jours calendaires distincts** portent au moins un commit. Le dimanche n'apparaît que deux
fois parmi ces 8 jours (28 juin et 16 août), et ces deux dimanches concentrent à eux seuls 35 commits
(dont 26 le seul 16 août). Le lundi n'apparaît également que deux fois (29 juin et 17 août, 17
commits). La concentration observée par jour de la semaine reflète donc directement le fait que les
deux blocs de travail identifiés ci-dessus (26 juin–1er juillet et 15–17 août) ont chacun démarré ou
culminé un dimanche ou un lundi, plutôt qu'une récurrence hebdomadaire observée sur de nombreuses
semaines successives.

## Constat factuel

L'activité du dépôt se répartit en deux blocs disjoints séparés par un creux de 45 jours sans aucun
commit (1er juillet–15 août). Le premier bloc (26 juin–1er juillet, 36 commits) couvre la mise en
place initiale du projet : structure du dépôt, backend Symfony, frontend web React, application
mobile Expo. Le second bloc (15–17 août, 29 commits, dont 26 le seul 16 août) couvre le durcissement
qualité en vue du dossier RNCP : outillage d'analyse statique, sécurité des dépendances, déclencheurs
SQL, export de données, journalisation applicative et documentation technique. Sur les deux blocs
d'activité, 56,9 % des commits ont eu lieu un week-end et 32,3 % l'après-midi contre 13,8 % le matin.
65 commits, tous typés selon la convention `type(scope): sujet`, se répartissent en 35,4 % de
fonctionnalités (`feat`), 29,2 % de documentation (`docs`) et 35,4 % réparti entre correctifs,
tâches d'outillage, mise en forme, tests et refactorisations. Le backend concentre 25 commits en
zone exclusive (38,5 % du total), contre 5 pour le web et 4 pour le mobile en zone exclusive — les
deux frontends recevant l'essentiel de leurs commits pendant le premier bloc (26 juin–1er juillet).

---

Branche courante : `feat/rncp-triggers-i18n-export`.
