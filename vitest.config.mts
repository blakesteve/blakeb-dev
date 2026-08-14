import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Node environment, not jsdom. The suite covers the three modules with real
 * logic — date arithmetic, a degrading fetch, and a package reader — and none
 * of them touch a DOM. `lib/roster.ts` reads `node_modules` relative to
 * `process.cwd()`, so tests have to run from the project root.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
