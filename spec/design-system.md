# Design system

Esthétique scandinave : sobre, chaleureuse, intemporelle. Ni jeu enfantin, ni austérité.
Référence mentale : un intérieur norvégien en hiver — bois clair, lumière basse, calme.

---

## 1. Couleurs (tokens CSS)

```css
:root {
  /* Neutres — base de l'interface */
  --color-bg:            #FBFAF8;   /* blanc chaud, jamais #FFF pur */
  --color-surface:       #FFFFFF;
  --color-surface-alt:   #F3F1EC;
  --color-border:        #E3DFD7;
  --color-text:          #1C1A17;
  --color-text-muted:    #6B655C;

  /* Primaire — bleu fjord */
  --color-primary:       #2F5D73;
  --color-primary-hover: #264C5E;
  --color-primary-soft:  #E4EDF1;

  /* Accent — bois/ambre, pour XP et récompenses */
  --color-accent:        #C4854B;
  --color-accent-soft:   #F6EDE2;

  /* Sémantique */
  --color-success:       #4A7C59;
  --color-success-soft:  #E7F0E9;
  --color-error:         #A8453A;
  --color-error-soft:    #F7E9E7;
  --color-warning:       #B8873B;
  --color-info:          #4A6D8C;
}

[data-theme="dark"] {
  --color-bg:            #16181A;
  --color-surface:       #1E2124;
  --color-surface-alt:   #262A2E;
  --color-border:        #343A3F;
  --color-text:          #EDEAE5;
  --color-text-muted:    #9B958C;
  --color-primary:       #7FAFC4;
  --color-primary-hover: #97C0D2;
  --color-primary-soft:  #22333C;
  --color-accent:        #D9A067;
  --color-success:       #7FA98A;
  --color-error:         #D4837A;
}
```

**Règle** : le rouge d'erreur n'est jamais dominant. Une erreur est une occasion
d'apprendre, pas une punition. Bordure et icône colorées, fond `--color-error-soft`.

---

## 2. Typographie

```css
--font-sans: "Inter Variable", system-ui, sans-serif;
--font-nb:   "Source Serif 4", Georgia, serif;   /* texte norvégien = sérif */
--font-mono: "JetBrains Mono", monospace;         /* IPA */
```

Le norvégien s'affiche en sérif pour créer une distinction visuelle immédiate
avec le français. C'est un choix pédagogique, pas décoratif.

Échelle (base 16 px, ratio 1,25) :

| Token | Taille | Usage |
|---|---|---|
| `--text-xs` | 12 px | métadonnées |
| `--text-sm` | 14 px | secondaire |
| `--text-base` | 16 px | corps |
| `--text-lg` | 20 px | phrases norvégiennes en exercice |
| `--text-xl` | 25 px | titres de section |
| `--text-2xl` | 31 px | titres de page |
| `--text-3xl` | 39 px | écrans de félicitations |

Hauteur de ligne : 1,6 pour le corps, 1,25 pour les titres.
Largeur de lecture max : 68 caractères.

---

## 3. Espacement

Base 4 px : `--space-1` = 4 px … `--space-16` = 64 px.
Utiliser exclusivement l'échelle, jamais de valeur arbitraire.

---

## 4. Rayons et ombres

```css
--radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px; --radius-full: 9999px;

--shadow-sm: 0 1px 2px rgb(28 26 23 / 0.05);
--shadow-md: 0 2px 8px rgb(28 26 23 / 0.07);
--shadow-lg: 0 8px 24px rgb(28 26 23 / 0.09);
```

Ombres discrètes uniquement. Pas d'élévation façon material.

---

## 5. Mouvement

```css
--duration-fast: 120ms; --duration-base: 200ms; --duration-slow: 320ms;
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
```

Toute animation est enveloppée dans `@media (prefers-reduced-motion: no-preference)`.
Pas de confettis plein écran, pas de rebond exagéré. Une réussite se célèbre
par une transition douce et un son court optionnel.

---

## 6. Composants de base

À construire dans `shared/ui/`, sur shadcn/ui :

`Button` (variants `primary` `secondary` `ghost` `danger`, tailles `sm` `md` `lg`),
`Card`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`,
`Progress`, `Badge`, `Avatar`, `Dialog`, `Sheet`, `Toast`, `Tooltip`, `Tabs`,
`Skeleton`, `EmptyState`, `ErrorState`.

Composants métier :
`LessonCard`, `ExerciseShell`, `AnswerFeedback`, `WhyButton`, `AudioButton`,
`NorwegianText` (applique `--font-nb` + gestion des surlignages),
`XpCounter`, `StreakFlame`, `PassportStamp`, `LevelPath`, `WordChip`, `IpaText`.

---

## 7. Layout

- Mobile-first. Points de rupture : 640 / 768 / 1024 / 1280 px.
- Mobile : barre d'onglets basse — Accueil · Réviser · Dictionnaire · Profil.
- Desktop : barre latérale gauche fixe 240 px.
- Zone tactile minimale 44 × 44 px.
- Safe areas iOS respectées (`env(safe-area-inset-*)`).

---

## 8. Accessibilité

- Contraste ≥ 4,5:1 (texte), ≥ 3:1 (UI). Vérifié en CI.
- Focus visible : `outline: 2px solid var(--color-primary); outline-offset: 2px`.
- Toute icône seule porte un `aria-label`.
- Les corrections ne s'appuient jamais sur la couleur seule : icône + texte.
- L'audio n'est jamais la seule source d'information (transcription disponible).
- `font-scale` utilisateur de 0,875 à 1,5.
