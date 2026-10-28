import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { BoardReach, Reach } from "../content/build";
import type { Range } from "./facts";
import { type CodeGraph, codeGraph, graphSources } from "./graph";

/**
 * What a change reaches: the pieces (`book/chapter/lesson/page#piece`) it can make look or behave
 * differently, worked out from what the build recorded (build/reach.json: every line of the
 * author's code each piece was made through) and from who uses what in the code (graph.ts). Nothing
 * is declared by hand.
 *
 * A change reaches a piece when it touches
 * - a line the piece was made through, in its scope: the whole function, if the function makes
 *   pieces on one line only (a kit's or pattern's helper); else just the call on that line (a
 *   page's builder makes many pieces, one per call);
 * - code that line's scope uses, directly or not, in any file;
 * - its prop type's definition or view, or code they use;
 * - the player's code that draws every board (then it reaches everything).
 * A change on a board's builder outside every piece's call, or a question's row, reaches the whole
 * board.
 */

/** One changed file: the lines changed (as the file is now, and as it was), or all of it. */
export type Change = { file: string; lines?: Range[]; was?: Range[]; isGone?: boolean };

/** A piece reached, and why: the line or the prop type that connects it to the change. */
export type Hit = { board: string; piece: string; type?: string; why: string };

export type Reached = {
  hits: Hit[];
  /** Set when the change reaches every board: why. */
  everything?: string;
  /** What the change touched, for saying why: `file#declaration`. */
  touched: string[];
  /** Prop types reached through their code. */
  types: string[];
};

/** What draws every board: a change reaching these reaches everything. */
const DRAWS_EVERY_BOARD = [
  "platform/packages/player/src/board-player.tsx#BoardPlayer",
  "platform/packages/player/src/lesson-player.tsx#LessonPlayer",
];

/** Code that builds every board: a change here reaches everything. */
const BUILDS_EVERY_BOARD = ["platform/studio/src/content/", "platform/content-source/"];

export class ReachIndex {
  private readonly scopes = new Map<string, Range>();
  private readonly frameLines = new Map<string, Set<number>>();

  constructor(
    readonly root: string,
    readonly built: Reach,
    readonly graph: CodeGraph,
  ) {
    for (const b of Object.values(built.boards))
      for (const frame of allFrames(b)) {
        const [file, line] = splitFrame(frame);
        const set = this.frameLines.get(file) ?? new Set<number>();
        set.add(line);
        this.frameLines.set(file, set);
      }
  }

  /**
   * The lines a frame stands for: the function around it if that function makes pieces on one line
   * only, else the call on its line (or the line itself).
   */
  scopeOf(file: string, line: number): Range {
    const key = `${file}:${line}`;
    const known = this.scopes.get(key);
    if (known !== undefined) return known;
    const facts = this.graph.facts.get(file);
    let scope: Range = [line, line];
    if (facts !== undefined) {
      const around = facts.functions
        .filter((r) => r[0] <= line && line <= r[1])
        .sort((a, b) => a[1] - a[0] - (b[1] - b[0]))[0];
      const lines = this.frameLines.get(file) ?? new Set<number>();
      const isOneLine =
        around !== undefined &&
        [...lines].filter((l) => around[0] <= l && l <= around[1]).length === 1;
      if (around !== undefined && isOneLine) scope = around;
      else {
        const call = facts.calls
          .filter((r) => r[0] === line)
          .sort((a, b) => a[1] - a[0] - (b[1] - b[0]))[0];
        if (call !== undefined) scope = call;
      }
    }
    this.scopes.set(key, scope);
    return scope;
  }

  /** Every placed piece of these prop types. */
  ofTypes(types: readonly string[]): Hit[] {
    const wanted = new Set(types);
    const out: Hit[] = [];
    for (const [board, b] of Object.entries(this.built.boards))
      for (const [piece, p] of Object.entries(b.pieces))
        if (p.type !== undefined && wanted.has(p.type))
          out.push({ board, piece, type: p.type, why: `its prop, ${p.type}` });
    return out;
  }

