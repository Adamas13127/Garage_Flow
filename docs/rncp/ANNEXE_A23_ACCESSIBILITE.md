<!--
Ce fichier est l'audit d'accessibilite du frontend GarageFlow, annexe A23 du dossier RNCP36463.
Il existe pour etat des lieux uniquement : aucune correction de code n'est appliquee dans ce lot.
Il communique avec le code reel de web/src et mobile/src, lu et verifie le 18 aout 2026.
-->

# Annexe A23 — Audit d'accessibilité (RGAA)

État des lieux, sans correction de code, établi par lecture directe du code source le 18 août 2026.
Le référentiel RNCP36463 exige le respect d'une norme de présentation « telle que le RGAA » (voir
`docs/rncp/CONTEXTE_REFERENTIEL.md`). GarageFlow a deux interfaces aux mécanismes différents : le
web (React, HTML/ARIA — le RGAA s'y applique directement) et le mobile (React Native/Expo, qui n'a
pas de DOM et utilise l'API `accessibility*` de React Native plutôt que HTML/ARIA — traité en section
séparée). Les critères ci-dessous sont ceux du RGAA/WCAG directement applicables à une application
de gestion de rendez-vous et de suivi d'atelier ; les critères sans objet pour ce type d'application
(médias temporels, CAPTCHA, cadres `<iframe>`, etc.) ne sont pas retenus.

## Grille de conformité — Web (React)

