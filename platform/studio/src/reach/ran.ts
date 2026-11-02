import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { TraceMap, decodedMappings } from "@jridgewell/trace-mapping";
import type { Range } from "./facts";

/**
 * What ran while a board was looked at and played: the lines of our code that ran, by file, from
 * the browser's own code coverage mapped back through the dev server's source maps. Kept on this
 * machine only (node_modules/.cache/chalk-ran): `open/` gathers what ran since the board was last
 * passed, and passing it moves that to `passed/`.
 *
 * Only ever a hint for the reviewer (changes: "this changed code ran in the review", or didn't),
 * never a reason to skip a board: it knows only the states someone played, and a learner can reach
 * others. The code a board runs in the build (its lesson file) isn't here: its output is the
 * board's content, compared on its own.
 */

/** File (from the repo root) → the lines that ran, merged, in order. */
export type Ran = Record<string, Range[]>;

/** One script's coverage, as the browser gives it (Playwright's JS coverage). */
export type Coverage = {
  url: string;
  source?: string;
  functions: { ranges: { startOffset: number; endOffset: number; count: number }[] }[];
};

const dirOf = (root: string) => join(root, "node_modules", ".cache", "chalk-ran");
const fileOf = (root: string, kind: "open" | "passed", board: string) =>
  join(dirOf(root), kind, `${board}.json`);

/**
 * Maps coverage to our lines. A page keeps its scripts between calls, and the browser sends a
 * script's text only when it loads: each script's map is kept here by its URL (a changed module
 * gets a new one).
 */
export class RanReader {
  private readonly maps = new Map<string, Known | null>();
  /**
   * What ran as each script loaded (its own top-level statements, not its functions): it ran once
   * for the page, and every board drawn on the page after stands on it.
   */
  private loaded: Ran = {};

  constructor(private readonly root: string) {}

  /** Takes in coverage that belongs to no board (before a call): its maps and what ran on load. */
  see(coverage: readonly Coverage[]): void {
    this.read(coverage, false);
  }

  /** The lines that ran: in this coverage, and everything that ran as the page's scripts loaded. */
  linesOf(coverage: readonly Coverage[]): Ran {
    const out = this.read(coverage, true);
    for (const [file, lines] of Object.entries(this.loaded))
      out[file] = merged([...(out[file] ?? []), ...lines]);
    return out;
  }

  /**
   * Reads coverage: each script's map, and what ran as it loaded (kept); with `isWanted`, the lines
   * that ran in it too. Lines are gathered per file and merged once at the end: merging at every
   * line made it grow with the square of the lines that ran (seen: most of a drawing's time).
   */
  private read(coverage: readonly Coverage[], isWanted: boolean): Ran {
    const out = new Map<string, Range[]>();
    const loaded = new Map<string, Range[]>();
    const add = (
      to: Map<string, Range[]>,
      known: Known,
      ranges: Coverage["functions"][number]["ranges"],
    ) => {
      for (const [from, end] of ranSegments(ranges))
        for (const [file, line] of linesIn(known, from, end)) {
          const lines = to.get(file);
          if (lines === undefined) to.set(file, [[line, line]]);
          else lines.push([line, line]);
        }
    };
    for (const script of coverage) {
      const known = this.mapOf(script);
      if (known === null) continue;
      if (isWanted)
        add(
          out,
          known,
          script.functions.flatMap((f) => f.ranges),
        );
      // The script's own top level ran (it loaded now): its lines, every function's body aside.
      const [top, ...inner] = [...script.functions].sort(
        (x, y) =>
          (x.ranges[0]?.startOffset ?? 0) - (y.ranges[0]?.startOffset ?? 0) ||
          (y.ranges[0]?.endOffset ?? 0) - (x.ranges[0]?.endOffset ?? 0),
      );
      if (top !== undefined && (top.ranges[0]?.count ?? 0) > 0)
        add(loaded, known, [
          ...top.ranges,
          ...inner.flatMap((f) =>
            f.ranges[0] === undefined ? [] : [{ ...f.ranges[0], count: 0 }],
          ),
        ]);
    }
    for (const [file, lines] of loaded)
      this.loaded[file] = merged([...(this.loaded[file] ?? []), ...lines]);
    return Object.fromEntries([...out].map(([file, lines]) => [file, merged(lines)]));
  }

  private mapOf(script: Coverage): Known | null {
    let known = this.maps.get(script.url);
    if (known === undefined && script.source !== undefined) {
      const m =
        /sourceMappingURL=data:application\/json;(?:charset=utf-8;)?base64,([A-Za-z0-9+/=]+)/.exec(
          script.source,
        );
      if (m?.[1] === undefined) known = null;
      else {
        const map = new TraceMap(JSON.parse(Buffer.from(m[1], "base64").toString("utf8")));
        known = {
          lines: decodedMappings(map),
          starts: lineStarts(script.source),
          files: map.sources.map((source) => this.fileOf(source, script.url)),
        };
      }
      this.maps.set(script.url, known);
    }
    return known ?? null;
  }

