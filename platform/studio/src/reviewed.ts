import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { propHomes } from "./comments";
import { type BoardRecord, type Change, changesBetween } from "./content/board-record";
import type { Reach } from "./content/build";
import { boardCode, digestOf } from "./reach/board-code";
import { factsOf } from "./reach/facts";
import { codeGraph, fingerprintIn } from "./reach/graph";

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
       * one line saying the code changed when which part can't be told.
       */
      code: string[];
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
function codeNow(
  root: string,
): (board: string, record: BoardRecord) => Map<string, string> | undefined {
  const file = join(root, "build", "reach.json");
  const reach = existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as Reach) : undefined;
  let graph: ReturnType<typeof codeGraph> | undefined;
  const homes = propHomes(root);
  return (board, record) => {
    const made = reach?.boards[board];
    if (made === undefined) return undefined;
    graph ??= codeGraph(root);
    return boardCode(graph, made, record.layers, homes);
  };
}

/** The code that differs from `commit`: each node whose fingerprint was different then, or absent. */
function changedSince(root: string, commit: string, code: ReadonlyMap<string, string>): string[] {
  const files = new Map<string, { facts?: ReturnType<typeof factsOf>; text?: string }>();
  const at = (file: string) => {
    let known = files.get(file);
    if (known === undefined) {
      const text = hasAt(root, commit, file) ? git(root, "show", `${commit}:${file}`) : undefined;
      known =
        text === undefined
          ? {}
          : /\.tsx?$/.test(file)
            ? { facts: factsOf(file, text), text }
            : { text };
      files.set(file, known);
    }
    return known;
  };
  return [...code]
    .filter(([node, now]) => {
      const [file = "", name = ""] = node.split("#");
      const then = at(file);
      if (then.text === undefined) return true;
      return fingerprintIn(then.facts, name, file, then.text) !== now;
    })
    .map(([node]) => node);
}

const hasAt = (root: string, commit: string, file: string) => {
  try {
    execFileSync("git", ["cat-file", "-e", `${commit}:${file}`], { cwd: root, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

/** What changed on every board at or under `under` since each was passed. */
export function changesUnder(root: string, under: string): BoardChange[] {
  const now = builtUnder(root, under);
  const passed = readPassed(root, chapterOf(under));
  const codeOf = codeNow(root);
  const out: BoardChange[] = [];
  for (const [board, record] of now) {
    const was = passed[board];
    if (was === undefined) {
      out.push({ board, status: "new" });
      continue;
    }
    const content = changesBetween(was.content, record.content);
    const code = codeOf(board, record);
    const isSameCode = code !== undefined && was.code === digestOf(code);
    if (content.length === 0 && isSameCode) {
      out.push({ board, status: "unchanged", passed: was });
      continue;
    }
    const named = code === undefined || isSameCode ? [] : changedSince(root, was.commit, code);
    out.push({
      board,
      status: "changed",
      passed: was,
      content,
      code: isSameCode
        ? []
        : named.length > 0
          ? named
          : [
              code === undefined
                ? "its code isn't known (build/reach.json): counted as changed"
                : was.code === undefined
                  ? "no code fingerprint was kept when it was passed: counted as changed"
                  : `its code changed since ${was.commit} (which part: not found in that commit)`,
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
    return [
      board,
      { ...record, by, commit, at, ...(code === undefined ? {} : { code: digestOf(code) }) },
    ];
  });
  const sorted = Object.fromEntries([...kept, ...fresh].sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(
    fileOf(root, chapter),
    `# Written only by the chalk MCP's changes tool (platform/studio/src/reviewed.ts). Don't edit by hand.\n${stringifyYaml(sorted, { lineWidth: 0 })}`,
  );
  return now.size;
}

/** Where a change is, by piece names only: "sheet › with › marks", not "root › children › …". */
const placeOf = (at: string) => at.replace(/^root › /, "").replace(/(^| › )children › /g, "$1");

/** A change in words: "sheet › with › marks: counts → none". */
function changeWords(c: Change): string {
  const short = (v: unknown) => {
    const text = typeof v === "string" ? v : JSON.stringify(v);
    return text.length > 80 ? `${text.slice(0, 77)}…` : text;
  };
  const at = placeOf(c.at);
  if (c.was === undefined) return `${at}: added ${short(c.now)}`;
  if (c.now === undefined) return `${at}: removed (was ${short(c.was)})`;
  return `${at}: ${short(c.was)} → ${short(c.now)}`;
}

/** The changes, as the reviewer reads them: changed boards first, with what changed on each. */
export function changesWords(changes: readonly BoardChange[]): string {
  const of = (s: BoardChange["status"]) => changes.filter((c) => c.status === s);
  const lines: string[] = [];
  for (const c of of("changed")) {
    if (c.status !== "changed") continue;
    lines.push(`${c.board}   changed since passed by ${c.passed.by} at ${c.passed.commit}`);
    for (const change of c.content) lines.push(`  ${changeWords(change)}`);
    for (const node of c.code) lines.push(`  code: ${node}`);
  }
  for (const c of of("new")) lines.push(`${c.board}   new: never passed`);
  for (const c of of("gone")) lines.push(`${c.board}   gone: passed once, no longer built`);
  const same = of("unchanged");
  if (same.length > 0)
    lines.push(
      `${same.length} unchanged since passed: ${same.map((c) => c.board.split("/").slice(-1)[0]).join(", ")}`,
    );
  return lines.join("\n") || "No boards here.";
}
