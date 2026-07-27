# Journal d'avancement

> L'agent met ce fichier à jour après chaque tranche de travail terminée.
> Format : une ligne par tranche, la plus récente en haut.

## Phase courante
**Phase 0 — Fondations : terminée.** Prochaine étape : Phase 1 (squelette jouable).

## Prochaine action
Phase 1 — spec/roadmap.md : navigation/layout, onboarding, compte local invité,
`curriculum` (arbre A1), moteur de leçon, 4 premiers types d'exercices,
5 leçons A1 réelles, XP persisté.

---

## Historique

| Date | Phase | Tranche livrée | Notes / décisions |
|---|---|---|---|
| 2026-07-26 | Phase 0 | Monorepo pnpm (`apps/client`, `apps/server`, `packages/{shared,content,config}`), tsconfig strict partagé, ESLint 9 flat + Prettier + hook pre-commit maison, Vite 7 + React 19 + Tailwind 4 + shadcn/ui (tokens design-system.md câblés, `Button` de référence), Capacitor 7 (config, pas encore de plateforme native ajoutée), schéma Drizzle complet (21 tables de data-model.md) + migrations SQLite (index partiels), couche d'abstraction DB (web `wa-sqlite`/OPFS via Worker dédié ↔ natif `@capacitor-community/sqlite`), CI GitHub Actions (typecheck/lint/format/test/build/e2e). Livrable vérifié en Playwright/Chromium réel : l'app démarre, écrit et relit un utilisateur en SQLite via OPFS, et la donnée persiste après rechargement. | Voir ADR 8-9 ci-dessous pour les deux découvertes techniques (FTS5, `apps/server` minimal). `spec/api-contract.md` créé (absent du dossier `spec/` livré initialement, référencé par AGENTS.md/README.md). |
| — | — | *(rien avant)* | — |

---

## Décisions d'architecture (ADR légers)

| # | Décision | Raison | Date |
|---|---|---|---|
| 1 | Vite plutôt que Next.js | build statique nécessaire pour Capacitor et l'offline complet | — |
| 2 | FSRS-5 plutôt que SM-2 | meilleure rétention mesurée, implémentation open source disponible | — |
| 3 | Sérif pour le norvégien | distinction visuelle immédiate FR/NB, choix pédagogique | — |
| 4 | Mode `relaxed` par défaut | cohérent avec « expliquer plutôt que punir » | — |
| 5 | Contenu pédagogique original : tous droits réservés (par défaut, révisable) | Le contenu original (leçons, exercices, dialogues) reste propriétaire tant qu'aucune décision d'ouverture n'est prise ; le PRD (ch. 36.13) envisage une ouverture open source progressive plus tard, mais « commencer fermé pour construire » est l'option par défaut la plus sûre. Le contenu externe authentique (NRK, dictionnaires, etc.) n'est jamais hébergé ni republié : uniquement référencé/lié, dans le respect de sa propre licence (PRD ch. 22.16) | 2026-07-26 |
| 6 | Pas de logo pour l'instant → placeholder typographique | Aucun logo fourni. Utilisation du nom « Norsk Lære » en `--font-nb` comme identité provisoire, remplaçable sans impact technique (juste un asset). Nom de domaine non requis pour le développement (app offline-first) | 2026-07-26 |
| 7 | Génération audio Azure reportée à la Phase 6 | Le budget n'est pas encore validé ; ni la Phase 0 ni la Phase 1 ne nécessitent d'audio de production (voir `audio-strategy.md` : l'audio des leçons est un fichier déjà là, généré séparément). En développement, `audioPath` reste nullable / non renseigné jusqu'à validation du budget | 2026-07-26 |
| 8 | Table FTS5 `vocabulary_fts` retirée de la migration 0001, reportée à la Phase 4 | Découverte en testant le driver web en conditions réelles (Playwright/Chromium) : le binaire WASM officiel de `wa-sqlite@1.0.0` (`dist/wa-sqlite.wasm` et `dist/wa-sqlite-async.wasm`) ne compile pas l'extension FTS5 (vérifié par recherche de chaîne dans les deux binaires — zéro occurrence de "fts5"). Créer la table cassait le démarrage de l'app sur le driver web (`SQLITE_ERROR: no such module: fts5`). Le dictionnaire (seule fonctionnalité qui a besoin de cette table) n'arrive qu'en Phase 4 : décision reportée plutôt que contournée maintenant. Les deux index partiels de `data-model.md` §5 sont conservés dans la migration. Voir question ouverte ci-dessous | 2026-07-26 |
| 9 | `apps/server` réduit à un squelette Hono minimal (une route `/health`) | La Phase 0 ne demande que l'existence du workspace `apps/server` dans l'arborescence ; les vraies routes (auth, sync…) sont un chantier de Phase 5 (`spec/roadmap.md`) et sont déjà spécifiées dans `spec/api-contract.md`. Construire l'auth/sync maintenant aurait anticipé un besoin qui n'existe pas encore | 2026-07-26 |

---

## Questions ouvertes pour le porteur du projet

- [x] Hébergement serveur : **tout en local**, aucun serveur cloud requis (décidé).
- [x] Audio : **voix IA très réalistes générées à l'avance** (Azure AI Speech),
      livrées en fichiers fixes ; Piper local en secours pour le contenu imprévisible
      (décidé — voir `spec/audio-strategy.md`).
- [x] Licence du contenu pédagogique : **tous droits réservés par défaut**, ouverture
      open source progressive envisageable plus tard (décision provisoire, voir ADR 5).
- [x] Nom de domaine et identité visuelle (logo) : **aucun logo pour l'instant**,
      placeholder typographique en attendant (voir ADR 6). Le nom de domaine n'est
      pas nécessaire tant que l'app n'est pas distribuée publiquement (Phase 7+) —
      **reste une vraie question à trancher avant le lancement public**.
- [x] Budget Azure : **reporté à la Phase 6** (génération de contenu), non bloquant
      pour les phases 0 à 5 (voir ADR 7). Le montant réel restera à estimer une fois
      le volume de phrases A1 finalisé.
- [ ] **Recherche FTS5 sur le driver web (Phase 4)** : `wa-sqlite@1.0.0` n'a pas
      FTS5 dans son binaire WASM officiel (voir ADR 8). À trancher avant la Phase 4
      (dictionnaire) entre trois options : (a) recompiler `wa-sqlite` depuis les
      sources avec `SQLITE_ENABLE_FTS5` (nécessite Emscripten, plus lourd à maintenir) ;
      (b) remplacer `wa-sqlite` par une autre lib WASM (ex. `@sqlite.org/sqlite-wasm`,
      à vérifier si FTS5 y est inclus) uniquement pour le driver web ; (c) recherche
      `LIKE`/index classique en repli sur le web, FTS5 réservé au natif (Capacitor).
      Aucune option n'est actionnable avant la Phase 4, donc non bloquant aujourd'hui.
- [ ] **Vérification native (Android/iOS) non faite** : cet environnement ne dispose
      d'aucun SDK Android/Xcode ni émulateur. Le driver `@capacitor-community/sqlite`
      a été écrit contre l'API documentée du plugin et compile, mais n'a pu être
      exécuté sur un vrai appareil/émulateur. À vérifier dès qu'un environnement avec
      SDK Android est disponible (au plus tard Phase 7 — Distribution).
