# Contrat d'API — serveur de synchronisation (optionnel)

Rappel (`AGENTS.md` §1 et §2) : ce serveur Hono n'est **jamais requis** pour utiliser
Norsk Lære. Il n'existe que pour ceux qui veulent retrouver leur progression sur un
second appareil. Tous les endpoints ci-dessous doivent pouvoir être absents/indisponibles
sans que le client cesse de fonctionner (voir `spec/acceptance-criteria.md` § IA / Hors ligne
pour le même principe de dégradation silencieuse).

Implémenté en Phase 5 (`spec/roadmap.md`). Décrit ici en amont pour que le schéma
`packages/shared` (types + zod) soit stable dès la Phase 0.

---

## 1. Conventions générales

- Base URL : `/api/v1`.
- Format : JSON uniquement, `Content-Type: application/json`.
- Auth : cookie de session `HttpOnly` + `Secure` + `SameSite=Lax` (pas de JWT côté client :
  sessions maison, `AGENTS.md` §2 — « Lucia-style sessions maison + Argon2id »).
- Toute entrée validée par les mêmes schémas Zod que le client, exportés depuis
  `packages/shared/api-schemas/*.ts` (source de vérité unique, partagée client/serveur).
- Toutes les dates en ISO 8601 UTC.
- Pas de pagination par défaut sauf mention contraire (`cursor` + `limit`, `limit` max 100).

### Enveloppe de réponse

```ts
type ApiSuccess<T> = { ok: true; data: T };
type ApiError = { ok: false; error: { code: ErrorCode; message: string; fieldErrors?: Record<string, string[]> } };
```

### Codes d'erreur (`ErrorCode`)

| Code | HTTP | Sens |
|---|---|---|
| `unauthenticated` | 401 | pas de session valide |
| `forbidden` | 403 | session valide, action non autorisée |
| `not_found` | 404 | ressource inconnue |
| `validation_error` | 422 | payload invalide (voir `fieldErrors`) |
| `conflict` | 409 | ex. email déjà utilisé |
| `rate_limited` | 429 | |
| `server_error` | 500 | jamais de stack trace exposée |

---

## 2. Auth

### `POST /api/v1/auth/register`
Body : `{ email: string; password: string; displayName: string }`.
201 → `{ user: PublicUser }` + cookie de session posé.
Erreurs : `validation_error`, `conflict` (email déjà pris).

### `POST /api/v1/auth/login`
Body : `{ email: string; password: string }`.
200 → `{ user: PublicUser }` + cookie de session.
Erreurs : `validation_error`, `unauthenticated` (identifiants invalides — message générique,
ne jamais préciser si c'est l'email ou le mot de passe qui est faux).

### `POST /api/v1/auth/logout`
200 → `{}`. Invalide la session serveur, supprime le cookie.

### `GET /api/v1/auth/me`
200 → `{ user: PublicUser | null }`. Ne renvoie jamais 401 : `null` si non connecté,
pour permettre au client de sonder sans gérer un cas d'erreur.

### `POST /api/v1/auth/guest-upgrade`
Transforme un compte local (invité) en compte complet. Body : `{ email, password, displayName }`.
200 → `{ user: PublicUser }`. Réutilisé par le flux « migration compte invité → compte complet »
de la Phase 5.

```ts
type PublicUser = { id: string; email: string; displayName: string; avatarId: string | null; createdAt: string };
```

---

## 3. Synchronisation

Le client est la source de vérité hors ligne ; le serveur ne fait qu'accumuler et
rejouer des opérations. Voir `spec/data-model.md` §4 (`sync_queue`) pour le format local.

### `POST /api/v1/sync/push`
Envoie les opérations en attente depuis `sync_queue`.

Body :
```ts
{
  operations: Array<{
    id: string;              // id local de sync_queue, renvoyé pour accusé de réception
    tableName: SyncableTable;
    recordId: string;
    operation: 'insert' | 'update' | 'delete';
    payload: Record<string, unknown>;
    updatedAt: string;
  }>;
}
```
200 →
```ts
{
  accepted: string[];   // ids d'opérations acceptées, à purger de sync_queue local
  rejected: Array<{ id: string; reason: string }>;
  conflicts: Array<{ recordId: string; tableName: SyncableTable; resolved: Record<string, unknown> }>;
}
```

