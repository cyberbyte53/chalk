import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadConfigFromFile } from "vite";
import { describe, expect, it } from "vitest";

/**
 * The dev server's config loads the way the dev server loads it, and runs none of the studio's code:
 * threads, approvals and the rebuild live in the studio service, which it only passes /dev-* on to
 * (an import of studio code once stopped the dev server from starting).
 */
describe("the dev server's config", () => {
  it("loads", async () => {
    const file = fileURLToPath(new URL("../vite.config.ts", import.meta.url));
    const loaded = await loadConfigFromFile({ command: "serve", mode: "development" }, file);
    expect(loaded?.config).toBeDefined();
  }, 60_000);

  it("runs none of the studio's code, only its starter", () => {
    const config = readFileSync(
      fileURLToPath(new URL("../vite.config.ts", import.meta.url)),
      "utf8",
    );
    const imports = [...config.matchAll(/from "([^"]+)"/g)].map((m) => m[1] ?? "");
    expect(imports.filter((i) => i.includes("studio/"))).toEqual(["../../studio/start.mjs"]);
  });
});
