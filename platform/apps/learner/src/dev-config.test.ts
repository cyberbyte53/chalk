import { fileURLToPath } from "node:url";
import { loadConfigFromFile } from "vite";
import { describe, expect, it } from "vitest";

/**
 * The dev server's config loads the way the dev server loads it: Node runs the studio code it
 * imports directly, so that code may only import what Node can load as it is (an import of a
 * workspace package's TypeScript once stopped the dev server from starting).
 */
describe("the dev server's config", () => {
  it("loads", async () => {
    const file = fileURLToPath(new URL("../vite.config.ts", import.meta.url));
    const loaded = await loadConfigFromFile({ command: "serve", mode: "development" }, file);
    expect(loaded?.config).toBeDefined();
  }, 60_000);
});
