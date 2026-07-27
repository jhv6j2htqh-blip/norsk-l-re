import { Capacitor } from "@capacitor/core";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import type { SqlDriver } from "./driver.js";
import { createNativeDriver } from "./drivers/native.js";
import { createWebDriver } from "./drivers/web.js";
import { runMigrations } from "./migrate.js";
import * as schema from "./schema.js";

export type Database = ReturnType<typeof createDb>;

function createDb(driver: SqlDriver) {
  return drizzle(async (sql, params, method) => driver.execute(sql, params, method), { schema });
}

let dbPromise: Promise<Database> | undefined;

/**
 * Point d'entrée unique de la base locale. Sélectionne le driver adapté à la
 * plateforme (natif Capacitor ↔ web wa-sqlite/OPFS — AGENTS.md §6), applique
 * les migrations en attente, puis retourne une instance Drizzle prête à
 * l'emploi. Le résultat est mis en cache : un seul driver/une seule connexion
 * par cycle de vie de l'application.
 */
export function getDb(): Promise<Database> {
  dbPromise ??= (async () => {
    const driver = Capacitor.isNativePlatform() ? await createNativeDriver() : createWebDriver();
    await runMigrations(driver);
    return createDb(driver);
  })();
  return dbPromise;
}
