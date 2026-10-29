import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { TraceMap, originalPositionFor } from "@jridgewell/trace-mapping";
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
  private readonly maps = new Map<string, { map: TraceMap; starts: number[] } | null>();

  constructor(private readonly root: string) {}

  linesOf(coverage: readonly Coverage[]): Ran {
    const out: Ran = {};
    for (const script of coverage) {
      const known = this.mapOf(script);
      if (known === null) continue;
      for (const [from, to] of ranSegments(script.functions.flatMap((f) => f.ranges))) {
        const a = this.at(script.url, known, from);
        const b = this.at(script.url, known, Math.max(from, to - 1));
        if (a === undefined) continue;
        const end = b !== undefined && b.file === a.file && b.line >= a.line ? b.line : a.line;
        out[a.file] = [...(out[a.file] ?? []), [a.line, end]];
      }
    }
    for (const file of Object.keys(out)) out[file] = merged(out[file] ?? []);
    return out;
  }

  private mapOf(script: Coverage) {
    let known = this.maps.get(script.url);
    if (known === undefined && script.source !== undefined) {
      const m =
        /sourceMappingURL=data:application\/json;(?:charset=utf-8;)?base64,([A-Za-z0-9+/=]+)/.exec(
          script.source,
        );
      known =
        m?.[1] === undefined
          ? null
          : {
              map: new TraceMap(JSON.parse(Buffer.from(m[1], "base64").toString("utf8"))),
              starts: lineStarts(script.source),
            };
      this.maps.set(script.url, known);
    }
    return known ?? null;
  }

  /** Where an offset of a served script comes from: our file and line, or undefined. */
  private at(url: string, known: { map: TraceMap; starts: number[] }, offset: number) {
    const o = originalPositionFor(known.map, positionOf(known.starts, offset));
    if (o.source === null || o.line === null) return undefined;
    const path = decodeURIComponent(new URL(o.source, url).pathname).replace(/^\/@fs/, "");
    if (!path.startsWith(`${this.root}/`) || path.includes("/node_modules/")) return undefined;
    return { file: path.slice(this.root.length + 1), line: o.line };
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