  /** What a set of changes reaches. */
  reach(changes: readonly Change[]): Reached {
    const touched = new Set<string>();
    const positional = new Map<string, Range[]>();
    const wholeBoards = new Map<string, string>();
    const typesByCss = new Set<string>();
    let everything: string | undefined;
    const boards = Object.entries(this.built.boards);
    for (const ch of changes) {
      const f = ch.file;
      if (BUILDS_EVERY_BOARD.some((p) => f.startsWith(p)) && /\.tsx?$/.test(f)) {
        everything ??= `${f} builds every board`;
        continue;
      }
      if (
        /\.tsx?$/.test(f) &&
        !/\.(test|spec)\.tsx?$/.test(f) &&
        !ch.isGone &&
        this.graph.facts.has(f)
      ) {
        for (const n of this.graph.touched(f, ch.lines)) touched.add(n);
        positional.set(f, [...(ch.lines ?? [[1, Number.MAX_SAFE_INTEGER]]), ...(ch.was ?? [])]);
        continue;
      }
      if (/\.tsx?$/.test(f) && f.startsWith("content/")) {
        // A file that is gone (or not read yet): every piece made through it, every board whose code imported it.
        positional.set(f, [[1, Number.MAX_SAFE_INTEGER]]);
        for (const [board, b] of boards)
          if (b.module === f || (this.built.modules[b.module] ?? []).includes(f))
            wholeBoards.set(board, `imports ${f}`);
        continue;
      }
      if (/\.css$/.test(f)) {
        const pkg = /^library\/props\/[^/]+\//.exec(f)?.[0];
        if (pkg !== undefined) for (const t of this.typesIn(pkg)) typesByCss.add(t);
        else if (f.startsWith("platform/packages/") || f.startsWith("platform/apps/learner/"))
          everything ??= `${f} styles every board`;
        continue;
      }
      if (f.startsWith("content/") && f.endsWith("params.yaml")) {
        for (const [board, b] of boards) {
          if (b.rows === undefined) continue;
          const [file, from, to] = splitRows(b.rows);
          if (file !== f) continue;
          const lines = [...(ch.lines ?? [[1, Number.MAX_SAFE_INTEGER]]), ...(ch.was ?? [])];
          if (lines.some((l) => l[0] <= to && from <= l[1]))
            wholeBoards.set(board, `its row in ${f}`);
        }
        continue;
      }
      if (f.startsWith("content/") && !/comments\.yaml$|\/runs\/|\/source\/|plan\.md$/.test(f)) {
        const dir = f.slice(0, f.lastIndexOf("/") + 1);
        for (const [board, b] of boards)
          if (b.module.startsWith(dir)) wholeBoards.set(board, `${f} is in its folder`);
      }
    }

    const used = this.graph.usersOf(touched);
    const draws = DRAWS_EVERY_BOARD.find((n) => used.has(n));
    if (draws !== undefined) everything ??= `${[...touched].join(", ")} is used by ${draws}`;
    const types = new Set(typesByCss);
    for (const [type, roots] of this.typeRoots())
      if (roots.some((r) => used.has(r))) types.add(type);

    const hits: Hit[] = [];
    const isUsedIn = (file: string, scope: Range, outside: Range[] = []): boolean => {
      const facts = this.graph.facts.get(file);
      if (facts === undefined) return false;
      return facts.uses.some(
        ([line, name]) =>
          scope[0] <= line &&
          line <= scope[1] &&
          !outside.some((o) => o[0] <= line && line <= o[1]) &&
          this.graph.nodesFor(file, name).some((n) => used.has(n) && !this.makesPieces(n)),
      );
    };
    const meets = (file: string, scope: Range, outside: Range[] = []): boolean =>
      (positional.get(file) ?? []).some(
        (l) =>
          l[0] <= scope[1] &&
          scope[0] <= l[1] &&
          // a change inside a piece's own call belongs to that piece
          !outside.some((o) => o[0] <= l[0] && l[1] <= o[1]),
      ) || isUsedIn(file, scope, outside);

    for (const [board, b] of boards) {
      // Props only: groups and spaces are the board's own arrangement.
      const pieces = Object.entries(b.pieces).filter(([, p]) => p.type !== undefined);
      let whole = everything ?? wholeBoards.get(board);
      if (whole === undefined && used.has(`${b.module}#`)) whole = `${b.module} runs changed code`;
      if (whole === undefined) {
        // The board's own builder: the page(...) call, or for a question its family's module.
        const own = (b.stack ?? []).find((fr) => splitFrame(fr)[0] === b.module);
        const scope: Range =
          own === undefined ? [1, Number.MAX_SAFE_INTEGER] : this.scopeOf(...splitFrame(own));
        const pieceScopes = Object.entries(b.pieces).flatMap(([, p]) =>
          p.stack
            .filter((fr) => splitFrame(fr)[0] === b.module)
            .map((fr) => this.scopeOf(...splitFrame(fr))),
        );
        if (meets(b.module, scope, pieceScopes))
          whole = `${b.module}:${scope[0]}-${scope[1]} (the board's own code)`;
      }
      for (const [name, p] of pieces) {
        if (whole !== undefined) {
          hits.push({ board, piece: name, ...(p.type ? { type: p.type } : {}), why: whole });
          continue;
        }
        if (p.type !== undefined && types.has(p.type)) {
          hits.push({ board, piece: name, type: p.type, why: `its prop, ${p.type}` });
          continue;
        }
        const frame = p.stack.find((fr) => {
          const [file, line] = splitFrame(fr);
          return meets(file, this.scopeOf(file, line));
        });
        if (frame !== undefined)
          hits.push({ board, piece: name, ...(p.type ? { type: p.type } : {}), why: frame });
      }
    }
    return {
      hits,
      ...(everything === undefined ? {} : { everything }),
      touched: [...touched],
      types: [...types].sort(),
    };
  }

