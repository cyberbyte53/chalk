import { createHash } from "node:crypto";
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
  /** node → nodes it uses: the same edges, the other way. */
  private readonly uses = new Map<string, Set<string>>();
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
    const forward = this.uses.get(user) ?? new Set<string>();
    forward.add(used);
    this.uses.set(user, forward);
  }

  /**
   * Everything these nodes use, directly or not, them included; a declaration brings its file's
   * own top-level statements (they run when the file is loaded).
   */
  dependenciesOf(nodes: Iterable<string>): Set<string> {
    const seen = new Set<string>();
    const todo = [...nodes];
    while (todo.length > 0) {
      const n = todo.pop() as string;
      if (seen.has(n)) continue;
      seen.add(n);
      const file = n.slice(0, n.indexOf("#"));
      if (!seen.has(`${file}#`)) todo.push(`${file}#`);
      for (const u of this.uses.get(n) ?? []) if (!seen.has(u)) todo.push(u);
    }
    return seen;
  }

  /**
   * A node's fingerprint now: a declaration's or a file's own statements' (facts.ts), or for a file
   * that isn't code (a stylesheet), its whole text. Undefined: no such node.
   */
  fingerprintOf(node: string): string | undefined {
    const [file = "", name = ""] = node.split("#");
    return fingerprintIn(this.facts.get(file), name, join(this.root, file));
  }

  /** Deep fingerprints, worked out once for the graph as it is (deepFingerprintOf). */
  private deep: Map<string, string> | undefined;

  /**
   * A node's deep fingerprint: its own code and the deep fingerprints of everything it uses, so it
   * changes when anything below it does (a Merkle hash, as git hashes a folder). Nodes that use each
   * other in a loop share one, made from all of their code. Two nodes with the same deep
   * fingerprint run the same code.
   */
  deepFingerprintOf(node: string): string {
    this.deep ??= this.deepFingerprints();
    return this.deep.get(node) ?? this.deepFingerprints([node]).get(node) ?? "-";
  }

  /** What a node depends on directly: what it uses, and its file's own statements. */
  private directOf(n: string): string[] {
    const file = n.slice(0, n.indexOf("#"));
    const out = [...(this.uses.get(n) ?? [])];
    if (n !== `${file}#`) out.push(`${file}#`);
    return out;
  }

  /** Deep fingerprints for every node reached from these (default: all), loops found by Tarjan's. */
  private deepFingerprints(from?: readonly string[]): Map<string, string> {
    const starts = from ?? [...new Set([...this.uses.keys(), ...this.users.keys()])];
    const out = new Map<string, string>();
    const index = new Map<string, number>();
    const low = new Map<string, number>();
    const stack: string[] = [];
    const onStack = new Set<string>();
    let next = 0;
    const own = (n: string) => this.fingerprintOf(n) ?? "-";
    const close = (root: string) => {
      const loop: string[] = [];
      let n: string;
      do {
        n = stack.pop() as string;
        onStack.delete(n);
        loop.push(n);
      } while (n !== root);
      const members = new Set(loop);
      const below = [...members]
        .flatMap((m) => this.directOf(m))
        .filter((d) => !members.has(d))
        .map((d) => `${d}=${out.get(d) ?? "-"}`);
      const hash = createHash("sha256")
        .update(
          [...members]
            .map((m) => `${m}=${own(m)}`)
            .sort()
            .join("\n"),
        )
        .update("\n--\n")
        .update([...new Set(below)].sort().join("\n"))
        .digest("hex")
        .slice(0, 16);
      for (const m of members) out.set(m, hash);
    };
    // Tarjan's strongly connected components, without recursion (the graph can be deep).
    for (const start of starts) {
      if (index.has(start)) continue;
      const frames: { n: string; deps: string[]; i: number }[] = [];
      const enter = (n: string) => {
        index.set(n, next);
        low.set(n, next);
        next++;
        stack.push(n);
        onStack.add(n);
        frames.push({ n, deps: this.directOf(n), i: 0 });
      };
      enter(start);
      while (frames.length > 0) {
        const f = frames[frames.length - 1] as (typeof frames)[number];
        if (f.i < f.deps.length) {
          const d = f.deps[f.i++] as string;
          if (!index.has(d)) enter(d);
          else if (onStack.has(d))
            low.set(f.n, Math.min(low.get(f.n) as number, index.get(d) as number));
          continue;
        }
        frames.pop();
        const parent = frames[frames.length - 1];
        if (parent !== undefined)
          low.set(parent.n, Math.min(low.get(parent.n) as number, low.get(f.n) as number));
        if (low.get(f.n) === index.get(f.n)) close(f.n);
      }
    }
    return out;
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
/** The source files the graph reads. */
export const graphSources = (root: string): string[] => sourcesUnder(root, GRAPH_FOLDERS);

export function codeGraph(root: string, files: readonly string[] = graphSources(root)): CodeGraph {
  const cache = new FactsCache(join(root, "node_modules", ".cache", "chalk-reach", "facts.json"));
  return new CodeGraph(root, files, cache);
}

/** A node's fingerprint in a file's facts, or its whole text when it isn't code. */
export function fingerprintIn(
  facts: Facts | undefined,
  name: string,
  file: string,
  text?: string,
): string | undefined {
  if (facts === undefined) {
    const body = text ?? (existsSync(file) ? readFileSync(file, "utf8") : undefined);
    return body === undefined
      ? undefined
      : createHash("sha256").update(body).digest("hex").slice(0, 16);
  }
  if (name === "") return facts.module.hash;
  return facts.decls[name]?.hash;
}
