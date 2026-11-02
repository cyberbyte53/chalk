import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { propHomes } from "./comments";
import { type BoardRecord, type Change, changesBetween } from "./content/board-record";
import type { Reach } from "./content/build";
import { type BoardCode, boardCode } from "./reach/board-code";
import { type Range, factsOf } from "./reach/facts";
import { codeGraph, fingerprintIn } from "./reach/graph";
import { parseDiff } from "./reach/index";
import { type Ran, anyRan, passRan, ranAtPass } from "./reach/ran";

/**
 * What was reviewed, so a review is never done twice. When a reviewer (or the person) passes a
 * board, its record from the build (board-record.ts: its content) is kept, with one fingerprint of
 * all the code it runs (reach/board-code.ts), who passed it and at which commit:
 * `authoring/books/<book>/<chapter>/reviewed.yaml`. A board whose content and code are the same
 * now is still passed; one that differs shows exactly what changed: its content, and each function
 * it runs that changed. Written only here, by the chalk MCP's `changes` tool.
 *
 * Sound before precise: a board is unchanged only when that is shown; anything not known (no
 * code fingerprint kept, the board's code not found) counts as changed.
 */

export const REVIEWED_FILE = "reviewed.yaml";

/** `code`: the fingerprint of the code the board ran when passed (absent: passed before it was kept). */
export type Passed = BoardRecord & { by: string; commit: string; at: string; code?: string };

/** Whether a change's lines ran while the board was reviewed: a hint, never a reason to skip it. */
export type InReview = "ran" | "didn't run" | "new";

export type BoardChange =
  | { board: string; status: "unchanged"; passed: Passed }
  | { board: string; status: "new" }
  | {
      board: string;
      status: "changed";
      passed: Passed;
      /** What differs on the board itself: its pieces' setup and words, its rules. */
      content: Change[];
      /**
       * The code it runs that changed since (`file#name`; `file#` is a file's own statements), or
       * one line saying the code changed when which part can't be told. `inReview`, when this
       * machine saw the review (reach/ran.ts): whether the changed lines ran in it, or are new.
       */
      code: { node: string; inReview?: InReview }[];
    }
  /** Passed once, and no longer built. */
  | { board: string; status: "gone"; passed: Passed };

const git = (root: string, ...args: string[]): string => {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
};

/** A board's chapter, from its path: class9-maths/coordinate-geometry. */
const chapterOf = (board: string): string => board.split("/").slice(0, 2).join("/");
const fileOf = (root: string, chapter: string) =>
  join(root, "authoring", "books", chapter, REVIEWED_FILE);

function readPassed(root: string, chapter: string): Record<string, Passed> {
  const file = fileOf(root, chapter);
  if (!existsSync(file)) return {};
  return (parseYaml(readFileSync(file, "utf8")) as Record<string, Passed> | null) ?? {};
}

/** Every built board at or under `under` (a content path), and its record now. */
function builtUnder(root: string, under: string): Map<string, BoardRecord> {
  const dir = join(root, "build", "review");
  const out = new Map<string, BoardRecord>();
  const walk = (d: string) => {
    if (!existsSync(d)) return;
    for (const name of readdirSync(d)) {
      const path = join(d, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (name.endsWith(".json")) {
        const board = relative(dir, path).replace(/\.json$/, "");
        if (board === under || board.startsWith(`${under}/`))
          out.set(board, JSON.parse(readFileSync(path, "utf8")) as BoardRecord);
      }
    }
  };
  walk(join(dir, chapterOf(under)));
  return out;
}

/** Each built board's code now, by the code graph: what it runs, with fingerprints. */
function codeNow(root: string): (board: string, record: BoardRecord) => BoardCode | undefined {
  const file = join(root, "build", "reach.json");
  const reach = existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as Reach) : undefined;
  let graph: ReturnType<typeof codeGraph> | undefined;
  const homes = propHomes(root);
  return (board, record) => {
    const made = reach?.boards[board];
    if (made === undefined) return undefined;
    graph ??= codeGraph(root);
    return boardCode(graph, made, homes);
  };
}

