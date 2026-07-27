import type { SqlDriver, SqlMethod } from "../driver.js";

interface PendingRequest {
  resolve: (rows: unknown[][]) => void;
  reject: (error: Error) => void;
}

type WorkerResponse =
  { id: number; ok: true; rows: unknown[][] } | { id: number; ok: false; error: string };

/** Driver web : SQLite (wa-sqlite) exécuté dans un Worker, stockage OPFS. */
export function createWebDriver(): SqlDriver {
  const worker = new Worker(new URL("./sqlite.worker.ts", import.meta.url), { type: "module" });
  const pending = new Map<number, PendingRequest>();
  let nextId = 1;

  worker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
    const response = event.data;
    const request = pending.get(response.id);
    if (!request) return;
    pending.delete(response.id);
    if (response.ok) {
      request.resolve(response.rows);
    } else {
      request.reject(new Error(response.error));
    }
  });

  return {
    async execute(sql: string, params: unknown[], method: SqlMethod) {
      const id = nextId++;
      const rows = await new Promise<unknown[][]>((resolve, reject) => {
        pending.set(id, { resolve, reject });
        worker.postMessage({ id, sql, params, method });
      });
      return { rows };
    },
    close() {
      worker.terminate();
      return Promise.resolve();
    },
  };
}
