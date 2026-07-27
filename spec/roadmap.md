# Roadmap et ordre de construction

Chaque phase est une **tranche verticale livrable**. On ne passe à la suivante
que si la précédente satisfait sa définition de « terminé ».

---

## Phase 0 — Fondations (1 semaine)

- [ ] Monorepo pnpm + workspaces, tsconfig strict partagé
- [ ] ESLint 9 flat + Prettier + hook pre-commit
- [ ] Vite + React 19 + Tailwind 4 + shadcn/ui
- [ ] Tokens du design system en CSS variables
- [ ] Schéma Drizzle + migrations SQLite locales
- [ ] Couche d'abstraction DB (web `wa-sqlite`/OPFS ↔ natif Capacitor)
- [ ] CI GitHub Actions : typecheck, lint, test, build

**Livrable** : app vide qui démarre, lit et écrit en SQLite sur web et Android.

---

## Phase 1 — Squelette jouable (2 semaines)

- [ ] Navigation et layout (onglets mobile / sidebar desktop)
- [ ] Onboarding : persona, objectif, temps disponible
- [ ] Compte local sans serveur (mode invité)
- [ ] `curriculum` : arbre A1, déblocage séquentiel
- [ ] Moteur de leçon (machine à états, testée)
- [ ] 4 types d'exercices : `multiple_choice`, `translate_to_nb`, `fill_blank`, `match_pairs`
- [ ] Contenu : **5 leçons A1 réelles**, écrites au niveau de qualité final
- [ ] XP et progression persistés

**Livrable** : on peut faire 5 leçons de bout en bout, hors ligne.

---

## Phase 2 — Le différenciant (2 semaines)

- [ ] Bouton « Pourquoi ? » complet, avec chaîne de fallback
- [ ] Table `user_errors` alimentée à chaque faute
- [ ] `frContrast` affiché dans chaque explication
- [ ] SRS FSRS-5 + écran de révision
- [ ] Révisions ciblées sur les erreurs passées
- [ ] Flashcards
- [ ] TTS : Piper local, fallback Web Speech
- [ ] 8 types d'exercices restants

**Livrable** : la boucle pédagogique complète — apprendre, se tromper, comprendre, réviser.

---

## Phase 3 — Voix et IA (2 semaines)

- [ ] STT whisper.cpp local + fallback
- [ ] Scoring de prononciation, retours par mot
- [ ] Tuteur IA : conversation par scénario
- [ ] Correction d'écrit libre (`free_writing`)
- [ ] Sélecteur de service local/distant avec dégradation silencieuse
- [ ] Cache des réponses IA

**Livrable** : on peut parler et écrire au tuteur, avec ou sans réseau.

---

## Phase 4 — Motivation et culture (1,5 semaine)

- [ ] Séries, gel de série, rappels
- [ ] **Passeport Norvège** — 14 tampons, écran dédié
- [ ] Succès et statistiques
- [ ] Fil d'immersion quotidien (`cultural_items`, `dateRelevant`)
- [ ] Carte interactive des régions
- [ ] Dictionnaire + conjugaison + déclinaison, recherche FTS5

**Livrable** : l'app donne envie de revenir chaque jour.

---

## Phase 5 — Comptes et synchronisation (1,5 semaine)

- [ ] Serveur Hono + PostgreSQL
- [ ] Auth sessions + Argon2id
- [ ] `sync_queue`, push/pull, résolution de conflits
- [ ] Migration compte invité → compte complet
- [ ] Export et suppression RGPD
- [ ] Mises à jour de contenu incrémentales

**Livrable** : progression conservée entre téléphone et ordinateur.

---

## Phase 6 — Contenu A1 complet (continu, en parallèle dès la phase 2)

- [ ] 60 leçons A1
- [ ] 600 mots avec audio, IPA, flexions
- [ ] 40 règles de grammaire avec `frContrast`
- [ ] 20 dialogues de situations réelles
- [ ] Validation automatique du contenu en CI

**Livrable** : un parcours A1 qui tient la comparaison avec Babbel.

---

## Phase 7 — Distribution (1 semaine)

- [ ] Builds Capacitor : Android, iOS, Windows, macOS, Linux
- [ ] PWA installable
- [ ] Téléchargement de packs de contenu hors ligne
- [ ] Sentry auto-hébergé ou équivalent gratuit
- [ ] Fiches store, captures, politique de confidentialité

---

## Après le MVP

A2 → B1 → B2 → C1 → C2, un niveau à la fois.
Puis : communauté, certifications internes, outils enseignants, mode « Une journée en Norvège »,
préparation aux dialectes (B1+), réalité augmentée (exploratoire).

---

## Ce qu'on ne fait PAS dans le MVP

Explicitement hors périmètre, pour éviter la dispersion :
multijoueur, classements sociaux, réalité augmentée, autres langues que le Bokmål,
version enseignant, monétisation, Nynorsk.