  /** Our file (from the repo root) a map's source is, or undefined (a library, generated code). */
  private fileOf(source: string | null, url: string): string | undefined {
    if (source === null) return undefined;
    const path = decodeURIComponent(new URL(source, url).pathname).replace(/^\/@fs/, "");
    if (!path.startsWith(`${this.root}/`) || path.includes("/node_modules/")) return undefined;
    return path.slice(this.root.length + 1);
  }
}

/** A served script's map: per generated line, its mappings; where each line starts; our files. */
type Known = {
  lines: readonly (readonly (readonly number[])[])[];
  starts: number[];
  files: (string | undefined)[];
};

/**
 * Every line of ours that a stretch of a served script comes from: each mapping inside it, not
 * only its ends (generated code, as a module's imports, maps to nothing).
 */
function* linesIn(known: Known, from: number, end: number): Generator<[string, number]> {
  const a = positionOf(known.starts, from);
  const b = positionOf(known.starts, end);
  for (let line = a.line; line <= b.line; line++)
    for (const m of known.lines[line - 1] ?? []) {
      const [column = 0, source, original] = m;
      if (line === a.line && column < a.column) continue;
      if (line === b.line && column >= b.column) continue;
      const file = source === undefined ? undefined : known.files[source];
      if (file !== undefined && original !== undefined) yield [file, original + 1];
    }
}

/**
 * The parts of a script that ran: V8 gives nested ranges (a function, and inside it the blocks and
 * functions that didn't run, count 0); the innermost range decides each stretch.
 */
export function ranSegments(
  ranges: readonly { startOffset: number; endOffset: number; count: number }[],
): [number, number][] {
  const sorted = [...ranges].sort(
    (a, b) => a.startOffset - b.startOffset || b.endOffset - a.endOffset,
  );
  const out: [number, number][] = [];
  const stack: (typeof sorted)[number][] = [];
  let at = 0;
  const emit = (to: number, count: number) => {
    if (to > at && count > 0) {
      const last = out[out.length - 1];
      if (last !== undefined && last[1] === at) last[1] = to;
      else out.push([at, to]);
    }
    at = Math.max(at, to);
  };
  for (const r of sorted) {
    while (stack.length > 0 && (stack[stack.length - 1]?.endOffset ?? 0) <= r.startOffset) {
      const done = stack.pop() as (typeof sorted)[number];
      emit(done.endOffset, done.count);
    }
    const outer = stack[stack.length - 1];
    if (outer !== undefined) emit(r.startOffset, outer.count);
    at = Math.max(at, r.startOffset);
    stack.push(r);
  }
  while (stack.length > 0) {
    const done = stack.pop() as (typeof sorted)[number];
    emit(done.endOffset, done.count);
  }
  return out;
}

function lineStarts(text: string): number[] {
  const out = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") out.push(i + 1);
  return out;
}

function positionOf(starts: readonly number[], offset: number) {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if ((starts[mid] ?? 0) <= offset) lo = mid;
    else hi = mid - 1;
  }
  return { line: lo + 1, column: offset - (starts[lo] ?? 0) };
}

/** Ranges sorted and joined where they touch or overlap. */
function merged(ranges: readonly Range[]): Range[] {
  const out: [number, number][] = [];
  for (const [a, b] of [...ranges].sort((x, y) => x[0] - y[0])) {
    const last = out[out.length - 1];
    if (last !== undefined && a <= last[1] + 1) last[1] = Math.max(last[1], b);
    else out.push([a, b]);
  }
  return out;
}

const read = (file: string): Ran | undefined => {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as Ran;
  } catch {
    return undefined;
  }
};

/** Adds what ran on a board to what ran on it since it was last passed. */
export function addRan(root: string, board: string, ran: Ran): void {
  if (Object.keys(ran).length === 0) return;
  const file = fileOf(root, "open", board);
  const all = read(file) ?? {};
  for (const [f, lines] of Object.entries(ran)) all[f] = merged([...(all[f] ?? []), ...lines]);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(all));
}

/**
 * Passing a board keeps what ran in its review. If this machine saw none of it, nothing is known:
 * what was kept from an older review goes too.
 */
export function passRan(root: string, board: string): void {
  const open = fileOf(root, "open", board);
  const passed = fileOf(root, "passed", board);
  mkdirSync(dirname(passed), { recursive: true });
  if (existsSync(open)) renameSync(open, passed);
  else rmSync(passed, { force: true });
}

/** What ran in a board's last passed review, or undefined if this machine didn't see it. */
export const ranAtPass = (root: string, board: string): Ran | undefined =>
  read(fileOf(root, "passed", board));

/** Whether any of these lines of a file ran. */
export const anyRan = (ran: Ran, file: string, lines: readonly Range[]): boolean =>
  (ran[file] ?? []).some(([a, b]) => lines.some(([c, d]) => a <= d && c <= b));