/** A file as it was at a commit, read once (a commit never changes): its facts if it is code. */
const atCommit = new Map<string, { facts?: ReturnType<typeof factsOf>; text?: string }>();
function fileAt(root: string, commit: string, file: string) {
  const key = `${root}\0${commit}\0${file}`;
  let known = atCommit.get(key);
  if (known === undefined) {
    let text: string | undefined;
    try {
      text = execFileSync("git", ["show", `${commit}:${file}`], {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
    } catch {
      text = undefined; // not there then
    }
    known =
      text === undefined
        ? {}
        : /\.tsx?$/.test(file)
          ? { facts: factsOf(file, text), text }
          : { text };
    atCommit.set(key, known);
  }
  return known;
}

/** The code that differs from `commit`: each node whose fingerprint was different then, or absent. */
function changedSince(root: string, commit: string, code: ReadonlyMap<string, string>): string[] {
  return [...code]
    .filter(([node, now]) => {
      const [file = "", name = ""] = node.split("#");
      const then = fileAt(root, commit, file);
      if (then.text === undefined) return true;
      return fingerprintIn(then.facts, name, file, then.text) !== now;
    })
    .map(([node]) => node);
}

/**
 * Whether a changed node's changed lines ran in the review: its lines at the review's commit that
 * git says changed (all of them if none do: an import it uses changed), against what ran then.
 * Undefined when that can't be told (a stylesheet: the browser's coverage is of scripts).
 */
function inReview(
  root: string,
  commit: string,
  ran: Ran,
  node: string,
  diffs: Map<string, Range[]>,
): InReview | undefined {
  const [file = "", name = ""] = node.split("#");
  const then = fileAt(root, commit, file);
  if (then.text === undefined) return "new";
  if (then.facts === undefined) return undefined;
  const lines = name === "" ? then.facts.module.lines : [then.facts.decls[name]?.lines];
  const own = lines.filter((r): r is Range => r !== undefined);
  if (own.length === 0) return "new";
  let changed = diffs.get(`${commit}\0${file}`);
  if (changed === undefined) {
    changed = parseDiff(git(root, "diff", "-U0", commit, "--", file))[0]?.was ?? [];
    diffs.set(`${commit}\0${file}`, changed);
  }
  const hits = own.flatMap(([a, b]) =>
    (changed ?? [])
      .filter(([c, d]) => c <= b && a <= d)
      .map(([c, d]): Range => [Math.max(a, c), Math.min(b, d)]),
  );
  return anyRan(ran, file, hits.length > 0 ? hits : own) ? "ran" : "didn't run";
}

const IN_REVIEW_WORDS: Record<InReview, string> = {
  ran: "ran in the review: look here",
  "didn't run": "didn't run in the review: none of what was looked at used it",
  new: "new since the review",
};

/**
 * What of a board's record a review keeps: its layout, its pieces' setup, its words, its own
 * rules. Its props' definitions (the scene's children) and the schemas of what a scene takes and
 * tells (its variables, actions, signals), copied into the record by the build, are code: the
 * board's code fingerprint already holds them, and they are nearly all of the record.
 */
export function reviewedContent(content: unknown): unknown {
  const c = content as { model?: { scene?: Record<string, unknown> } } | null;
  const scene = c?.model?.scene;
  if (scene === undefined) return content;
  const own = Object.fromEntries(Object.entries(scene).filter(([k]) => !SCENE_CODE.has(k)));
  return { ...c, model: { ...c?.model, scene: own } };
}

/** What changed on every board at or under `under` since each was passed. */
export function changesUnder(root: string, under: string): BoardChange[] {
  const now = builtUnder(root, under);
  const passed = readPassed(root, chapterOf(under));
  const codeOf = codeNow(root);
  const diffs = new Map<string, Range[]>();
  const out: BoardChange[] = [];
  for (const [board, record] of now) {
    const was = passed[board];
    if (was === undefined) {
      out.push({ board, status: "new" });
      continue;
    }
    const content = changesBetween(reviewedContent(was.content), reviewedContent(record.content));
    const code = codeOf(board, record);
    const isSameCode = code !== undefined && was.code === code.digest;
    if (content.length === 0 && isSameCode) {
      out.push({ board, status: "unchanged", passed: was });
      continue;
    }
    const named =
      code === undefined || isSameCode ? [] : changedSince(root, was.commit, code.nodes());
    const ran = ranAtPass(root, board);
    const hinted = named.map((node) => {
      const seen = ran === undefined ? undefined : inReview(root, was.commit, ran, node, diffs);
      return seen === undefined ? { node } : { node, inReview: seen };
    });
    out.push({
      board,
      status: "changed",
      passed: was,
      content,
      code: isSameCode
        ? []
        : hinted.length > 0
          ? hinted
          : [
              {
                node:
                  code === undefined
                    ? "its code isn't known (build/reach.json): counted as changed"
                    : was.code === undefined
                      ? "no code fingerprint was kept when it was passed: counted as changed"
                      : `its code changed since ${was.commit} (which part: not found in that commit)`,
              },
            ],
    });
  }
  for (const [board, was] of Object.entries(passed))
    if ((board === under || board.startsWith(`${under}/`)) && !now.has(board))
      out.push({ board, status: "gone", passed: was });
  return out.sort((a, b) => a.board.localeCompare(b.board));
}

/**
 * Passes every board at or under `under` as it is built now, by `by`: its record is kept, and the
 * boards no longer built are dropped. Returns how many were passed.
 */
export function passUnder(root: string, under: string, by: string): number {
  const now = builtUnder(root, under);
  const chapter = chapterOf(under);
  const isHere = (board: string) => board === under || board.startsWith(`${under}/`);
  const commit = git(root, "rev-parse", "--short=12", "HEAD").trim();
  const at = new Date().toISOString();
  // Elsewhere in the chapter, as it was; here, every board as built now (one no longer built goes).
  const kept = Object.entries(readPassed(root, chapter)).filter(([board]) => !isHere(board));
  const codeOf = codeNow(root);
  const fresh = [...now].map(([board, record]): [string, Passed] => {
    const code = codeOf(board, record);
    passRan(root, board);
    return [
      board,
      {
        content: reviewedContent(record.content),
        by,
        commit,
        at,
        ...(code === undefined ? {} : { code: code.digest }),
      },
    ];
  });
  const sorted = Object.fromEntries([...kept, ...fresh].sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(
    fileOf(root, chapter),
    `# Written only by the chalk MCP's changes tool (platform/studio/src/reviewed.ts). Don't edit by hand.\n${stringifyYaml(sorted, { lineWidth: 0 })}`,
  );
  return now.size;
}

/** What a board's scene carries that is code, not the board's own: its props, its schemas. */
const SCENE_CODE = new Set(["children", "variables", "actions", "signals", "type"]);

/**
 * A board's content changes, as a reviewer reads them: one line per piece (its setup and words),
 * per line said, and for the board's rules, each field once with was → now. A prop's definition
 * copied into the record (the scene's children, its schemas) is its code: said with the code.
 */
export function contentLines(changes: readonly Change[], isAll = false): string[] {
  const short = (v: unknown) => {
    if (v === undefined) return "nothing";
    const text = typeof v === "string" ? `"${v}"` : JSON.stringify(v);
    return text.length > 70 ? `${text.slice(0, 67)}…` : text;
  };
  const groups = new Map<string, Map<string, Change>>();
  const add = (group: string, field: string, c: Change) => {
    const fields = groups.get(group) ?? new Map<string, Change>();
    // The same field met twice (the setup in the layout and in what the board gives): once.
    if (!fields.has(field)) fields.set(field, c);
    groups.set(group, fields);
  };
  for (const c of changes) {
    const segs = c.at.split(" › ");
    const [top, kind, name, ...rest] = segs;
    if (top === "model" && kind === "given" && name !== undefined) add(name, rest.join("."), c);
    else if (top === "model" && kind === "lines" && name !== undefined)
      add(`line ${name}`, rest.join("."), c);
    else if (top === "model" && kind === "scene") {
      // The board's own (what it hears, does on its own, starts as); not its props' code.
      if (!SCENE_CODE.has(name ?? "")) add("rules", [name, ...rest].join("."), c);
    } else if (top === "model") add("rules", segs.slice(1).join("."), c);
    else if (top === "root") {
      const path = segs.slice(1).filter((x) => x !== "children");
      const at = path.indexOf("with");
      if (at > 0) add(path[at - 1] as string, path.slice(at + 1).join("."), c);
      else add(path[0] ?? "layout", path.length > 1 ? path.slice(1).join(".") : "placed", c);
    } else add("rules", segs.join("."), c);
  }
  return [...groups].map(([group, fields]) => {
    // A piece placed or taken away: that alone.
    const placed = fields.get("placed");
    if (placed !== undefined && (placed.was === undefined || placed.now === undefined))
      return `  ${group}: ${placed.was === undefined ? "added" : "removed"}`;
    // Words in English as was → now (the Hindi said to have changed too); other fields as was →
    // now when there are few, else by name (all of them when asked about one board).
    const isHindi = (f: string) => f.endsWith(".hi") || f === "hi";
    const isWords = (f: string) => f.endsWith(".en") || f === "en";
    const hindi = [...fields].some(([f]) => isHindi(f));
    const words = [...fields].filter(([f]) => isWords(f));
    const rest = [...fields].filter(([f]) => !isWords(f) && !isHindi(f));
    const each = ([f, c]: [string, Change]) =>
      `${f.replace(/\.en$|^en$/, "") || "words"} ${short(c.was)} → ${short(c.now)}`;
    const said = [
      ...words.map(each),
      ...(isAll || rest.length <= FIELDS_SHOWN
        ? rest.map(each)
        : [`${rest.length} fields: ${rest.map(([f]) => f).join(", ")}`]),
      ...(hindi ? ["its Hindi too"] : []),
    ];
    return `  ${group}: ${said.join(" · ")}`;
  });
}

/** How many of a piece's fields are said as was → now among others, before only their names. */
const FIELDS_SHOWN = 3;

/** How many changed functions a board lists among others before counting the rest (alone: all). */
const CODE_SHOWN = 8;

/** The changes, as the reviewer reads them: changed boards first, with what changed on each. */
export function changesWords(
  changes: readonly BoardChange[],
  /** What a board shows now against what a reviewer last saw, a line each (`changes` draws it). */
  shows: ReadonlyMap<string, readonly string[]> = new Map(),
): string {
  const of = (s: BoardChange["status"]) => changes.filter((c) => c.status === s);
  const lines: string[] = [];
  for (const c of of("changed")) {
    if (c.status !== "changed") continue;
    lines.push(`${c.board}   changed since passed by ${c.passed.by} at ${c.passed.commit}`);
    lines.push(...contentLines(c.content, changes.length === 1));
    for (const line of shows.get(c.board) ?? []) lines.push(`  ${line}`);
    // What ran in the review first: that is where to look.
    const order = { ran: 0, new: 1, "didn't run": 2 } as const;
    const code = [...c.code].sort(
      (a, b) => (order[a.inReview ?? "didn't run"] ?? 3) - (order[b.inReview ?? "didn't run"] ?? 3),
    );
    const shown = changes.length === 1 ? code.length : CODE_SHOWN;
    for (const { node, inReview } of code.slice(0, shown))
      lines.push(
        `  code: ${node}${inReview === undefined ? "" : ` (${IN_REVIEW_WORDS[inReview]})`}`,
      );
    if (code.length > shown)
      lines.push(`  code: ${code.length - shown} more changed (changes at the board for all)`);
  }
  for (const c of of("new")) {
    lines.push(`${c.board}   new: never passed`);
    // A board in review before its first pass: against what a reviewer last saw of it.
    for (const line of shows.get(c.board) ?? []) lines.push(`  ${line}`);
  }
  for (const c of of("gone")) lines.push(`${c.board}   gone: passed once, no longer built`);
  const same = of("unchanged");
  if (same.length > 0)
    lines.push(
      `${same.length} unchanged since passed: ${same.map((c) => c.board.split("/").slice(-1)[0]).join(", ")}`,
    );
  return lines.join("\n") || "No boards here.";
}
