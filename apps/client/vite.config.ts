import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
  worker: {
    format: "es",
  },
  optimizeDeps: {
    // wa-sqlite ships its own WASM glue code; letting esbuild pre-bundle it
    // breaks the relative fetch of the .wasm file.
    exclude: ["wa-sqlite"],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
