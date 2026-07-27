import { baseConfig } from "@norsk-laere/config/eslint/base";
import { reactConfig } from "@norsk-laere/config/eslint/react";

/** Applies `files` to every config object of a shareable config array. */
const scoped = (configs, files) => configs.map((config) => ({ ...config, files }));

export default [
  {
    // Tooling/config files are intentionally out of type-aware lint scope —
    // they aren't part of any package's tsconfig `include`.
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/node_modules/**",
      "apps/client/android/**",
      "apps/client/ios/**",
      "**/*.config.{js,ts,mjs,cjs}",
      "packages/config/**",
      "scripts/**",
    ],
  },
  ...scoped(reactConfig, ["apps/client/src/**/*.{ts,tsx}"]),
  ...scoped(baseConfig, [
    "apps/server/src/**/*.ts",
    "packages/shared/src/**/*.ts",
    "packages/content/src/**/*.ts",
  ]),
  {
    files: [
      "apps/client/src/**/*.{ts,tsx}",
      "apps/server/src/**/*.ts",
      "packages/shared/src/**/*.ts",
      "packages/content/src/**/*.ts",
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
