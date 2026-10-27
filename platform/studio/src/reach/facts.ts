import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import ts from "typescript";

/**
 * What one TypeScript file declares and uses, read from its syntax (no type checking): enough to
 * follow a change from the lines it touched to the code that uses them, across files.
 *
 * Lines are from 1, ranges inclusive, and cover code only: a change to comments or blank lines
 * touches nothing.
 */
export type Facts = {
  /** Top-level declarations by name. `isType`: types and interfaces, which change nothing when run. */
  decls: Record<string, { lines: Range; isType: boolean; uses: string[] }>;
  /** What the file's own top-level statements run (anything that isn't a declaration). */
  module: { lines: Range[]; uses: string[] };
  /** Local name → where it comes from (`name`: "*" for `import * as x`) and the import's first line. */
  imports: Record<string, { from: string; name: string; line: number }>;
  /** Lines of import statements. */
  importLines: Range[];
  /** Imports run for their effect only (`import "./styles.css"`), and `import("…")` calls. */
  loads: string[];
  /** Exported name → a local name, or a name re-exported from another module. */
  exports: Record<string, { local: string } | { from: string; name: string }>;
  /** `export * from "…"`. */
  stars: string[];
  /** Every function's lines (declarations, arrows, methods). */
  functions: Range[];
  /** Every call's lines. */
  calls: Range[];
  /** Where each top-level or imported name is used: [line, name]. */
  uses: [number, string][];
};

export type Range = readonly [number, number];

/** Reads a file's facts. */
export function factsOf(file: string, text: string): Facts {
  const kind = file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const lineOf = (pos: number) => sf.getLineAndCharacterOfPosition(pos).line + 1;
  const range = (node: ts.Node): Range => [lineOf(node.getStart(sf)), lineOf(node.end)];

  const facts: Facts = {
    decls: {},
    module: { lines: [], uses: [] },
    imports: {},
    importLines: [],
    loads: [],
    exports: {},
    stars: [],
    functions: [],
    calls: [],
    uses: [],
  };
  const isExported = (node: ts.Node) =>
    ts.canHaveModifiers(node) &&
    (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
  const isDefault = (node: ts.Node) =>
    ts.canHaveModifiers(node) &&
    (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);

  /** Names a subtree mentions (not property names: `a.b`'s b, `{ b: 1 }`'s b). */
  const namesIn = (node: ts.Node): string[] => {
    const out = new Set<string>();
    const visit = (n: ts.Node) => {
      if (ts.isIdentifier(n)) {
        const p = n.parent;
        const isProperty =
          (p !== undefined && ts.isPropertyAccessExpression(p) && p.name === n) ||
          (p !== undefined && ts.isPropertyAssignment(p) && p.name === n) ||
          (p !== undefined && ts.isQualifiedName(p) && p.right === n) ||
          (p !== undefined && ts.isJsxAttribute(p) && p.name === n);
        if (!isProperty) out.add(n.text);
      }
      if (
        ts.isCallExpression(n) &&
        n.expression.kind === ts.SyntaxKind.ImportKeyword &&
        n.arguments[0] !== undefined &&
        ts.isStringLiteral(n.arguments[0])
      )
        facts.loads.push(n.arguments[0].text);
      ts.forEachChild(n, visit);
    };
    visit(node);
    return [...out];
  };

  const bindingNames = (name: ts.BindingName): string[] =>
    ts.isIdentifier(name)
      ? [name.text]
      : name.elements.flatMap((e) => (ts.isOmittedExpression(e) ? [] : bindingNames(e.name)));

  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st)) {
      facts.importLines.push(range(st));
      const from = (st.moduleSpecifier as ts.StringLiteral).text;
      const clause = st.importClause;
      if (clause === undefined) {
        facts.loads.push(from);
        continue;
      }
      if (clause.isTypeOnly) continue;
      const line = range(st)[0];
      if (clause.name !== undefined)
        facts.imports[clause.name.text] = { from, name: "default", line };
      const bindings = clause.namedBindings;
      if (bindings !== undefined && ts.isNamespaceImport(bindings))
        facts.imports[bindings.name.text] = { from, name: "*", line };
      else if (bindings !== undefined)
        for (const el of bindings.elements)
          if (!el.isTypeOnly)
            facts.imports[el.name.text] = { from, name: (el.propertyName ?? el.name).text, line };
      continue;
    }
    if (ts.isExportDeclaration(st)) {
      if (st.isTypeOnly) continue;
      const from =
        st.moduleSpecifier !== undefined
          ? (st.moduleSpecifier as ts.StringLiteral).text
          : undefined;
      if (st.exportClause === undefined) {
        if (from !== undefined) facts.stars.push(from);
      } else if (ts.isNamedExports(st.exportClause)) {
        for (const el of st.exportClause.elements) {
          if (el.isTypeOnly) continue;
          const inner = (el.propertyName ?? el.name).text;
          facts.exports[el.name.text] =
            from === undefined ? { local: inner } : { from, name: inner };
        }
      } else if (from !== undefined) facts.exports[st.exportClause.name.text] = { from, name: "*" };
      continue;
    }
    const declare = (names: string[], isType: boolean) => {
      const uses = namesIn(st);
      for (const name of names) {
        facts.decls[name] = { lines: range(st), isType, uses };
        if (isExported(st)) facts.exports[isDefault(st) ? "default" : name] = { local: name };
      }
    };
    if (ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st))
      declare([st.name.text], true);
    else if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) && st.name !== undefined)
      declare([st.name.text], false);
    else if (ts.isEnumDeclaration(st) || ts.isModuleDeclaration(st))
      declare([(st.name as ts.Identifier).text], false);
    else if (ts.isVariableStatement(st))
      declare(
        st.declarationList.declarations.flatMap((d) => bindingNames(d.name)),
        false,
      );
    else if (ts.isExportAssignment(st)) {
      facts.decls.default = { lines: range(st), isType: false, uses: namesIn(st) };
      facts.exports.default = { local: "default" };
    } else if (
      (ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) &&
      st.name === undefined
    ) {
      facts.decls.default = { lines: range(st), isType: false, uses: namesIn(st) };
      facts.exports.default = { local: "default" };
    } else {
      facts.module.lines.push(range(st));
      facts.module.uses.push(...namesIn(st));
    }
  }

  const known = new Set([...Object.keys(facts.decls), ...Object.keys(facts.imports)]);
  for (const decl of Object.values(facts.decls)) decl.uses = decl.uses.filter((n) => known.has(n));
  facts.module.uses = [...new Set(facts.module.uses.filter((n) => known.has(n)))];

  const walk = (n: ts.Node) => {
    if (
      ts.isFunctionDeclaration(n) ||
      ts.isFunctionExpression(n) ||
      ts.isArrowFunction(n) ||
      ts.isMethodDeclaration(n) ||
      ts.isGetAccessor(n) ||
      ts.isSetAccessor(n) ||
      ts.isConstructorDeclaration(n)
    )
      facts.functions.push(range(n));
    if (ts.isCallExpression(n) || ts.isNewExpression(n) || ts.isTaggedTemplateExpression(n))
      facts.calls.push(range(n));
    if (ts.isIdentifier(n) && known.has(n.text)) facts.uses.push([lineOf(n.getStart(sf)), n.text]);
    ts.forEachChild(n, walk);
  };
  walk(sf);
  facts.loads = [...new Set(facts.loads)];
  return facts;
}

