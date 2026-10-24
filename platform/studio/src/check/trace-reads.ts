import { createHash } from "node:crypto";
import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, expect } from "vitest";

/**
 * Test setup (vitest setupFiles): notes every repo file a test file reads from disk (readFileSync,
 * readdir, exists, stat…), so the test cache knows to re-run it when one changes. Imports are known
 * from Vite's module graph; this covers what tests read by path. See check/test.ts.
 */

const KEY = Symbol.for("chalk.reads");
type Global = typeof globalThis & { [KEY]?: Set<string> };
const g = globalThis as Global;

function rootOf(start: string): string {
  let dir = start;
  while (!fs.existsSync(join(dir, "pnpm-workspace.yaml")) && dirname(dir) !== dir)
    dir = dirname(dir);
  return dir;
}
const root = rootOf(process.cwd());

if (g[KEY] === undefined) {
  const reads = new Set<string>();
  g[KEY] = reads;
  const note = (p: unknown) => {
    if (typeof p !== "string" && !(p instanceof URL)) return;
    let path = resolve(p instanceof URL ? fileURLToPath(p) : p);
    // Through a link (a test's fixture can link real content in): the real file is what matters.
    try {
      path = fs.realpathSync.native(path);
    } catch {}
    if (path.startsWith(root) && !path.includes("/node_modules/")) reads.add(path);
  };
  const wrap = <T extends object, K extends keyof T>(target: T, name: K) => {
    const original = target[name] as unknown as (...args: unknown[]) => unknown;
    if (typeof original !== "function") return;
    (target as Record<K, unknown>)[name] = function (this: unknown, ...args: unknown[]) {
      note(args[0]);
      return original.apply(this, args);
    };
  };
  for (const name of [
    "readFileSync",
    "readFile",
    "readdirSync",
    "readdir",
    "existsSync",
    "statSync",
    "lstatSync",
    "stat",
    "lstat",
  ] as const)
    wrap(fs, name);
  for (const name of ["readFile", "readdir", "stat", "lstat", "access"] as const)
    wrap(fs.promises, name);
  // `import { readFileSync } from "node:fs"` binds to the ES module view: bring it up to date.
  syncBuiltinESMExports();
}

afterAll(() => {
  const worker = (globalThis as { __vitest_worker__?: { filepath?: string } }).__vitest_worker__;
  const file = worker?.filepath ?? expect.getState().testPath;
  if (file === undefined) return;
  const dir = join(root, "node_modules", ".cache", "chalk-check", "reads");
  fs.mkdirSync(dir, { recursive: true });
  const name = createHash("sha1").update(file).digest("hex");
  fs.writeFileSync(join(dir, `${name}.json`), JSON.stringify([...(g[KEY] ?? [])]));
  // Reads made while the file was imported count too, so clear only after writing.
  g[KEY]?.clear();
});
