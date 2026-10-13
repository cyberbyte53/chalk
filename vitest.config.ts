import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "packages/*/src/**/*.test.ts",
      "props/*/src/**/*.test.ts",
      "props/*/src/**/*.test.tsx",
      "studio/src/**/*.test.ts",
      "library/src/**/*.test.ts",
    ],
  },
});