  /**
   * Whether a declaration places pieces itself (a line it was made through is inside it): what it
   * places is then followed through those lines, so using it isn't reaching everything around.
   */
  private makesPieces(node: string): boolean {
    const [file = "", name = ""] = node.split("#");
    const decl = this.graph.facts.get(file)?.decls[name];
    const lines = this.frameLines.get(file);
    if (decl === undefined || lines === undefined) return false;
    for (const l of lines) if (decl.lines[0] <= l && l <= decl.lines[1]) return true;
    return false;
  }

  private rootsCache: Map<string, string[]> | undefined;

  /** Each prop type → its definition's and its view's nodes, from each package's `{ def, View }` pairs. */
  typeRoots(): Map<string, string[]> {
    if (this.rootsCache !== undefined) return this.rootsCache;
    const out = new Map<string, string[]>();
    for (const file of this.graph.facts.keys()) {
      if (!file.startsWith("library/props/")) continue;
      const text = safeRead(join(this.root, file));
      const PAIR = /def:\s*(?:asAnyProp\()?\s*(\w+)\s*\)?\s*,\s*View:\s*(\w+)/g;
      const pairLines = [...text.matchAll(PAIR)].map(
        (m) => text.slice(0, m.index).split("\n").length,
      );
      for (const m of text.matchAll(/def:\s*(?:asAnyProp\()?\s*(\w+)\s*\)?\s*,\s*View:\s*(\w+)/g)) {
        const [defNode] = this.graph.nodesFor(file, m[1] ?? "");
        const [viewNode] = this.graph.nodesFor(file, m[2] ?? "");
        if (defNode === undefined) continue;
        const type = this.typeOfNode(defNode);
        if (type === undefined) continue;
        // The declaration pairing them (`export const fooProp = { def, View }`) is part of it too,
        // when it pairs only this one (a list of every pair would join them all).
        const line = text.slice(0, m.index).split("\n").length;
        const pair = Object.entries(this.graph.facts.get(file)?.decls ?? {}).find(
          ([, d]) =>
            d.lines[0] <= line &&
            line <= d.lines[1] &&
            pairLines.filter((l) => d.lines[0] <= l && l <= d.lines[1]).length === 1,
        );
        out.set(type, [
          defNode,
          ...(viewNode === undefined ? [] : [viewNode]),
          ...(pair === undefined ? [] : [`${file}#${pair[0]}`]),
        ]);
      }
    }
    this.rootsCache = out;
    return out;
  }

  /** The `type: "…"` a definition's declaration names. */
  private typeOfNode(node: string): string | undefined {
    const [file, name] = node.split("#");
    if (file === undefined || name === undefined || name === "") return undefined;
    const decl = this.graph.facts.get(file)?.decls[name];
    if (decl === undefined) return undefined;
    const lines = safeRead(join(this.root, file)).split("\n");
    const text = lines.slice(decl.lines[0] - 1, decl.lines[1]).join("\n");
    return /\btype:\s*"([A-Za-z0-9]+)"/.exec(text)?.[1];
  }

  /** The prop types whose definitions are in a package folder. */
  private typesIn(pkg: string): string[] {
    return [...this.typeRoots()].filter(([, roots]) => roots[0]?.startsWith(pkg)).map(([t]) => t);
  }
}

function allFrames(b: BoardReach): string[] {
  return [...(b.stack ?? []), ...Object.values(b.pieces).flatMap((p) => p.stack)];
}

/** `content/x/kit.ts:20` → ["content/x/kit.ts", 20]. */
export function splitFrame(frame: string): [string, number] {
  const at = frame.lastIndexOf(":");
  return [frame.slice(0, at), Number(frame.slice(at + 1))];
}

