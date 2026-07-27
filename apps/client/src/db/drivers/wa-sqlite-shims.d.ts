// Déclarations ambiantes minimales pour les imports profonds de `wa-sqlite`
// (le package ne type que son point d'entrée principal). Ne couvre que ce
// dont notre driver web a réellement besoin — voir spec/data-model.md et
// AGENTS.md §2 (SQLite via `wa-sqlite` en web, OPFS).

declare module "wa-sqlite/dist/wa-sqlite.mjs" {
  const ModuleFactory: (config?: object) => Promise<unknown>;
  export default ModuleFactory;
}

declare module "wa-sqlite/src/sqlite-api.js" {
  export type SQLiteCompatibleType = number | string | Uint8Array | ArrayBuffer | null;

  export interface SQLiteAPI {
    open_v2(zFilename: string, iFlags?: number, zVfs?: string): Promise<number>;
    close(db: number): Promise<number>;
    vfs_register(vfs: unknown, makeDefault?: boolean): number;
    statements(db: number, sql: string): AsyncIterable<number>;
    bind_collection(
      stmt: number,
      bindings: SQLiteCompatibleType[] | Record<string, SQLiteCompatibleType>,
    ): number;
    step(stmt: number): Promise<number>;
    row(stmt: number): SQLiteCompatibleType[];
    column_names(stmt: number): string[];
    reset(stmt: number): Promise<number>;
  }

  export function Factory(module: unknown): SQLiteAPI;
  export const SQLITE_ROW: 100;
  export const SQLITE_DONE: 101;
}

declare module "wa-sqlite/src/examples/AccessHandlePoolVFS.js" {
  export class AccessHandlePoolVFS {
    constructor(directoryPath: string);
    isReady: Promise<void>;
  }
}
