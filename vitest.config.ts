import { defineConfig } from "vitest/config";

export default defineConfig({
  // JSX is Preact's everywhere, as tsconfig.base.json says (content/ has no tsconfig of its own).
  esbuild: { jsx: "automatic", jsxImportSource: "preact" },
  test: {
    include: [
      "platform/packages/*/src/**/*.test.ts",
      "platform/packages/*/src/**/*.test.tsx",
      "library/props/*/src/**/*.test.ts",
      "library/props/*/src/**/*.test.tsx",
      "platform/studio/src/**/*.test.ts",
      "library/registry/src/**/*.test.ts",
      "library/patterns/**/*.test.ts",
      "platform/apps/*/src/**/*.test.ts",
      "platform/editor/src/**/*.test.ts",
    ],
    // Notes the files each test reads from disk, for the test cache (platform/studio/src/check).
    setupFiles: ["platform/studio/src/check/trace-reads.ts"],
  },
});