/** Facts for many files, read again only when a file changed (kept on disk between runs). */
export class FactsCache {
  private readonly entries = new Map<string, { key: string; facts: Facts }>();
  private isDirty = false;

  constructor(private readonly file: string) {
    try {
      const saved = JSON.parse(readFileSync(file, "utf8")) as {
        version: string;
        entries: [string, { key: string; facts: Facts }][];
      };
      if (saved.version === FORMAT)
        for (const [path, e] of saved.entries) this.entries.set(path, e);
    } catch {
      // nothing kept yet
    }
  }

  /** A file's facts, or undefined if it is gone. */
  get(path: string): Facts | undefined {
    let stat: ReturnType<typeof statSync>;
    try {
      stat = statSync(path);
    } catch {
      return undefined;
    }
    const key = `${stat.mtimeMs}:${stat.size}`;
    const known = this.entries.get(path);
    if (known?.key === key) return known.facts;
    const text = readFileSync(path, "utf8");
    // Same bytes under a new time (a checkout): keyed by content too.
    const hash = createHash("sha1").update(text).digest("hex");
    if (known?.key.endsWith(hash)) {
      this.entries.set(path, { key: `${key}:${hash}`, facts: known.facts });
      return known.facts;
    }
    const facts = factsOf(path, text);
    this.entries.set(path, { key: `${key}:${hash}`, facts });
    this.isDirty = true;
    return facts;
  }

  /** Writes what was read, if anything new was. */
  save(): void {
    if (!this.isDirty) return;
    mkdirSync(dirname(this.file), { recursive: true });
    writeFileSync(this.file, JSON.stringify({ version: FORMAT, entries: [...this.entries] }));
    this.isDirty = false;
  }
}

/** Bump when Facts changes shape. */
const FORMAT = "1";

/** Every TypeScript source file under these folders (not tests, not node_modules). */
export function sourcesUnder(root: string, folders: readonly string[]): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      if (name === "node_modules" || name.startsWith(".")) continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (
        /\.tsx?$/.test(name) &&
        !/\.(test|spec)\.tsx?$/.test(name) &&
        !name.endsWith(".d.ts")
      )
        out.push(path);
    }
  };
  for (const f of folders) walk(join(root, f));
  return out;
}
