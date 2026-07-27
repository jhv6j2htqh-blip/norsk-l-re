# AGENTS.md — Norsk Lære

> Fichier lu en premier par l'agent de code. Contient les règles non négociables.
> Le PRD (`PRD_Norsk_Laere.docx`) décrit le **pourquoi** et le **quoi**.
> Ce dossier `spec/` décrit le **comment**. En cas de contradiction, `spec/` gagne.
> Voir aussi `spec/audio-strategy.md` pour le détail de la stratégie de voix.

---

## 1. Contexte projet

Application d'apprentissage du **norvégien Bokmål pour francophones**, couvrant A1→C2.
Offline-first, gratuite, sans publicité, sans achat intégré.
Multi-plateforme : Web, Android, iOS, Windows, macOS, Linux.

Devise : « Apprendre le norvégien. Comprendre la Norvège. Y vivre avec confiance. »

**Principe local-first strict** : l'application doit être 100 % utilisable sans aucun
serveur distant — leçons, révisions, dictionnaire, IA, audio, tout tourne sur l'appareil.
Le serveur (§ backend ci-dessous) n'est qu'un **bonus optionnel** pour ceux qui veulent
retrouver leur progression sur un deuxième appareil. Personne ne doit jamais être bloqué
par une absence de connexion ou de serveur.

---

## 2. Stack technique — FIGÉE

N'introduis aucune dépendance hors de cette liste sans demander.

| Couche | Choix | Version | Raison |
|---|---|---|---|
| Langage | TypeScript | 5.5+ | strict mode obligatoire |
| Runtime | Node.js | 22 LTS | |
| Frontend | React | 19 | |
| Meta-framework | Vite + React Router | 6 / 7 | pas de Next.js : besoin d'un build statique offline |
| Mobile/Desktop | Capacitor | 7 | une seule base de code pour les 6 plateformes |
| UI | Tailwind CSS + shadcn/ui | 4 / latest | |
| State serveur | TanStack Query | 5 | |
| State client | Zustand | 5 | |
| DB locale | SQLite via `@capacitor-community/sqlite` (natif) / `wa-sqlite` (web, OPFS) | | offline-first |
| ORM | Drizzle ORM | latest | même schéma local et serveur |
| Backend (optionnel) | Hono | 4 | **non requis pour utiliser l'app** — sert uniquement si l'utilisateur veut synchroniser entre plusieurs appareils |
| DB serveur (optionnel) | SQLite (fichier unique) plutôt que Postgres | | auto-hébergeable en un seul binaire, sans base de données à administrer |
| Auth | Lucia-style sessions maison + Argon2id | | pas de SaaS payant |
| Audio des leçons | **Voix IA très réalistes, générées à l'avance** (Azure AI Speech, voix `nb-NO`) puis livrées en fichiers audio fixes | | réalisme maximal sans coût récurrent ni connexion requise — détails : `spec/audio-strategy.md` |
| TTS dynamique (secours) | Piper (norvégien, local), pour le texte imprévisible (dictionnaire, tuteur IA) uniquement | | gratuit, offline, moins réaliste mais suffisant pour un usage ponctuel |
| STT | whisper.cpp (`ggml-small`) local → fallback Web Speech API | | gratuit, offline, tout sur l'appareil |
| LLM | Ollama local (Qwen2.5 7B), tourne sur l'appareil/ordinateur de l'utilisateur | | tout en local, pas de serveur cloud nécessaire |
| Tests | Vitest + Playwright | | |
| Lint | ESLint 9 (flat) + Prettier | | |

**Interdits** : `any` non justifié par un commentaire, `moment.js`, `axios` (utiliser `fetch`),
CSS-in-JS runtime, `localStorage` pour des données métier (→ SQLite).

---

## 3. Arborescence imposée

```
norsk-laere/
├─ apps/
│  ├─ client/                 # React + Vite + Capacitor
│  │  ├─ src/
│  │  │  ├─ app/              # routes, providers, layout
│  │  │  ├─ features/         # 1 dossier par domaine métier (voir §4)
│  │  │  ├─ shared/
│  │  │  │  ├─ ui/            # composants shadcn + design system
│  │  │  │  ├─ hooks/
│  │  │  │  ├─ lib/           # utils purs, testables
│  │  │  │  └─ types/
│  │  │  ├─ db/               # schéma Drizzle local, migrations, requêtes
│  │  │  └─ services/         # tts, stt, llm, sync — via interfaces (§6)
│  │  └─ capacitor.config.ts
│  └─ server/                 # Hono
│     └─ src/{routes,services,db,middleware}/
├─ packages/
│  ├─ shared/                 # types + zod schemas partagés client/serveur
│  ├─ content/                # contenu pédagogique JSON (§5)
│  └─ config/                 # eslint, tsconfig, tailwind partagés
└─ spec/                      # CE DOSSIER — source de vérité
```

