#!/usr/bin/env node
// Installe un hook pre-commit minimal, sans dépendance externe (husky non
// nécessaire pour un seul hook) — voir AGENTS.md §2 (aucune dépendance hors
// de la liste figée sans demander).
import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

let gitDir;
try {
  gitDir = execSync("git rev-parse --git-dir", { cwd: repoRoot, encoding: "utf8" }).trim();
} catch {
  // Pas un dépôt git (ex. install en CI depuis une archive) : rien à faire.
  process.exit(0);
}

const hooksDir = path.resolve(repoRoot, gitDir, "hooks");
mkdirSync(hooksDir, { recursive: true });

const hookPath = path.join(hooksDir, "pre-commit");
const hookContent = `#!/bin/sh
# Installé par scripts/setup-git-hooks.mjs — voir AGENTS.md §9 (définition de « terminé »).
set -e
pnpm format
pnpm lint
pnpm typecheck
pnpm test
`;

writeFileSync(hookPath, hookContent);
chmodSync(hookPath, 0o755);

if (!existsSync(hookPath)) {
  console.error("Échec de l'installation du hook pre-commit.");
  process.exit(1);
}
