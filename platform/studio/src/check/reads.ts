import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Notes every repo file this process reads from disk, and how: its bytes (readFile), its listing
 * (readdir), or only whether it is there and what it is (exists, stat). Used to stamp a step with
 * what it actually depended on. Paths are real paths (a link counts as the file it points to);
 * node_modules is left out (it changes only with the lockfile, a root file).
 */
export type ReadKind = "content" | "listing" | "presence";

const FUNCTIONS: [string, ReadKind][] = [
  ["readFileSync", "content"],
  ["readFile", "content"],
  ["readdirSync", "listing"],
  ["readdir", "listing"],
  ["opendirSync", "listing"],
  ["existsSync", "presence"],
  ["statSync", "presence"],
  ["lstatSync", "presence"],
  ["stat", "presence"],
  ["lstat", "presence"],
  ["access", "presence"],
  ["accessSync", "presence"],
];

export function watchReads(root: string, onRead: (path: string, kind: ReadKind) => void): void {
  // Kept before wrapping: the wrapped ones would note the realpath calls themselves.
  const realpath = fs.realpathSync.native;
  const exists = fs.existsSync;
  const real = new Map<string, string>();
  const note = (p: unknown, kind: ReadKind) => {
    if (typeof p !== "string" && !(p instanceof URL)) return;
    // Not filtered yet: a workspace package is read through node_modules/@chalk/… links.
    const given = resolve(p instanceof URL ? fileURLToPath(p) : p);
    let path = real.get(given);
    if (path === undefined) {
      // Only for what is there: realpath of a missing path throws, which is slow, and resolvers
      // probe many missing paths.
      path = given;
      if (exists(given))
        try {
          path = realpath(given);
        } catch {}
      real.set(given, path);
    }
    if (path.startsWith(root) && !path.includes("/node_modules/")) onRead(path, kind);
  };
  const wrap = (target: Record<string, unknown>, name: string, kind: ReadKind) => {
    const original = target[name];
    if (typeof original !== "function") return;
    target[name] = function (this: unknown, ...args: unknown[]) {
      note(args[0], kind);
      return (original as (...a: unknown[]) => unknown).apply(this, args);
    };
  };
  for (const [name, kind] of FUNCTIONS) {
    wrap(fs as unknown as Record<string, unknown>, name, kind);
    wrap(fs.promises as unknown as Record<string, unknown>, name, kind);
  }
  // `import { readFileSync } from "node:fs"` binds to the ES module view: bring it up to date.
  syncBuiltinESMExports();
}