function splitRows(rows: string): [string, number, number] {
  const at = rows.lastIndexOf(":");
  const [from = "0", to = "0"] = rows.slice(at + 1).split("-");
  return [rows.slice(0, at), Number(from), Number(to)];
}

function safeRead(file: string): string {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

/** The repo's index: what the last content build recorded, and the code graph as the files are now. */
/** The last index made, and what it was made from (every file's time and size). */
let last: { root: string; stamp: string; index: ReachIndex } | undefined;

/**
 * The index of what reaches what: made again only when the build's record or a source file
 * changed (checked by time and size, which is cheap), else the one already made.
 */
export function reachIndex(root: string): ReachIndex {
  const file = join(root, "build", "reach.json");
  const files = graphSources(root);
  const stampOf = (f: string) => {
    try {
      const s = statSync(f);
      return `${f}:${s.mtimeMs}:${s.size}`;
    } catch {
      return `${f}:-`;
    }
  };
  const stamp = [file, ...files].map(stampOf).join("\n");
  if (last !== undefined && last.root === root && last.stamp === stamp) return last.index;
  const built: Reach = existsSync(file)
    ? (JSON.parse(readFileSync(file, "utf8")) as Reach)
    : { boards: {}, modules: {} };
  const index = new ReachIndex(root, built, codeGraph(root, files));
  last = { root, stamp, index };
  return index;
}

/**
 * Changes named by hand: a file (all of it), `file:10-20` (those lines), or `file#name` (that
 * top-level declaration).
 */
export function changesFrom(index: ReachIndex, specs: readonly string[]): Change[] {
  return specs.flatMap((spec): Change[] => {
    const s = spec.trim().replace(/\/$/, "");
    // A folder: every file in it.
    const dir = join(index.root, s);
    if (existsSync(dir) && statSync(dir).isDirectory())
      return filesUnder(dir).map((f) => ({ file: f.slice(index.root.length + 1) }));
    const named = /^(.*)#(\w+)$/.exec(s);
    if (named !== null) {
      const [, file = "", name = ""] = named;
      const decl = index.graph.facts.get(file)?.decls[name];
      if (decl === undefined) throw new Error(`${file} has no top-level ${name}`);
      return [{ file, lines: [decl.lines] }];
    }
    const ranged = /^(.*):(\d+)(?:-(\d+))?$/.exec(s);
    if (ranged !== null) {
      const [, file = "", from = "0", to] = ranged;
      return [{ file, lines: [[Number(from), Number(to ?? from)]] }];
    }
    return [{ file: s }];
  });
}

/** Every file under a folder (node_modules and dot folders aside). */
function filesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...filesUnder(path));
    else out.push(path);
  }
  return out;
}

/** Folders a change can reach boards from. */
const WATCHED = ["content", "library", "platform"];

/**
 * What git says changed since `ref` (default HEAD): each file's changed lines as it is now and as
 * it was; new files whole.
 */
export function changesFromGit(root: string, ref = "HEAD"): Change[] {
  const run = (...args: string[]) => {
    try {
      return execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 << 20 });
    } catch {
      return "";
    }
  };
  const out = new Map(
    parseDiff(run("diff", "-U0", "--no-color", "--no-renames", ref, "--", ...WATCHED)).map((c) => [
      c.file,
      c,
    ]),
  );
  for (const file of run("ls-files", "--others", "--exclude-standard", "--", ...WATCHED)
    .split("\n")
    .filter((f) => f !== ""))
    out.set(file, { file });
  return [...out.values()];
}

/** `git diff -U0` → each file's changed lines, as it is now (`lines`) and as it was (`was`). */
export function parseDiff(diff: string): Change[] {
  const out: Change[] = [];
  let current: Change | undefined;
  // Between "diff --git" and "+++", lines are the file's header; after, hunks (whose removed lines
  // may start with "---" themselves).
  let isHeader = false;
  for (const line of diff.split("\n")) {
    if (line.startsWith("diff --git ")) {
      isHeader = true;
      continue;
    }
    if (isHeader && line.startsWith("--- ")) {
      current = { file: line.slice(6), lines: [], was: [] };
      continue;
    }
    if (isHeader && line.startsWith("+++ ")) {
      isHeader = false;
      if (current === undefined) continue;
      if (line === "+++ /dev/null") current.isGone = true;
      else current.file = line.slice(6);
      out.push(current);
      continue;
    }
    const hunk = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (hunk === null || current === undefined) continue;
    const [a, b, c, d] = [hunk[1], hunk[2] ?? "1", hunk[3], hunk[4] ?? "1"].map(Number) as [
      number,
      number,
      number,
      number,
    ];
    // A count of 0 is a deletion (or addition) after that line: count the line after it too.
    current.was?.push(b === 0 ? [a, a + 1] : [a, a + b - 1]);
    current.lines?.push(d === 0 ? [c, c + 1] : [c, c + d - 1]);
  }
  return out.map((c) => (c.isGone ? { file: c.file, isGone: true } : c));
}

