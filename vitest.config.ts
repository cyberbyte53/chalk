import { defineConfig } from "vitest/config";

export default defineConfig({
  // Mafs (props/polynomials) is a React library run on Preact. In Node, two of its dependencies
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
      "packages/*/src/**/*.test.ts",
      "props/*/src/**/*.test.ts",
      "props/*/src/**/*.test.tsx",
      "studio/src/**/*.test.ts",
      "library/src/**/*.test.ts",
      "apps/*/src/**/*.test.ts",
    ],
    server: { deps: { inline: [/mafs/, /@use-gesture/, /use-resize-observer/] } },
  },
});
