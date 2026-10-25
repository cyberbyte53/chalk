import { defineConfig } from "vitest/config";

export default defineConfig({
  // Mafs (library/props/polynomials) is a React library run on Preact. In Node, two of its dependencies
  // would load Preact's CommonJS build next to the ES one, and hooks break with two Preacts: point
  // them at their ES builds and let Vite process them.
  resolve: {
    alias: [
      {
        find: /^@use-gesture\/react$/,
        replacement: "@use-gesture/react/dist/use-gesture-react.esm.js",
      },
      { find: /^use-resize-observer$/, replacement: "use-resize-observer/dist/bundle.esm.js" },
    ],
  },
  test: {
    include: [
      "platform/packages/*/src/**/*.test.ts",
      "platform/packages/*/src/**/*.test.tsx",
      "library/props/*/src/**/*.test.ts",
      "library/props/*/src/**/*.test.tsx",
      "platform/studio/src/**/*.test.ts",
      "library/registry/src/**/*.test.ts",
      "platform/apps/*/src/**/*.test.ts",
    ],
    server: { deps: { inline: [/mafs/, /@use-gesture/, /use-resize-observer/] } },
    // Notes the files each test reads from disk, for the test cache (platform/studio/src/check).
    setupFiles: ["platform/studio/src/check/trace-reads.ts"],
  },
});