Résolution de conflit : identique à `data-model.md` §4 — dernière écriture gagne par champ
via `updated_at`, sauf `user_vocabulary` où l'état SRS le plus avancé (`review_count` max)
l'emporte. Le serveur renvoie toujours l'état résolu dans `conflicts` pour que le client
réécrive sa base locale sans divergence silencieuse.

`SyncableTable` = `'user_lesson_progress' | 'user_vocabulary' | 'user_errors' | 'user_stats' | 'user_streaks' | 'user_passport_stamps' | 'user_achievements' | 'user_settings' | 'user_profiles'`.
Les tables de contenu (`levels`, `lessons`, `vocabulary`…) ne sont jamais poussées par
le client : elles sont en lecture seule côté utilisateur (voir §4 Contenu).

### `GET /api/v1/sync/pull?since={ISO8601}`
200 → `{ operations: SyncOperation[]; serverTime: string }`.
Le client rejoue ces opérations localement puis stocke `serverTime` comme prochain `since`.

---

## 4. Contenu (mises à jour incrémentales)

Le contenu de base est livré avec l'app (build). Ce endpoint sert uniquement aux
mises à jour post-installation (nouveaux niveaux, corrections de contenu).

### `GET /api/v1/content/manifest`
200 → `{ version: string; packages: Array<{ id: string; level: CefrLevel; sizeBytes: number; checksumSha256: string; url: string }> }`.

### `GET /api/v1/content/packages/:id`
Téléchargement direct du pack (`content.sqlite` partiel ou fichiers audio additionnels).
Réponse binaire, jamais bloquante pour l'usage de l'app (téléchargement en tâche de fond,
voir `spec/roadmap.md` Phase 7 — « Téléchargement de packs de contenu hors ligne »).

---

## 5. IA distante (fallback uniquement)

Utilisé seulement quand le LLM local (Ollama) est indisponible — voir `AGENTS.md` §6
(sélecteur local → distant → dégradé silencieux) et `spec/lesson-engine.md` §4.

### `POST /api/v1/ai/explain`
Body : `{ errorType: ErrorType; grammarRuleId?: string; userAnswer: string; expected: string; cefrLevel: CefrLevel }`.
200 → `{ explanationFr: string; frenchPitfall?: string }`.
Doit répondre en < 2 s ; au-delà, le client bascule sur le message générique
(`spec/lesson-engine.md` §4, étape 5).

### `POST /api/v1/ai/conversation/turn`
Body : `{ conversationId: string; scenarioTag: string; cefrLevel: CefrLevel; userMessageNb: string }`.
200 → `{ replyNb: string; replyFr: string; corrections: Array<{ original: string; corrected: string; explanationFr: string }> }`.

Aucun de ces deux endpoints ne stocke le contenu vocal brut : le texte de la conversation
est persisté par le client dans `ai_conversations`/`ai_messages` (`data-model.md` §3),
jamais côté serveur (principe local-first, `AGENTS.md` §1).

---

## 6. RGPD

### `GET /api/v1/account/export`
200 → export JSON complet de toutes les tables de l'utilisateur (`data-model.md` §3),
téléchargement direct. Doit rester utilisable même si le compte n'est pas synchronisé
(dans ce cas, exécuté localement, ce endpoint n'est pas appelé).

### `DELETE /api/v1/account`
Supprime le compte et toutes les données serveur associées sous 30 jours
(y compris sauvegardes), conformément à `spec/acceptance-criteria.md` § Vie privée.
202 → `{ scheduledPurgeAt: string }`.

---

## 7. Ce qui n'est jamais dans l'API

Conformément au principe local-first strict (`AGENTS.md` §1) :
- pas de endpoint de progression « maître » — le serveur ne calcule jamais l'XP,
  le SRS ou le déblocage de leçons, il ne fait que stocker/rejouer ce que le client
  a déjà calculé localement ;
- pas de endpoint qui bloque une fonctionnalité cœur (leçon, révision, dictionnaire,
  audio) en cas d'indisponibilité serveur.
