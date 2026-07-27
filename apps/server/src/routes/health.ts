import { Hono } from "hono";

// Route de santé minimale — voir spec/api-contract.md pour l'enveloppe de
// réponse générale. Ce serveur est un bonus de synchronisation optionnel
// (AGENTS.md §1) : les routes réelles (auth, sync…) arrivent en Phase 5.
export const healthRoute = new Hono().get("/health", (c) =>
  c.json({ ok: true, data: { status: "ok" } } as const),
);
