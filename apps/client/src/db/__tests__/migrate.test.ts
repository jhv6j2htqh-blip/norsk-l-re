import { describe, expect, it } from "vitest";
import type { SqlDriver, SqlMethod } from "../driver.js";
import { migrationTag, runMigrations, splitMigrationStatements } from "../migrate.js";

describe("migrationTag", () => {
  it("strips the directory and .sql extension", () => {
    expect(migrationTag("../../drizzle/0000_brainy_whiplash.sql")).toBe("0000_brainy_whiplash");
  });

  it("returns the input unchanged when there is no slash", () => {
    expect(migrationTag("0001_custom.sql")).toBe("0001_custom");
  });
});

describe("splitMigrationStatements", () => {
  it("splits on the drizzle-kit breakpoint marker and trims each statement", () => {
    const sql = "CREATE TABLE a (id text);\n--> statement-breakpoint\nCREATE TABLE b (id text);";
    expect(splitMigrationStatements(sql)).toEqual([
      "CREATE TABLE a (id text);",
      "CREATE TABLE b (id text);",
    ]);
  });

  it("keeps semicolons inside a single statement intact (e.g. trigger bodies)", () => {
    const sql = [
      "CREATE TRIGGER t AFTER INSERT ON a BEGIN",
      "  INSERT INTO log VALUES (1);",
      "  INSERT INTO log VALUES (2);",
      "END;",
    ].join("\n");
    expect(splitMigrationStatements(sql)).toEqual([sql]);
  });

  it("drops empty statements", () => {
    expect(splitMigrationStatements("  \n--> statement-breakpoint\n  ")).toEqual([]);
  });
});

/** Driver en mémoire imitant juste assez de SQLite pour tester le runner de migrations. */
function createFakeDriver() {
  const executed: string[] = [];
  const appliedTags: string[] = [];

  const driver: SqlDriver = {
    execute(sql: string, params: unknown[], _method: SqlMethod) {
      const trimmed = sql.trim();
      if (trimmed.startsWith("SELECT tag FROM __drizzle_migrations")) {
        return Promise.resolve({ rows: appliedTags.map((tag) => [tag]) });
      }
      if (trimmed.startsWith("INSERT INTO __drizzle_migrations")) {
        appliedTags.push(params[0] as string);
        return Promise.resolve({ rows: [] });
      }
      executed.push(trimmed);
      return Promise.resolve({ rows: [] });
    },
    close() {
      return Promise.resolve();
    },
  };

  return { driver, executed, appliedTags };
}

describe("runMigrations", () => {
  it("applies every bundled migration exactly once", async () => {
    const { driver, appliedTags } = createFakeDriver();
    await runMigrations(driver);
    // Les deux migrations générées en Phase 0 (schéma + FTS/index partiels).
    expect(appliedTags).toEqual(["0000_brainy_whiplash", "0001_fts-and-partial-indexes"]);
  });

  it("is idempotent: re-running does not re-apply already-applied migrations", async () => {
    const { driver, appliedTags } = createFakeDriver();
    await runMigrations(driver);
    const firstRunCount = appliedTags.length;
    await runMigrations(driver);
    expect(appliedTags).toHaveLength(firstRunCount);
  });
});
