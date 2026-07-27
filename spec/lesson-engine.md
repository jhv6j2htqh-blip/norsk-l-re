# Moteur de leçon et types d'exercices

## 1. Machine à états d'une leçon

```
idle → loading → running ⇄ paused → completing → completed
                    ↓
                 abandoned
```

Le moteur est une **fonction pure** (`packages/shared/lesson-machine.ts`) testable
sans React. L'UI ne fait que rendre l'état courant et dispatcher des événements.

```ts
type LessonState = {
  status: 'idle' | 'loading' | 'running' | 'paused' | 'completing' | 'completed' | 'abandoned';
  lessonId: string;
  blocks: LessonBlock[];
  currentIndex: number;
  answers: Record<string, AnswerRecord>;
  hearts: number;          // 5, illimité si mode « sans pression »
  xpEarned: number;
  startedAt: number;
  elapsedMs: number;
};

type LessonEvent =
  | { type: 'LOAD'; lessonId: string }
  | { type: 'ANSWER'; blockId: string; value: unknown }
  | { type: 'NEXT' }
  | { type: 'SKIP' }
  | { type: 'ASK_WHY'; blockId: string }
  | { type: 'PAUSE' } | { type: 'RESUME' }
  | { type: 'ABANDON' };
```

**Persistance** : l'état est écrit en SQLite après chaque `ANSWER`.
Fermeture brutale de l'app → reprise exacte à la relance.

---

## 2. Séquence de blocs

Ordre canonique d'une leçon (blocs optionnels marqués ○) :

1. `intro` — mise en situation, 1 phrase + illustration
2. `objectives` — 2 à 4 objectifs mesurables
3. `explanation` — règle expliquée, **avec contraste français systématique**
4. `example` ×3 — audio + texte NB + traduction FR
5. `exercise` ×N — voir §3, N selon durée (5 min → 6 · 10 min → 12 · 20 min → 24)
6. `dialogue` ○ — conversation contextuelle
7. `pronunciation` ○ — enregistrement + scoring
8. `quiz` — 5 questions de validation
9. `summary` — récapitulatif + vocabulaire introduit
10. attribution XP + injection du nouveau vocabulaire dans le SRS

---

## 3. Les 12 types d'exercices

Chaque type implémente la même interface :

```ts
interface ExerciseType<TPayload, TAnswer> {
  id: string;
  render(payload: TPayload, onAnswer: (a: TAnswer) => void): ReactNode;
  validate(payload: TPayload, answer: TAnswer): ValidationResult;
  xpValue: number;
  supportsAudio: boolean;
  cefrRange: [CefrLevel, CefrLevel];
}

type ValidationResult = {
  correct: boolean;
  partialScore: number;          // 0-1
  errorType?: ErrorType;
  expected: string;
  explanationFr: string;         // toujours rempli, même si correct
  frenchPitfall?: string;
};
```

| # | Type | Payload | Niveaux |
|---|---|---|---|
| 1 | `multiple_choice` | `{question, options[], correctIndex, audioPath?}` | A1–C2 |
| 2 | `translate_to_nb` | `{fr, acceptedNb[], hints[]}` | A1–C2 |
| 3 | `translate_to_fr` | `{nb, acceptedFr[], audioPath}` | A1–C2 |
| 4 | `fill_blank` | `{sentenceNb, blanks[], options?}` | A1–C2 |
| 5 | `word_order` | `{tokens[], correctOrder[]}` | A1–B2 |
| 6 | `listen_and_type` | `{audioPath, expectedNb, tolerance}` | A1–C2 |
| 7 | `speak` | `{expectedNb, ipa, minScore}` | A1–C2 |
| 8 | `match_pairs` | `{pairs: [nb, fr][]}` | A1–B1 |
| 9 | `conjugate` | `{verb, tense, person, expected}` | A1–C1 |
| 10 | `decline_noun` | `{noun, form: 'indef_sg'\|'def_sg'\|'indef_pl'\|'def_pl', expected}` | A1–B2 |
| 11 | `dialogue_response` | `{context, previousTurns[], acceptedResponses[]}` | A2–C2 |
| 12 | `free_writing` | `{prompt, minWords, criteria[]}` — corrigé par l'IA | B1–C2 |

### Règles de validation

- Insensible à la casse et aux espaces multiples.
- Ponctuation finale ignorée.
- **`å` / `aa`, `ø` / `oe`, `æ` / `ae`** acceptés en saisie clavier.
- Distance de Levenshtein ≤ 1 sur un mot > 5 lettres → « presque ! », score partiel 0,5,
  pas de perte de cœur.
- Toute réponse fausse crée une ligne dans `user_errors`.

---

## 4. Le bouton « Pourquoi ? »

Présent sur **chaque** correction, réussie ou non.

Ordre de résolution :
1. `explanationFr` pré-écrite dans le contenu (instantané, offline)
2. si absente → règle de grammaire liée (`grammar_rules.explanation_fr`)
3. si insuffisant → LLM local avec le contexte de l'erreur
4. si indisponible → API `/ai/explain`
5. si tout échoue → message générique + lien vers la fiche grammaire

La réponse est mise en cache par `(errorType, ruleId, level)`.

---

## 5. Cœurs et pression

Trois modes, réglables dans les paramètres :
- `classic` : 5 cœurs, régénération 1/30 min
- `relaxed` : cœurs illimités, exercice raté rejoué en fin de leçon
- `challenge` : 3 cœurs, chronomètre

`relaxed` est le **défaut** — cohérent avec la valeur « expliquer plutôt que punir ».

---

## 6. Calcul du XP

```
xp_leçon = Σ(xp exercices) × multiplicateur_score × bonus_série
multiplicateur_score = 0.5 + (score/100) × 0.5      // 0.5 → 1.0
bonus_série = 1 + min(streak, 30) × 0.01            // max +30 %
```

Première réussite d'un exercice : XP plein. Rejeu : 25 %.

---

## 7. Fin de leçon

À `completed`, en une transaction SQLite :
1. écrire `user_lesson_progress`
2. insérer le vocabulaire nouveau dans `user_vocabulary` (state `new`)
3. incrémenter `user_stats` du jour
4. mettre à jour `user_streaks`
5. évaluer les tampons de Passeport et les succès
6. empiler les opérations dans `sync_queue`
7. déverrouiller les leçons suivantes

Si l'étape 1 échoue, tout est annulé.
