import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import * as nodeModule from "node:module";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * What a build step actually read, recorded rather than declared (like `gcc -MD` for make).
 * Every `import` Node resolves is noted as an edge (importer → imported), so the files a module
 * pulls in, transitively, can be listed after the fact. Nobody keeps these lists by hand.
 */

const edges = new Map<string, Set<string>>();
let isRecording = false;

type Resolve = (
  specifier: string,
  context: { parentURL?: string },
  next: (specifier: string, context: { parentURL?: string }) => { url: string },
) => { url: string };
type RegisterHooks = (hooks: { resolve: Resolve }) => unknown;

/** Starts noting imports. False when this Node can't (then nothing may be cached). */
export function recordImports(): boolean {
  if (isRecording) return true;
  const register = (nodeModule as unknown as { registerHooks?: RegisterHooks }).registerHooks;
  if (register === undefined) return false;
  register({
    resolve(specifier, context, next) {
      const resolved = next(specifier, context);
      const parent = context.parentURL;
      if (parent?.startsWith("file:") && resolved.url.startsWith("file:")) {
        const set = edges.get(parent) ?? new Set<string>();
        set.add(resolved.url.split("?")[0] ?? resolved.url);
        edges.set(parent, set);
      }
      return resolved;
    },
  });
  isRecording = true;
  return true;
}

export const isRecordingImports = (): boolean => isRecording;

/** Every repo file imported so far in this process (outside node_modules), as absolute paths. */
export function importedFiles(): string[] {
  const urls = new Set<string>();
  for (const [from, to] of edges) {
    urls.add(from);
    for (const url of to) urls.add(url);
  }
  return [...urls]
    .filter((url) => url.startsWith("file:"))
    .map((url) => fileURLToPath(url))
    .filter((path) => !path.includes("/node_modules/"));
}

/**
 * Every file these files import, directly or not, themselves included: absolute paths, outside
 * node_modules (outside libraries change only with the lockfile, which is a global input).
 */
export function importClosure(files: Iterable<string>): Set<string> {
  const seen = new Set<string>();
  const todo = [...files].map((f) => pathToFileURL(f).href);
  while (todo.length > 0) {
    const url = todo.pop() as string;
    if (seen.has(url)) continue;
    seen.add(url);
    for (const next of edges.get(url) ?? []) if (!seen.has(next)) todo.push(next);
  }
  const out = new Set<string>();
  for (const url of seen) {
    const path = fileURLToPath(url);
    if (!path.includes(`${"/"}node_modules${"/"}`)) out.add(path);
  }
  return out;
}

/** Every file under a folder (recursively), skipping the named subfolders. */
export function filesUnder(dir: string, skip: ReadonlySet<string> = new Set()): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d).sort()) {
      if (skip.has(name) || name === "node_modules") continue;
      const full = join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else out.push(full);
    }
  };
  walk(dir);
  return out;
}

const hashes = new Map<string, string>();
/** A file's content hash ("missing" if it isn't there), read once per run. */
export function hashFile(file: string): string {
  let h = hashes.get(file);
  if (h === undefined) {
    if (!existsSync(file)) h = "missing";
    // A folder (a test read its listing): its entries' names.
    else if (statSync(file).isDirectory())
      h = createHash("sha1").update(readdirSync(file).sort().join("\n")).digest("hex");
    else h = createHash("sha1").update(readFileSync(file)).digest("hex");
    hashes.set(file, h);
  }
  return h;
}

/** One fingerprint for a set of files (their paths and contents) plus any extra strings. */
export function fingerprint(files: Iterable<string>, extra: readonly string[] = []): string {
  const h = createHash("sha1");
  for (const file of [...new Set(files)].sort()) h.update(`${file}\0${hashFile(file)}\n`);
  for (const e of extra) h.update(`${e}\n`);
  return h.digest("hex");
}
