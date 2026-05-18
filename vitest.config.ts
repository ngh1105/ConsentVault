import { configDefaults, defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    exclude: [
      ...configDefaults.exclude,
      "**/.claude/**",
      "**/.next/**",
      "tests/e2e/**",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "next/link": path.resolve(__dirname, "tests/__mocks__/next-link.tsx"),
    },
  },
});

