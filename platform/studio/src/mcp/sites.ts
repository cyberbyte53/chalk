import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

/**
 * Where a prop's code is: its package (from library/catalogue.md) and the line each of its actions
 * is written at. Read from the package's source, for the answers of `look` and `play`.
 */

/** The package folder a prop type is defined in (library/props/<name>), from the catalogue. */
export function packageOfType(root: string, type: string): string | undefined {
  const catalogue = join(root, "library", "catalogue.md");
  if (!existsSync(catalogue)) return undefined;
  let current: string | undefined;
  for (const line of readFileSync(catalogue, "utf8").split("\n")) {
    const section = /^## `([^`]+)`/.exec(line);
    if (section) current = section[1];
    if (current !== undefined && line.startsWith(`| \`${type}\``))
      return `library/props/${current}`;
  }
  return undefined;
}

/** Files inside one prop package that `file` reaches by relative imports, it included. */
function closureIn(dir: string, file: string, seen = new Set<string>()): Set<string> {
  if (seen.has(file) || !existsSync(file)) return seen;
  seen.add(file);
  const code = readFileSync(file, "utf8");
  for (const m of code.matchAll(/(?:from|import)\s*["'](\.{1,2}\/[^"']+)["']/g)) {
    const spec = resolve(dirname(file), m[1] ?? "");
    const next = [spec, `${spec}.ts`, `${spec}.tsx`, join(spec, "index.ts")].find(
      (f) => existsSync(f) && statSync(f).isFile() && f.startsWith(dir),
    );
    if (next !== undefined) closureIn(dir, next, seen);
  }
  return seen;
}

/**
 * Where each of a prop's actions is written (file:line), from its package's source: the line that
 * keys it (`[NumberLineAction.ZoomIn]: on…(`, or `zoomIn: act(`), among the files its definition
 * reaches. An action written in more than one of them is left out: exact, or nothing.
 */
const actionSitesCache = new Map<string, Map<string, string>>();
export function actionSites(root: string, type: string): Map<string, string> {
  const cached = actionSitesCache.get(`${root}:${type}`);
  if (cached !== undefined) return cached;
  const out = new Map<string, string>();
  actionSitesCache.set(`${root}:${type}`, out);
  const pkg = packageOfType(root, type);
  if (pkg === undefined) return out;
  const src = join(root, pkg, "src");
  if (!existsSync(src)) return out;
  const files = readdirSync(src)
    .filter((n) => /\.tsx?$/.test(n) && !n.includes(".test."))
    .map((n) => join(src, n));
  const defFile = files.find((f) =>
    new RegExp(`\\btype:\\s*"${type}"`).test(readFileSync(f, "utf8")),
  );
  if (defFile === undefined) return out;
  const reach = closureIn(src, defFile);
  // Name maps (`export const XAction = { ZoomIn: "zoomIn" }`) in the package, to read keys.
  const names = new Map<string, string>();
  for (const f of files)
    for (const m of readFileSync(f, "utf8").matchAll(/export const (\w+) = \{([^}]*)\}/g))
      for (const e of (m[2] ?? "").matchAll(/(\w+):\s*"([^"]+)"/g))
        names.set(`${m[1]}.${e[1]}`, e[2] ?? "");
  const found = new Map<string, string[]>();
  for (const f of reach) {
    readFileSync(f, "utf8")
      .split("\n")
      .forEach((line, i) => {
        const m = /^\s*(?:\[(\w+\.\w+)\]|(\w+)):\s*(?:act|on\w*)\(\{?\s*$/.exec(line);
        const action = m === null ? undefined : m[1] !== undefined ? names.get(m[1]) : m[2];
        if (action !== undefined)
          found.set(action, [...(found.get(action) ?? []), `${relative(root, f)}:${i + 1}`]);
      });
  }
  for (const [action, sites] of found) if (sites.length === 1) out.set(action, sites[0] as string);
  return out;
}
