import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";
import type { SqlDriver, SqlMethod } from "../driver.js";

const DB_NAME = "norsk-laere";

/** Driver natif : SQLite via @capacitor-community/sqlite (Android/iOS/desktop Capacitor). */
export async function createNativeDriver(): Promise<SqlDriver> {
  const sqlite = new SQLiteConnection(CapacitorSQLite);
  const consistency = await sqlite.checkConnectionsConsistency();
  const isConnection = (await sqlite.isConnection(DB_NAME, false)).result ?? false;

  const db =
    consistency.result && isConnection
      ? await sqlite.retrieveConnection(DB_NAME, false)
      : await sqlite.createConnection(DB_NAME, false, "no-encryption", 1, false);

  await db.open();

  return {
    async execute(sql: string, params: unknown[], method: SqlMethod) {
      if (method === "run") {
        await db.run(sql, params, false);
        return { rows: [] };
      }

      const result = await db.query(sql, params);
      const rows = (result.values ?? []).map((row: Record<string, unknown>) => Object.values(row));
      return { rows };
    },
    async close() {
      await db.close();
    },
  };
}
