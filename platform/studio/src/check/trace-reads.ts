import { createHash } from "node:crypto";
import fs from "node:fs";
import { dirname, join } from "node:path";
import { afterAll, expect } from "vitest";
import { watchReads } from "./reads";

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
  // Tests are stamped by the bytes of everything they touched, however they touched it.
  watchReads(root, (path) => reads.add(path));
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
