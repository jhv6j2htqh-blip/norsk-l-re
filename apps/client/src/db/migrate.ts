import type { SqlDriver } from "./driver.js";

// Chargées au build par Vite (texte brut), triées par nom de fichier —
// les migrations drizzle-kit sont préfixées 0000_, 0001_, etc.
const migrationModules = import.meta.glob<string>("../../drizzle/*.sql", {
  query: "?raw",
  import: "default",
  eager: true,
});

const STATEMENT_BREAKPOINT = "--> statement-breakpoint";

export function migrationTag(path: string): string {
  return (
    path
      .split("/")
      .at(-1)
      ?.replace(/\.sql$/, "") ?? path
  );
}

export function splitMigrationStatements(sql: string): string[] {
  return sql
    .split(STATEMENT_BREAKPOINT)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

/**
 * Applique les migrations SQL générées par drizzle-kit qui ne l'ont pas encore
 * été, dans l'ordre. Bookkeeping dans `__drizzle_migrations`, comme le fait le
 * migrateur officiel de drizzle-kit pour les drivers qu'il supporte nativement
 * (nécessaire ici car notre driver `sqlite-proxy` n'en fournit pas).
 */
export async function runMigrations(driver: SqlDriver): Promise<void> {
  await driver.execute(
    `CREATE TABLE IF NOT EXISTS __drizzle_migrations (
       id INTEGER PRIMARY KEY,
       tag TEXT NOT NULL UNIQUE,
       applied_at INTEGER NOT NULL
     )`,
    [],
    "run",
  );

  const { rows: appliedRows } = await driver.execute(
    "SELECT tag FROM __drizzle_migrations",
    [],
    "all",
  );
  const applied = new Set(appliedRows.map((row) => row[0] as string));

  const sortedEntries = Object.entries(migrationModules).sort(([a], [b]) => a.localeCompare(b));
  for (const [path, sql] of sortedEntries) {
    const tag = migrationTag(path);
    if (applied.has(tag)) continue;

    for (const statement of splitMigrationStatements(sql)) {
      await driver.execute(statement, [], "run");
    }

    await driver.execute(
      "INSERT INTO __drizzle_migrations (tag, applied_at) VALUES (?, ?)",
      [tag, Date.now()],
      "run",
    );
  }
}
