import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Files at the root of the repo (package.json, the lockfile, tsconfig.base.json, vitest.config.ts,
 * biome.json, …): read by tools rather than imported, they can change how anything builds, so a
 * change to any of them invalidates every cached step. Taken as a whole, so a config file added
 * later is covered without anyone listing it.
 */
export function rootFiles(root: string): string[] {
  return readdirSync(root)
    .map((name) => join(root, name))
    .filter((f) => statSync(f).isFile());
}

/** Where `pnpm check` logs each run (all.ts); `pnpm tool-times` reads it. */
export const checkLogFile = (root: string): string =>
  join(root, "node_modules", ".cache", "chalk-checks.jsonl");
