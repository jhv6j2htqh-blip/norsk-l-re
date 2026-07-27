import { fr, uuidv7 } from "@norsk-laere/shared";
import { useEffect, useState } from "react";
import { getDb } from "@/db/index.js";
import { users } from "@/db/schema.js";

type Status =
  { kind: "loading" } | { kind: "ready"; userCount: number } | { kind: "error"; message: string };

/**
 * Écran de diagnostic temporaire pour la Phase 0 : prouve que l'app démarre
 * et lit/écrit dans la base SQLite locale. Sera remplacé par l'onboarding
 * réel en Phase 1 (spec/roadmap.md).
 */
export function DbStatusPage() {
  const [status, setStatus] = useState<Status>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      try {
        const db = await getDb();
        const existing = await db.select().from(users).limit(1);
        if (existing.length === 0) {
          await db.insert(users).values({ id: uuidv7(), displayName: "Invité" });
        }
        const all = await db.select().from(users);
        if (!controller.signal.aborted) setStatus({ kind: "ready", userCount: all.length });
      } catch (error) {
        if (!controller.signal.aborted) {
          setStatus({
            kind: "error",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-nb text-3xl text-primary">{fr.app.title}</h1>
      <p className="max-w-md text-muted-foreground">{fr.app.tagline}</p>
      <p role="status" aria-live="polite" className="text-sm" data-testid="db-status">
        {status.kind === "loading" && fr.db.status.loading}
        {status.kind === "ready" && `${fr.db.status.ready} (${String(status.userCount)})`}
        {status.kind === "error" && `${fr.db.status.error} — ${status.message}`}
      </p>
    </main>
  );
}
