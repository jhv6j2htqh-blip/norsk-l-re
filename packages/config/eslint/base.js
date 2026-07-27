// Configuration ESLint 9 (flat config) partagée — voir AGENTS.md §7.
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
export const baseConfig = [
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    rules: {
      // AGENTS.md §7 : `any` non justifié interdit — un `any` volontaire doit
      // porter un commentaire, donc on l'autorise à l'endroit exact où il est
      // écrit plutôt que de l'interdire globalement (impossible à faire
      // respecter par ESLint seul).
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "axios", message: "Utiliser `fetch` — voir AGENTS.md §2." },
            { name: "moment", message: "`moment.js` interdit — voir AGENTS.md §2." },
          ],
        },
      ],
    },
  },
  prettier,
];

export default baseConfig;
