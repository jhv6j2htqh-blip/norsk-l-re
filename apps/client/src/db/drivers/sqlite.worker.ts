// Worker dédié exécutant wa-sqlite avec le VFS OPFS (AccessHandlePoolVFS).
// L'API File System Access « Sync Access Handle » n'existe que dans un
// Worker : toute la logique SQLite web vit ici, le thread principal ne
// communique qu'en envoyant des requêtes SQL et en recevant des lignes.
import ModuleFactory from "wa-sqlite/dist/wa-sqlite.mjs";
import { AccessHandlePoolVFS } from "wa-sqlite/src/examples/AccessHandlePoolVFS.js";
import * as SQLite from "wa-sqlite/src/sqlite-api.js";
import type { SqlMethod } from "../driver.js";

interface WorkerRequest {
  id: number;
  sql: string;
  params: unknown[];
  method: SqlMethod;
}

type WorkerResponse =
  { id: number; ok: true; rows: unknown[][] } | { id: number; ok: false; error: string };

// Cast explicite plutôt que de mélanger les libs "DOM" et "webworker" dans
// tsconfig (le projet cible les deux contextes) — voir shared/ pour la
// convention du reste du client.
const ctx = self as unknown as {
  postMessage: (message: WorkerResponse) => void;
  addEventListener: (
    type: "message",
    listener: (event: MessageEvent<WorkerRequest>) => void,
  ) => void;
};

let sqlite3: SQLite.SQLiteAPI | undefined;
let db: number | undefined;

const ready = (async () => {
  const module = await ModuleFactory();
  sqlite3 = SQLite.Factory(module);

  const vfs = new AccessHandlePoolVFS("/norsk-laere");
  await vfs.isReady;
  sqlite3.vfs_register(vfs, true);

  db = await sqlite3.open_v2("norsk-laere.sqlite");
})();

async function execute(sql: string, params: unknown[]): Promise<unknown[][]> {
  await ready;
  if (!sqlite3 || db === undefined) {
    throw new Error("wa-sqlite n'a pas pu être initialisé.");
  }

  const rows: unknown[][] = [];
  for await (const stmt of sqlite3.statements(db, sql)) {
    if (params.length > 0) {
      sqlite3.bind_collection(stmt, params as SQLite.SQLiteCompatibleType[]);
    }
    while ((await sqlite3.step(stmt)) === SQLite.SQLITE_ROW) {
      rows.push(sqlite3.row(stmt));
    }
  }
  return rows;
}

ctx.addEventListener("message", (event) => {
  const { id, sql, params } = event.data;
  execute(sql, params)
    .then((rows) => {
      const response: WorkerResponse = { id, ok: true, rows };
      ctx.postMessage(response);
    })
    .catch((error: unknown) => {
      const response: WorkerResponse = {
        id,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
      ctx.postMessage(response);
    });
});
