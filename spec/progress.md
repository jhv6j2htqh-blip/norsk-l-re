# Journal d'avancement

> L'agent met ce fichier à jour après chaque tranche de travail terminée.
> Format : une ligne par tranche, la plus récente en haut.

## Phase courante
**Phase 0 — Fondations**

## Prochaine action
Initialiser le monorepo pnpm avec les workspaces `apps/client`, `apps/server`,
`packages/shared`, `packages/content`, `packages/config`.

---

## Historique

| Date | Phase | Tranche livrée | Notes / décisions |
|---|---|---|---|
| — | — | *(rien encore)* | — |

---

## Décisions d'architecture (ADR légers)

| # | Décision | Raison | Date |
|---|---|---|---|
| 1 | Vite plutôt que Next.js | build statique nécessaire pour Capacitor et l'offline complet | — |
| 2 | FSRS-5 plutôt que SM-2 | meilleure rétention mesurée, implémentation open source disponible | — |
| 3 | Sérif pour le norvégien | distinction visuelle immédiate FR/NB, choix pédagogique | — |
| 4 | Mode `relaxed` par défaut | cohérent avec « expliquer plutôt que punir » | — |

---

## Questions ouvertes pour le porteur du projet

- [x] Hébergement serveur : **tout en local**, aucun serveur cloud requis (décidé).
- [x] Audio : **voix IA très réalistes générées à l'avance** (Azure AI Speech),
      livrées en fichiers fixes ; Piper local en secours pour le contenu imprévisible
      (décidé — voir `spec/audio-strategy.md`).
- [ ] Licence du contenu pédagogique ?
- [ ] Nom de domaine et identité visuelle (logo) : à faire ou déjà existants ?
- [ ] Budget accepté pour la génération audio Azure (coût unique, pas récurrent) —
      à estimer une fois le volume de phrases A1 finalisé.