/** How far down to roll a reach up: `book`, `chapter`, `lesson`, `board` or `piece`. */
export const DEPTHS = ["book", "chapter", "lesson", "board", "piece"] as const;
export type Depth = (typeof DEPTHS)[number];

/** A path cut to a depth: `class10-maths/real-numbers/division-lemma` for a lesson. */
export function cut(hit: Pick<Hit, "board" | "piece">, depth: Depth): string {
  const parts = hit.board.split("/");
  const lessonEnd = parts[2] === "questions" ? 4 : 3;
  switch (depth) {
    case "book":
      return parts.slice(0, 1).join("/");
    case "chapter":
      return parts.slice(0, 2).join("/");
    case "lesson":
      return parts.slice(0, lessonEnd).join("/");
    case "board":
      return hit.board;
    case "piece":
      return `${hit.board}#${hit.piece}`;
  }
}

/** Hits counted by path at a depth, in course order (boards as built). */
export function rollUp(
  hits: readonly Hit[],
  depth: Depth,
): { path: string; pieces: number; boards: number }[] {
  const out = new Map<string, { pieces: number; boards: Set<string> }>();
  for (const h of hits) {
    const key = cut(h, depth);
    const row = out.get(key) ?? { pieces: 0, boards: new Set<string>() };
    row.pieces += 1;
    row.boards.add(h.board);
    out.set(key, row);
  }
  return [...out].map(([path, r]) => ({ path, pieces: r.pieces, boards: r.boards.size }));
}

/** Most rows a description lists before asking to narrow it. */
const MOST_ROWS = 80;

/**
 * A reach in words: how much, why, then the paths at a depth (pieces with their type and the line
 * or prop that connects them).
 */
export function describeReach(
  reached: Reached,
  depth: Depth,
  under: string | undefined,
  changes: number,
): string {
  const seen = new Set<string>();
  const hits = reached.hits.filter((h) => {
    const key = `${h.board}#${h.piece}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return (
      under === undefined ||
      key === under ||
      key.startsWith(`${under.replace(/\/$/, "")}/`) ||
      key.startsWith(`${under}#`)
    );
  });
  const count = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;
  const boards = new Set(hits.map((h) => h.board));
  const chapters = new Set(hits.map((h) => cut(h, "chapter")));
  const out = [
    hits.length === 0
      ? `reaches nothing built${changes === 0 ? "" : ` (${count(changes, "changed file")})`}`
      : `reaches ${count(hits.length, "piece")} on ${count(boards.size, "board")} in ${count(chapters.size, "chapter")}${under ? ` under ${under}` : ""}`,
  ];
  if (reached.everything !== undefined) out.push(`every board: ${reached.everything}`);
  if (reached.touched.length > 0)
    out.push(
      `touches: ${reached.touched.slice(0, 12).join(", ")}${reached.touched.length > 12 ? ` and ${reached.touched.length - 12} more` : ""}`,
    );
  if (reached.types.length > 0)
    out.push(
      `prop types through their code: ${reached.types.slice(0, 30).join(", ")}${reached.types.length > 30 ? ` and ${reached.types.length - 30} more` : ""}`,
    );
  if (hits.length === 0) return out.join("\n");
  out.push("");
  if (depth === "piece") {
    for (const h of hits.slice(0, MOST_ROWS))
      out.push(`${h.board}#${h.piece}${h.type ? ` (${h.type})` : ""} ← ${h.why}`);
  } else {
    const rows = rollUp(hits, depth);
    for (const r of rows.slice(0, MOST_ROWS))
      out.push(
        depth === "board"
          ? `${r.path} — ${count(r.pieces, "piece")}`
          : `${r.path} — ${count(r.pieces, "piece")} on ${count(r.boards, "board")}`,
      );
  }
  const total = depth === "piece" ? hits.length : rollUp(hits, depth).length;
  if (total > MOST_ROWS)
    out.push(
      `… and ${total - MOST_ROWS} more: keep to one branch with under, or roll up with a shallower depth`,
    );
  return out.join("\n");
}
