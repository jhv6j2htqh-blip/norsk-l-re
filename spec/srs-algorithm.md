# Algorithme de révision espacée

Implémentation de **FSRS-5** (open source, MIT). Pas de SM-2.
Package : `ts-fsrs`. Si indisponible, réimplémenter selon la spec publique.

---

## 1. Modèle

Chaque `user_vocabulary` porte :
- `stability` (S) — jours avant que la rétention tombe à 90 %
- `difficulty` (D) — 1 à 10
- `state` — `new` → `learning` → `review` (⇄ `relearning`)
- `due_at`

Rétention cible par défaut : **0,90**. Réglable 0,80–0,95 dans les paramètres.

---

## 2. Notes

Quatre notes après une révision :

| Note | Valeur | Déclencheur |
|---|---|---|
| Again | 1 | réponse fausse |
| Hard | 2 | correcte mais > 8 s, ou score partiel |
| Good | 3 | correcte, temps normal |
| Easy | 4 | correcte, < 3 s |

Le mapping temps→note est calculé par `mapAnswerToRating(result, elapsedMs)`
dans `packages/shared/srs/rating.ts`. Testable, pur.

---

## 3. Intervalles d'apprentissage

- `learning` : 1 min → 10 min → 1 j
- `relearning` : 10 min → 1 j
- `review` : intervalle FSRS

Plafond : 365 jours. Plancher : 1 jour en `review`.

---

## 4. Sélection des cartes de la session

Une session de révision mélange, dans cet ordre de priorité :

1. **Cartes en retard** (`due_at < now`), les plus en retard d'abord — plafonné à 60 %
2. **Erreurs récentes** issues de `user_errors` non résolues (< 7 j) — 20 %
3. **Cartes dues aujourd'hui** — le reste
4. **Cartes neuves** — max 15/jour par défaut, réglable

Taille de session = `daily_minutes × 4` cartes environ (≈ 15 s/carte).

---

## 5. Charge quotidienne

L'app ne doit **jamais** afficher 400 cartes dues. Si le retard dépasse
`daily_minutes × 6`, activer le mode rattrapage :
- limiter la session au quota
- répartir le retard sur 7 jours
- proposer un message rassurant, pas d'alerte anxiogène

---

## 6. Types de révision

Une carte n'est pas toujours révisée dans le même sens :

| Cycle | Format |
|---|---|
| 1 | reconnaissance : NB → FR (QCM) |
| 2 | rappel : FR → NB (saisie) |
| 3 | audio : écouter → écrire |
| 4+ | alterné aléatoirement, + contexte (phrase à trou) |

Le format est dérivé de `review_count`, pas stocké.

---

## 7. Grammaire dans le SRS

Les règles de grammaire entrent aussi dans le SRS, via une table jumelle
`user_grammar_progress` (mêmes colonnes FSRS). Elles sont révisées sous forme
d'exercices `fill_blank`, `conjugate` ou `word_order` tirés de `grammar_rules.examples`.

---

## 8. Enfouissement (burying)

Deux cartes du même `vocabulary.id` ou de la même famille lexicale
(même lemme) ne sont pas présentées dans la même session.

---

## 9. Tests exigés

- `mapAnswerToRating` : table de vérité complète
- planification : 100 révisions simulées, vérifier que `due_at` croît de façon monotone pour des `Good` répétés
- mode rattrapage : 1000 cartes en retard → session ≤ quota
- déterminisme : mêmes entrées → mêmes sorties (seed fixe)
