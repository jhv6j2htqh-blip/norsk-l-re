# Norsk Lære — Pack de spécifications techniques

Complément au PRD `Document_sans_titre.docx`.
Le PRD dit **pourquoi** et **quoi**. Ce pack dit **comment**, dans un format
directement exploitable par un agent de code.

## Comment l'utiliser avec ton agent

1. Place ces fichiers à la racine du dépôt, en gardant l'arborescence :
   ```
   /AGENTS.md
   /spec/*.md
   /docs/PRD.docx        ← ton document Word
   ```
2. Premier prompt à l'agent :
   > Lis `AGENTS.md` puis tout le dossier `spec/`. Ne code rien encore.
   > Résume-moi la stack, l'arborescence et la Phase 0 de la roadmap,
   > puis liste les points qui te manquent pour commencer.
3. Ensuite, travaille **une phase à la fois** :
   > Implémente la Phase 0 de `spec/roadmap.md`. Respecte `AGENTS.md` §7.
   > Mets à jour `spec/progress.md` quand c'est terminé.

Ne demande jamais « code toute l'application ». Un agent produit du code
médiocre quand le périmètre est trop large.

## Contenu

| Fichier | Rôle |
|---|---|
| `AGENTS.md` | Règles non négociables : stack, arborescence, conventions, définition de « terminé » |
| `spec/data-model.md` | Toutes les tables, colonnes, index, stratégie de synchronisation |
| `spec/api-contract.md` | Routes, formats, types TypeScript, codes d'erreur |
| `spec/lesson-engine.md` | Machine à états d'une leçon, 12 types d'exercices, bouton « Pourquoi ? », XP |
| `spec/srs-algorithm.md` | FSRS-5, sélection des cartes, mode rattrapage |
| `spec/content-schema.md` | Format JSON du contenu pédagogique, règles de validation, volumétrie |
| `spec/design-system.md` | Tokens couleur/typo/espacement, composants, accessibilité |
| `spec/roadmap.md` | 8 phases, tranches verticales, périmètre exclu du MVP |
| `spec/acceptance-criteria.md` | Critères vérifiables, testables en Playwright |
| `spec/progress.md` | Journal tenu par l'agent + questions ouvertes |

## Ce qui manquait dans le PRD original

Le PRD couvrait très bien la vision, la pédagogie et les fonctionnalités.
Il ne contenait pas — et un agent de code ne peut pas les inventer sans dériver :

- une stack figée avec versions
- un schéma de base de données
- des contrats d'API typés
- une arborescence de projet
- le format exact du contenu pédagogique
- des tokens de design chiffrés
- des critères d'acceptation vérifiables
- un ordre de construction avec un périmètre MVP explicite

Ces huit manques sont exactement ce que ce pack comble.

## Décisions prises en ton nom

Elles sont modifiables, mais un agent a besoin d'une réponse par défaut :

- **Vite + Capacitor** plutôt que Next.js ou React Native — une base de code pour 6 plateformes, build statique compatible offline.
- **FSRS-5** plutôt que SM-2 — meilleur, ouvert, déjà implémenté.
- **A1 complet d'abord** — 60 leçons excellentes avant d'attaquer A2. Conforme à ta valeur « qualité avant quantité ».
- **Mode `relaxed` par défaut** (cœurs illimités) — cohérent avec « expliquer avant punir ».
- **Le norvégien en sérif, le français en sans-serif** — distinction cognitive immédiate.
- **`frContrast` obligatoire** sur chaque règle de grammaire — c'est ton différenciant principal, il devient une contrainte de validation en CI.
