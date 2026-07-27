// Interface commune aux deux implémentations de la base locale — voir
// AGENTS.md §6 (chaque service externe expose une interface + implémentations
// sélectionnées à l'exécution) et §3 de l'arborescence (db/ sous apps/client).
export type SqlMethod = "run" | "all" | "values" | "get";

export interface SqlDriver {
  /** Exécute une unique instruction SQL et retourne les lignes en tableaux de valeurs. */
  execute(sql: string, params: unknown[], method: SqlMethod): Promise<{ rows: unknown[][] }>;
  close(): Promise<void>;
}
