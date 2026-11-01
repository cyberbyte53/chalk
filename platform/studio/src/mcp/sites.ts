import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

/**
 * Where a prop's code is: its package (from library/catalogue.md) and the line each of its actions
 * is written at. Read from the package's source, for the answers of `show`.
 */

/** The package folder a prop type is defined in (library/props/<name>), from its address in the catalogue. */
export function packageOfType(root: string, type: string): string | undefined {
  const catalogue = join(root, "library", "catalogue.md");
  if (!existsSync(catalogue)) return undefined;
  for (const line of readFileSync(catalogue, "utf8").split("\n")) {
    const m = /^`library\/props\/([^/`]+)\/([^`]+)`/.exec(line);
    if (m?.[2] === type) return `library/props/${m[1]}`;
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
 * keys it (`zoomIn: act(`), or defines it before (`const arrive = act(`), among the files its
 * definition reaches. An action written in more than one of them is left out: exact, or nothing.
 */
const actionSitesCache = new Map<string, Map<string, string>>();
/** The file a prop type is defined in (the one with `type: "<type>"`), repo-relative. */
export function defFileOf(root: string, type: string): string | undefined {
  const pkg = packageOfType(root, type);
  if (pkg === undefined) return undefined;
  const src = join(root, pkg, "src");
  if (!existsSync(src)) return undefined;
  const found = readdirSync(src)
    .filter((n) => /\.tsx?$/.test(n) && !n.includes(".test."))
    .map((n) => join(src, n))
    .find((f) => new RegExp(`\\btype:\\s*"${type}"`).test(readFileSync(f, "utf8")));
  return found === undefined ? undefined : relative(root, found);
}

/** Where a prop type is defined: file:line of its `type: "<type>"`. */
export function typeSite(root: string, type: string): string | undefined {
  const file = defFileOf(root, type);
  if (file === undefined) return undefined;
  const line = readFileSync(join(root, file), "utf8")
    .split("\n")
    .findIndex((l) => new RegExp(`\\btype:\\s*"${type}"`).test(l));
  return line < 0 ? file : `${file}:${line + 1}`;
}

/** Where a prop type's defaults are written: file:line of its `defaults:`. */
export function defaultsSite(root: string, type: string): string | undefined {
  const file = defFileOf(root, type);
  if (file === undefined) return undefined;
  const line = readFileSync(join(root, file), "utf8")
    .split("\n")
    .findIndex((l) => /^\s*defaults:/.test(l));
  return line < 0 ? file : `${file}:${line + 1}`;
}

export function actionSites(root: string, type: string): Map<string, string> {
  const cached = actionSitesCache.get(`${root}:${type}`);
  if (cached !== undefined) return cached;
  const out = new Map<string, string>();
  actionSitesCache.set(`${root}:${type}`, out);
  const rel = defFileOf(root, type);
  if (rel === undefined) return out;
  const defFile = join(root, rel);
  const src = join(root, packageOfType(root, type) ?? "", "src");
  const reach = closureIn(src, defFile);
  const found = new Map<string, string[]>();
  for (const f of reach) {
    readFileSync(f, "utf8")
      .split("\n")
      .forEach((line, i) => {
        const action = /^\s*(?:const\s+)?(\w+)\s*[:=]\s*act\w*\(\{?\s*$/.exec(line)?.[1];
        if (action !== undefined)
          found.set(action, [...(found.get(action) ?? []), `${relative(root, f)}:${i + 1}`]);
      });
  }
  for (const [action, sites] of found) if (sites.length === 1) out.set(action, sites[0] as string);
  return out;
}
