import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { type Facts, FactsCache, type Range, sourcesUnder } from "./facts";

/**
 * Who uses what, across the repo's code: a node is one top-level declaration (`file#name`), or a
 * file's own top-level statements (`file#`); an edge says one uses another, followed through
 * imports and re-exports (an index that re-exports a hundred things joins nothing together).
 * Paths are from the repo root. Built from syntax only, so it errs on the side of more: a name
 * that is shadowed locally still counts as a use.
 */
export class CodeGraph {
  /** node → nodes that use it. */
  private readonly users = new Map<string, Set<string>>();
  readonly facts = new Map<string, Facts>();
  /** Workspace package name → its folder (from the root). */
  private readonly packages = new Map<string, { dir: string; exports: Record<string, string> }>();

  constructor(
    readonly root: string,
    files: readonly string[],
    cache: FactsCache,
  ) {
    this.readPackages();
    for (const abs of files) {
      const facts = cache.get(abs);
      if (facts !== undefined) this.facts.set(relative(root, abs), facts);
    }
    for (const [file, facts] of this.facts) {
      for (const [name, decl] of Object.entries(facts.decls))
        for (const used of decl.uses)
          for (const n of this.nodesFor(file, used)) this.link(`${file}#${name}`, n);
      for (const used of facts.module.uses)
        for (const n of this.nodesFor(file, used)) this.link(`${file}#`, n);
      for (const spec of facts.loads) {
        const target = this.resolveSpec(file, spec);
        if (target === undefined) continue;
        this.link(`${file}#`, `${target}#`);
        for (const n of this.allExports(target)) this.link(`${file}#`, n);
      }
    }
    cache.save();
  }

  private link(user: string, used: string): void {
    if (user === used) return;
    const set = this.users.get(used) ?? new Set<string>();
    set.add(user);
    this.users.set(used, set);
  }

  /** Every node that uses any of these, directly or not, them included. */
  usersOf(nodes: Iterable<string>): Set<string> {
    const seen = new Set<string>();
    const todo = [...nodes];
    while (todo.length > 0) {
      const n = todo.pop() as string;
      if (seen.has(n)) continue;
      seen.add(n);
      for (const u of this.users.get(n) ?? []) if (!seen.has(u)) todo.push(u);
    }
    return seen;
  }

  /** The nodes a name used in `file` stands for. */
  nodesFor(file: string, name: string): string[] {
    const facts = this.facts.get(file);
    if (facts === undefined) return [];
    if (facts.decls[name] !== undefined) return [`${file}#${name}`];
    const imported = facts.imports[name];
    if (imported === undefined) return [];
    const target = this.resolveSpec(file, imported.from);
    if (target === undefined) return [];
    return imported.name === "*"
      ? this.allExports(target)
      : [this.exportNode(target, imported.name)];
  }

  /** The node an exported name of a file is, through re-exports. */
  exportNode(file: string, name: string, seen = new Set<string>()): string {
    const key = `${file}#${name}`;
    if (seen.has(key)) return `${file}#`;
    seen.add(key);
    const facts = this.facts.get(file);
    if (facts === undefined) return `${file}#`;
    const exp = facts.exports[name];
    if (exp !== undefined && "local" in exp) {
      if (facts.decls[exp.local] !== undefined) return `${file}#${exp.local}`;
      const via = facts.imports[exp.local];
      const target = via === undefined ? undefined : this.resolveSpec(file, via.from);
      if (via !== undefined && target !== undefined)
        return via.name === "*" ? `${target}#` : this.exportNode(target, via.name, seen);
      return `${file}#`;
    }
    if (exp !== undefined && "from" in exp) {
      const target = this.resolveSpec(file, exp.from);
      if (target === undefined) return `${file}#`;
      return exp.name === "*" ? `${target}#` : this.exportNode(target, exp.name, seen);
    }
    if (name !== "default")
      for (const spec of facts.stars) {
        const target = this.resolveSpec(file, spec);
        if (target === undefined) continue;
        const found = this.exportNode(target, name, seen);
        if (!found.endsWith("#")) return found;
      }
    return `${file}#`;
  }

  /** Every node a file exports (for `import * as x` and `import("…")`). */
  allExports(file: string, seen = new Set<string>()): string[] {
    if (seen.has(file)) return [];
    seen.add(file);
    const facts = this.facts.get(file);
    if (facts === undefined) return [`${file}#`];
    const out = Object.keys(facts.exports).map((n) => this.exportNode(file, n));
    for (const spec of facts.stars) {
      const target = this.resolveSpec(file, spec);
      if (target !== undefined) out.push(...this.allExports(target, seen));
    }
    return [...new Set([...out, `${file}#`])];
  }

