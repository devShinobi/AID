import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";

const root = resolve(fileURLToPath(import.meta.url), "..");

export default defineConfig({
  plugins: [tsconfigPaths({ root })],
  test: {
    globals: true,
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**"],
    },
  },
  resolve: {
    extensionAlias: {
      ".js": [".ts", ".js"],
    },
  },
});
