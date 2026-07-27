import { expect, test } from "@playwright/test";

// Vérifie le livrable de la Phase 0 (spec/roadmap.md) : l'app démarre et
// lit/écrit réellement dans SQLite côté web (wa-sqlite + OPFS), pas juste
// que le code compile.
test("l'app démarre et écrit/lit dans la base SQLite locale (OPFS)", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto("/");

  const status = page.getByTestId("db-status");
  await expect(status).toHaveText(/Base de données locale prête\. \(1\)/, { timeout: 15_000 });

  // Persistance réelle : recharger la page ne doit pas recréer un utilisateur.
  await page.reload();
  await expect(status).toHaveText(/Base de données locale prête\. \(1\)/, { timeout: 15_000 });

  expect(consoleErrors).toEqual([]);
});