  /** The repo file an import names, or undefined for a library outside the repo. */
  resolveSpec(fromFile: string, spec: string): string | undefined {
    const tryFile = (abs: string): string | undefined => {
      const candidates = [
        abs,
        abs.replace(/\.js$/, ".ts"),
        abs.replace(/\.js$/, ".tsx"),
        `${abs}.ts`,
        `${abs}.tsx`,
        join(abs, "index.ts"),
        join(abs, "index.tsx"),
      ];
      const hit = candidates.find((c) => existsSync(c) && statSync(c).isFile());
      return hit === undefined ? undefined : relative(this.root, hit);
    };
    if (spec.startsWith(".")) return tryFile(resolve(this.root, dirname(fromFile), spec));
    const names = [...this.packages.keys()].filter((n) => spec === n || spec.startsWith(`${n}/`));
    const name = names.sort((a, b) => b.length - a.length)[0];
    if (name === undefined) return undefined;
    const pkg = this.packages.get(name);
    if (pkg === undefined) return undefined;
    const sub = `.${spec.slice(name.length)}`;
    const target = pkg.exports[sub === "." ? "." : sub];
    if (target !== undefined) return tryFile(join(this.root, pkg.dir, target));
    return tryFile(join(this.root, pkg.dir, sub === "." ? "src/index.ts" : join("src", sub)));
  }

  private readPackages(): void {
    const dirs = ["platform/packages", "platform/apps", "library/props"].flatMap((d) =>
      existsSync(join(this.root, d)) ? readdirSync(join(this.root, d)).map((n) => `${d}/${n}`) : [],
    );
    dirs.push("platform/studio", "library/patterns", "library/registry", "platform/content-source");
    for (const dir of dirs) {
      const file = join(this.root, dir, "package.json");
      if (!existsSync(file)) continue;
      const json = JSON.parse(readFileSync(file, "utf8")) as { name?: string; exports?: unknown };
      if (json.name === undefined) continue;
      const exports: Record<string, string> = {};
      const raw = json.exports;
      if (typeof raw === "string") exports["."] = raw;
      else if (raw !== null && typeof raw === "object")
        for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
          const value =
            typeof v === "string"
              ? v
              : v !== null && typeof v === "object"
                ? ((v as Record<string, unknown>).import ??
                  (v as Record<string, unknown>).default ??
                  Object.values(v as Record<string, unknown>).find((x) => typeof x === "string"))
                : undefined;
          if (typeof value === "string") exports[k] = value;
        }
      this.packages.set(json.name, { dir, exports });
    }
  }

  /**
   * The nodes a change to these lines of a file touches: the declarations they fall in (types
   * aside), the file's own statements if they fall there or on an import. `undefined`: the whole file.
   */
  touched(file: string, lines: readonly Range[] | undefined): string[] {
    const facts = this.facts.get(file);
    if (facts === undefined) return [`${file}#`];
    const hits = (r: Range) =>
      lines === undefined || lines.some((l) => l[0] <= r[1] && r[0] <= l[1]);
    const out: string[] = [];
    for (const [name, decl] of Object.entries(facts.decls))
      if (!decl.isType && hits(decl.lines)) out.push(`${file}#${name}`);
    if (facts.module.lines.some(hits)) out.push(`${file}#`);
    // A changed import changes what the code using it gets.
    const changedImports = new Set(
      Object.entries(facts.imports)
        .filter(([, i]) => facts.importLines.some((r) => r[0] === i.line && hits(r)))
        .map(([local]) => local),
    );
    if (changedImports.size > 0) {
      if (facts.module.uses.some((u) => changedImports.has(u))) out.push(`${file}#`);
      for (const [name, decl] of Object.entries(facts.decls))
        if (!decl.isType && decl.uses.some((u) => changedImports.has(u)))
          out.push(`${file}#${name}`);
    }
    if (facts.importLines.some(hits) && changedImports.size === 0) out.push(`${file}#`);
    return [...new Set(out)];
  }
}

/** The folders the graph reads: everything whose code can change what a board is or shows. */
export const GRAPH_FOLDERS = ["content", "library", "platform/packages"];
/** Code no board uses: the props parked until they're moved to the contract. */
export const GRAPH_SKIPS = ["library/props-later"];

/** The source files the graph reads. */
export const graphSources = (root: string): string[] =>
  sourcesUnder(root, GRAPH_FOLDERS, GRAPH_SKIPS);

export function codeGraph(root: string, files: readonly string[] = graphSources(root)): CodeGraph {
  const cache = new FactsCache(join(root, "node_modules", ".cache", "chalk-reach", "facts.json"));
  return new CodeGraph(root, files, cache);
}