Règle : **une feature ne peut pas importer depuis une autre feature**.
Le partage passe par `shared/` ou `packages/shared`.

---

## 4. Domaines métier (features)

Ordre = ordre de construction recommandé.

1. `auth` — inscription, connexion, session, profil
2. `onboarding` — persona, objectif, temps disponible, test de niveau
3. `curriculum` — parcours CECRL, chapitres, leçons, déblocage
4. `lesson` — moteur d'exécution d'une leçon (§ spec/lesson-engine.md)
5. `exercise` — 12 types d'exercices (§ spec/exercise-types.md)
6. `srs` — révision espacée FSRS (§ spec/srs-algorithm.md)
7. `flashcards`
8. `dictionary` — recherche, conjugaison, déclinaison
9. `pronunciation` — STT + scoring phonétique
10. `ai-tutor` — conversation, correction, bouton « Pourquoi ? »
11. `gamification` — XP, séries, Passeport Norvège
12. `stats`
13. `culture` — immersion quotidienne, carte régions
14. `sync` — synchronisation offline↔serveur
15. `settings`

---

## 5. Contenu pédagogique

Le contenu **n'est jamais codé en dur dans les composants**.
Il vit dans `packages/content/` sous forme de JSON validé par Zod
(schémas : `spec/content-schema.md`).

Un import au build génère la base SQLite pré-remplie livrée avec l'app.

---

## 6. Services externes — toujours derrière une interface

TTS, STT, LLM, sync : chaque service expose une interface TypeScript et
au moins deux implémentations (locale + distante) sélectionnées à l'exécution.

```ts
// services/tts/types.ts
export interface TtsService {
  isAvailable(): Promise<boolean>;
  speak(text: string, opts?: TtsOptions): Promise<void>;
  synthesize(text: string): Promise<ArrayBuffer>;
}
```

Le sélecteur essaie local → distant → dégradé silencieux. **L'app ne doit jamais
planter parce qu'un service IA est indisponible.**

---

## 7. Règles de code

- TypeScript `strict: true`, `noUncheckedIndexedAccess: true`.
- Toute entrée externe (API, fichier, formulaire) validée par Zod au bord.
- Composants React : fonctionnels, < 200 lignes. Au-delà, extraire.
- Pas de `useEffect` pour du data fetching → TanStack Query.
- Nommage : `PascalCase` composants, `camelCase` fonctions, `SCREAMING_SNAKE` constantes,
  fichiers en `kebab-case.ts`.
- Chaque fonction exportée non triviale a un test Vitest.
- Commits : Conventional Commits (`feat:`, `fix:`, `chore:`…).
- Textes UI : jamais en dur → `packages/shared/i18n` (FR par défaut, NB prévu).

---

## 8. Accessibilité et design

- WCAG 2.2 AA minimum. Contraste ≥ 4.5:1.
- Navigation clavier complète, focus visible.
- `prefers-reduced-motion` respecté.
- Design tokens : `spec/design-system.md`. Esthétique scandinave : sobre, chaleureuse,
  intemporelle. Pas de couleurs saturées façon jeu enfantin.

---

## 9. Définition de « terminé »

Une tâche n'est finie que si :
- [ ] le code compile sans erreur ni warning TS
- [ ] ESLint passe
- [ ] les tests passent
- [ ] la fonctionnalité marche **hors ligne**
- [ ] les états `loading`, `empty`, `error` sont gérés
- [ ] navigable au clavier
- [ ] aucun texte codé en dur
- [ ] les critères d'acceptation de `spec/acceptance-criteria.md` sont vérifiés

---

## 10. Protocole de travail de l'agent

1. Lire `spec/` avant d'écrire du code.
2. Si une info manque, **poser la question** plutôt que d'inventer.
3. Travailler par tranches verticales : une feature complète et fonctionnelle
   plutôt que dix squelettes.
4. Après chaque tranche : mettre à jour `spec/progress.md`.
5. Ne jamais refactorer massivement sans y être invité.
