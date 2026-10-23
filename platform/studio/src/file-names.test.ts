import { readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { findUp } from "./pronunciations";

const root = dirname(findUp("pnpm-workspace.yaml", import.meta.dirname));
/** Folders .gitignore keeps out of the repo: generated, installed, or parked (tmp/). */
const SKIPPED = new Set([
  "node_modules",
  ".git",
  "build",
  "published",
  "dist",
  "coverage",
  "tmp",
  "_to_delete",
]);
/** Imports leave these off, so `./rich` reaches `rich.ts` and `Rich.tsx` alike. */
const CODE = /\.(ts|tsx|js|jsx|mjs)$/;

/** Every group of paths in one folder that one import path (ignoring case) could mean. */
function caseClashes(dir: string, out: string[][] = []): string[][] {
  const entries = readdirSync(dir, { withFileTypes: true }).filter((e) => !SKIPPED.has(e.name));
  const byLower = new Map<string, string[]>();
  for (const entry of entries) {
    const key = entry.name.replace(CODE, "").toLowerCase();
    byLower.set(key, [...(byLower.get(key) ?? []), relative(root, join(dir, entry.name))]);
    if (entry.isDirectory()) caseClashes(join(dir, entry.name), out);
  }
  for (const names of byLower.values()) if (names.length > 1) out.push(names);
  return out;
}

/** Source files: code and styles. Docs (README.md, AGENTS.md) keep their conventional names. */
const SOURCE = /\.(ts|tsx|css)$/;
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+)+$/;

/** Every source file whose name isn't kebab-case. */
function notKebab(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIPPED.has(entry.name) || entry.name.startsWith(".")) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) notKebab(path, out);
    else if (SOURCE.test(entry.name) && !KEBAB.test(entry.name)) out.push(relative(root, path));
  }
  return out;
}

describe("file names", () => {
  it("every source file is kebab-case, components too (board-player.tsx exports BoardPlayer)", () => {
    expect(notKebab(root)).toEqual([]);
  });

  it("no two files in a folder differ only in case or code extension (macOS and Windows mix them up)", () => {
    expect(caseClashes(root)).toEqual([]);
  });
});
