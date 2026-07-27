# Schéma du contenu pédagogique

Le contenu vit dans `packages/content/`, versionné en Git, validé par Zod au build.
Un script `pnpm content:build` valide, puis génère `content.sqlite` embarqué dans l'app.

```
packages/content/
├─ levels/a1.json … c2.json
├─ chapters/a1/01-salutations.json …
├─ lessons/a1/c01/l01.json …
├─ vocabulary/a1.json … c2.json
├─ grammar/a1.json … c2.json
├─ dialogues/
├─ culture/
└─ audio/            # .mp3, nommés <id>.mp3
```

---

## 1. Vocabulaire

```jsonc
{
  "id": "vocab-hus",
  "nb": "hus",
  "fr": "maison",
  "frAlternatives": ["habitation"],
  "pos": "noun",
  "gender": "et",
  "inflections": {
    "indefSg": "hus", "defSg": "huset",
    "indefPl": "hus", "defPl": "husene"
  },
  "ipa": "/hʉːs/",
  "audioPath": "audio/vocab-hus.mp3",
  "exampleNb": "Jeg bor i et stort hus.",
  "exampleFr": "J'habite dans une grande maison.",
  "cefrLevel": "A1",
  "frequencyRank": 312,
  "tags": ["logement", "quotidien"],
  "frPitfall": "Le pluriel indéfini est identique au singulier — pas de -er, contrairement au réflexe français."
}
```

> **Note audio** : `audioPath` pointe vers un fichier `.mp3` généré une seule fois,
> à l'avance, avec une voix IA réaliste (voir `spec/audio-strategy.md`). Ce n'est
> jamais une synthèse vocale calculée au moment où l'utilisateur écoute.

### Flexions par nature

- **noun** : `indefSg`, `defSg`, `indefPl`, `defPl`
- **verb** : `infinitive`, `present`, `past`, `perfect`, `imperative`
- **adj** : `positive`, `neuter`, `plural`, `comparative`, `superlative`
- autres : `inflections: null`

---

## 2. Grammaire

```jsonc
{
  "id": "gram-a1-def-article",
  "titleFr": "L'article défini postposé",
  "cefrLevel": "A1",
  "explanationFr": "En norvégien, l'article défini n'est pas un mot séparé : il se colle à la fin du nom.\n\n- `en bil` (une voiture) → `bilen` (la voiture)\n- `et hus` (une maison) → `huset` (la maison)",
  "frContrast": "En français, l'article précède le nom (« la voiture »). En norvégien, il le suit et fusionne avec lui. C'est le contraire de l'intuition francophone.",
  "examples": [
    { "nb": "Bilen er rød.", "fr": "La voiture est rouge.", "highlight": [0, 5] }
  ],
  "commonErrors": [
    {
      "wrong": "den bil",
      "right": "bilen",
      "whyFr": "Calque du français. `den` existe mais s'emploie seulement avec un adjectif : `den røde bilen`."
    }
  ],
  "relatedRuleIds": ["gram-a1-gender", "gram-a2-double-definiteness"]
}
```

Le champ `frContrast` est **obligatoire** — c'est le cœur pédagogique du produit.

---

## 3. Leçon

```jsonc
{
  "id": "a1-c01-l01",
  "chapterId": "a1-c01",
  "orderIndex": 1,
  "titleFr": "Se présenter",
  "titleNb": "Å presentere seg",
  "durationMinutes": 10,
  "objectives": [
    "Dire son nom et son âge",
    "Demander le nom de quelqu'un",
    "Utiliser le verbe « å hete »"
  ],
  "xpReward": 30,
  "prerequisites": [],
  "situationTag": null,
  "vocabularyIds": ["vocab-hete", "vocab-jeg", "vocab-du"],
  "grammarRuleIds": ["gram-a1-pronouns"],
  "blocks": [
    { "type": "intro", "payload": { "textFr": "…", "imageId": "…" } },
    { "type": "explanation", "payload": { "grammarRuleId": "gram-a1-pronouns" } },
    { "type": "exercise", "payload": { "exerciseType": "multiple_choice", "…": "…" } }
  ]
}
```

---

## 4. Dialogue

```jsonc
{
  "id": "dial-a1-butikk",
  "situationTag": "grocery_shopping",
  "cefrLevel": "A1",
  "contextFr": "Vous êtes à la caisse d'un supermarché Rema 1000 à Oslo.",
  "turns": [
    { "speaker": "cashier", "nb": "Hei! Vil du ha pose?", "fr": "Bonjour ! Voulez-vous un sac ?", "audioPath": "audio/dial-a1-butikk-01.mp3" },
    { "speaker": "user", "nb": "Ja takk.", "fr": "Oui, merci.", "audioPath": "…" }
  ],
  "vocabularyIds": ["vocab-pose", "vocab-takk"],
  "culturalNoteFr": "Les sacs sont payants en Norvège (environ 3 NOK). Beaucoup de Norvégiens apportent le leur."
}
```

---

## 5. Élément culturel

```jsonc
{
  "id": "cult-17mai",
  "type": "tradition",
  "titleFr": "Le 17 mai — la fête nationale",
  "contentFr": "…markdown…",
  "region": null,
  "cefrLevel": "A2",
  "dateRelevant": "05-17",
  "vocabularyIds": ["vocab-bunad", "vocab-tog"]
}
```

`dateRelevant` (format `MM-DD`) permet de faire remonter le contenu au bon moment
dans le fil d'immersion quotidien.

---

## 6. Règles de qualité du contenu

Le script de validation **échoue** si :
- un `vocabularyId` référencé n'existe pas
- une règle de grammaire n'a pas de `frContrast`
- un mot n'a pas d'`ipa`
- un substantif n'a pas de `gender` ni de flexions complètes
- une leçon n'a pas au moins 6 exercices
- un `audioPath` pointe vers un fichier absent
- un texte français contient un caractère norvégien non intentionnel (æøå hors citation)

---

## 7. Volumétrie cible

| Niveau | Chapitres | Leçons | Mots | Règles |
|---|---|---|---|---|
| A1 | 12 | 60 | 600 | 40 |
| A2 | 14 | 70 | 1 200 | 55 |
| B1 | 16 | 80 | 2 000 | 60 |
| B2 | 16 | 80 | 2 500 | 50 |
| C1 | 14 | 70 | 2 500 | 35 |
| C2 | 12 | 60 | 2 000 | 20 |
| **Total** | **84** | **420** | **10 800** | **260** |

Priorité MVP : **A1 complet** (60 leçons) avant tout autre niveau.
Mieux vaut 60 excellentes leçons que 420 médiocres.