| # | Critère | Constat dans le code | Statut | Action corrective |
|---|---|---|---|---|
| 1 | Attribut `lang` | `<html lang="fr">` dans `web/index.html` (ligne 7) | **Conforme** | — |
| 2 | Structure des titres | `PageHeader` rend un unique `<h1>` par page (confirmé sur toutes les pages qui l'utilisent). Mais `Card`/`SettingsSection` rendent un `<h2>` pour leur `title`, et `InterventionListCard` rend aussi un `<h2>` pour le nom du véhicule. Sur `InterventionsPage.tsx`, un `<Card title="Interventions">` (`<h2>`) contient des `InterventionListCard` dont le titre véhicule est lui-même un `<h2>` (ligne 46) — deux niveaux `<h2>` imbriqués sans le `<h3>` intermédiaire attendu, alors que le même composant utilise correctement `<h3>`/`<h4>` juste en dessous (« Changer le statut », `InterventionDetailPanel`). | **Non conforme** (partiel) | Faire descendre le titre de `InterventionListCard` en `<h3>` quand il est rendu à l'intérieur d'une section déjà titrée en `<h2>` |
| 3 | Libellés des champs de formulaire | `Input`, `Select`, `FormTextarea` (`web/src/components/ui/`) enveloppent systématiquement `<input>`/`<select>`/`<textarea>` dans un `<label htmlFor=...>` avec le texte du libellé | **Conforme** | — |
| 4 | Messages d'erreur associés aux champs | `Input.tsx` affiche l'erreur dans un `<span>` séparé, sans `aria-describedby` reliant l'`<input>` à ce `<span>`, et sans `aria-invalid="true"` sur le champ en erreur. Confirmé par recherche exhaustive : aucune occurrence d'`aria-describedby` ni `aria-invalid` dans `web/src` | **Non conforme** | Ajouter `aria-describedby={errorId}` sur le champ et `aria-invalid` quand `error` est défini |
| 5 | Contrastes | 17 combinaisons texte/fond réellement utilisées vérifiées par calcul du ratio WCAG (formule officielle, valeurs hexadécimales exactes de la palette Tailwind par défaut — `tailwind.config.js` ne redéfinit aucune couleur). 16/17 conformes (≥ 4,5:1, la plus faible à 4,55:1 pour le texte secondaire gris). **1 non conforme** : texte de substitution des champs (`placeholder:text-slate-400` sur fond blanc, classe Tailwind appliquée dans `Input.tsx`), ratio mesuré **2,56:1** contre 4,5:1 requis | **Non conforme** (partiel) | Foncer la couleur des placeholders (ex. `slate-500`, qui atteint 4,76:1) |
| 6 | Navigation au clavier | Deux problèmes concrets relevés. (a) `GarageLayout.tsx` : la navigation principale (`<nav>` avec les 5 liens) est dans un `<aside className="hidden ... lg:block">`, invisible en dessous du point de rupture `lg` ; l'icône `Menu` affichée à la place sur mobile web n'a ni `onClick` ni état, elle est purement décorative (`aria-hidden="true"`) — aucune alternative clavier ou tactile ne permet d'atteindre les liens de navigation sous `lg`. (b) `SimpleModal.tsx` : `role="dialog"` et `aria-modal="true"` sont présents, mais rien ne déplace le focus à l'ouverture, ne le piège à l'intérieur de la modale, ni ne la ferme au clavier (pas de gestionnaire `Escape`) | **Non conforme** | Ajouter un bouton de menu fonctionnel sous `lg` ; ajouter un piège de focus et la fermeture par `Échap` à `SimpleModal` |
| 7 | Visibilité du focus | `Button.tsx` définit `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2` pour les 3 variantes ; `Input`/`Select`/`FormTextarea` définissent `focus:ring-2`. Aucune règle CSS globale ne supprime l'`outline` par défaut (`web/src/styles.css` vérifié intégralement, aucune occurrence de `outline: none`) | **Conforme** | — |
| 8 | Textes alternatifs | Aucune balise `<img>` dans `web/src` (recherche exhaustive). Les icônes `lucide-react` sont systématiquement marquées `aria-hidden="true"` (`GarageLayout.tsx` notamment) et n'apparaissent jamais seules sans texte visible adjacent dans un bouton | **Non applicable** | — |
| 9 | Rôles et attributs ARIA | Usage globalement correct mais incohérent : `role="alert"` présent sur `InlineError.tsx` et `ErrorState.tsx`, **absent** sur `ErrorMessage.tsx` (utilisé par `LoginPage` pour l'échec de connexion — l'erreur de connexion n'est donc pas annoncée par un lecteur d'écran). `SimpleModal.tsx` a `role="dialog"` + `aria-modal="true"` + `aria-labelledby` correctement posés. Plusieurs sections utilisent `aria-label` à bon escient (`AppointmentsPage`, `DashboardPage`, `InterventionsPage`, `NotificationsPage`) | **Non conforme** (partiel) | Ajouter `role="alert"` à `ErrorMessage.tsx` |
| 10 | Gestion des états de chargement | `LoadingState.tsx` affiche un spinner (`aria-hidden="true"`, correct car décoratif) et un texte (« Chargement ») mais sans `role="status"` ni `aria-live="polite"` sur le conteneur : un lecteur d'écran qui n'a pas le focus sur cette zone au moment du rendu n'est pas averti du changement d'état | **Non conforme** | Ajouter `role="status"` (ou `aria-live="polite"`) sur le conteneur de `LoadingState` |

**Décompte web : 3 critères conformes, 6 non conformes (dont 3 partiellement conformes), 1 non
applicable — sur 10 critères retenus.**

---

## Section mobile (React Native / Expo) — mécanismes différents du web

React Native ne produit pas de DOM : il n'y a ni balise `<html>`, ni CSS de contraste au sens
cascade, ni ARIA. L'accessibilité y repose sur l'API `accessibility*` de React Native
(`accessibilityLabel`, `accessibilityRole`, `accessibilityState`, `accessibilityLiveRegion`), lue
par VoiceOver (iOS) et TalkBack (Android). Les mêmes intitulés de critères sont repris ci-dessous
avec leur équivalent mobile, ou marqués non applicables quand le concept HTML n'a pas d'équivalent.

| # | Critère (équivalent mobile) | Constat dans le code | Statut |
|---|---|---|---|
| 1 | Langue de l'application | `mobile/app.json` ne déclare aucune `locale` : l'app suit la langue du système d'exploitation, mécanisme natif Expo qui n'a pas d'équivalent à l'attribut `lang` HTML | **Non applicable** |
| 2 | Structure de navigation par titres | Aucune occurrence d'`accessibilityRole="header"` dans `mobile/src` (recherche exhaustive) alors que des titres visuels existent (`MobileHeader.title`, titres d'écran). Un lecteur d'écran mobile ne peut donc pas naviguer d'un titre à l'autre comme il le ferait avec `<h1>`/`<h2>` sur le web | **Non conforme** |
| 3 | Libellés des champs de formulaire | `AppInput.tsx` pose `accessibilityLabel={label}` explicitement sur le `TextInput`, en plus du `<Text>` visuel affiché au-dessus — c'est le mécanisme correct en React Native (pas d'équivalent à `<label htmlFor>`) | **Conforme** |
| 4 | Messages d'erreur associés aux champs | `AppInput` n'a pas de prop `error` du tout (contrairement à l'`Input` web) ; les erreurs de saisie ne sont affichées qu'au niveau de l'écran entier via `ErrorState`, jamais associées à un champ précis | **Non conforme** |
| 5 | Contrastes | Couleurs centralisées dans `mobile/src/theme/colors.ts`. `text` (#0f172a) et `muted` (#64748b) sur `surface`/`background` (blanc/#f8fafc) atteignent les mêmes ratios que leurs équivalents web (≥ 4,7:1, conformes). Même défaut que le web : `placeholderTextColor="#94a3b8"` codé en dur dans `AppInput.tsx`, ratio 2,56:1 sur fond blanc | **Non conforme** (partiel, même cause que le critère web n°5) |
| 6 | Navigation clavier externe | Application tactile primaire (écran tactile), sans clavier physique dans l'usage normal. `Pressable` reste focusable par un clavier Bluetooth externe via le comportement par défaut de React Native, mais aucun test ni aménagement spécifique n'existe dans le code pour ce cas d'usage secondaire | **Non applicable** |
| 7 | Visibilité du focus | Aucun style `focus`/`focusVisible` défini dans les composants `Pressable` (`AppButton`, `AppSelect`, `FilterChips`) ; React Native ne propose pas d'indicateur de focus visuel par défaut comparable à l'`outline` CSS du web | **Non applicable** (pertinent seulement si un clavier externe est branché, cas non traité) |
| 8 | Textes alternatifs | Aucun composant `<Image>` dans `mobile/src` (recherche exhaustive) : `GarageCover.tsx` simule une vignette d'atelier avec des `<View>`/`<Text>` stylées plutôt qu'une vraie photo | **Non applicable** |
| 9 | Rôles et états d'accessibilité | Bon usage global d'`accessibilityRole="button"` et `accessibilityLabel` sur les boutons icône (`MobileHeader` bouton retour, `NotificationBell`). Deux lacunes concrètes : `AppSelect.tsx` et `FilterChips.tsx` n'exposent pas la sélection courante via `accessibilityState={{ selected }}` (l'état visuel « sélectionné » n'est donc pas restitué par VoiceOver/TalkBack) ; le badge de compteur non lu de `NotificationBell` (`unreadCount`) n'est pas intégré à `accessibilityLabel`, qui reste toujours « Notifications » sans le nombre | **Non conforme** (partiel) |
| 10 | Gestion des états de chargement | `LoadingState.tsx` mobile affiche `ActivityIndicator` + texte, sans `accessibilityLiveRegion` ni appel à `AccessibilityInfo.announceForAccessibility()` : le passage en chargement n'est pas annoncé proactivement par le lecteur d'écran, même limite que le web | **Non conforme** |

**Décompte mobile : 2 critères conformes, 4 non conformes (dont 1 partiellement conforme), 4 non
applicables (dont 1 par absence du concept HTML correspondant, 3 par absence d'usage de clavier
externe/image dans l'usage normal de l'app) — sur 10 critères retenus.**

---

## Synthèse

| | Conforme | Non conforme | Non applicable | Total |
|---|---|---|---|---|
| Web | 3 | 6 | 1 | 10 |
| Mobile | 2 | 4 | 4 | 10 |

Un défaut est commun aux deux plateformes et a la même cause première : le contraste insuffisant du
texte de substitution des champs de saisie (gris clair `#94a3b8` sur fond blanc, 2,56:1), utilisé à
l'identique côté web (classe Tailwind) et côté mobile (`placeholderTextColor` codé en dur). Les
autres non-conformités sont propres à chaque plateforme et n'ont pas de correctif commun.

Aucune correction de code n'a été appliquée dans ce lot, conformément à la demande : ce document est
un état des lieux destiné à servir de preuve pour le dossier RNCP.

---

Branche courante : `feat/rncp-triggers-i18n-export`.
