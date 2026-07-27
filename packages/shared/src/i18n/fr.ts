// Textes UI par défaut (FR) — voir AGENTS.md §7 : jamais de texte en dur dans
// les composants. Le norvégien sera ajouté ici une fois le mode immersion
// construit (spec/roadmap.md, après le MVP).
export const fr = {
  app: {
    title: "Norsk Lære",
    tagline: "Apprendre le norvégien. Comprendre la Norvège. Y vivre avec confiance.",
  },
  db: {
    status: {
      loading: "Connexion à la base locale…",
      ready: "Base de données locale prête.",
      error: "Impossible d'initialiser la base de données locale.",
    },
  },
} as const;
