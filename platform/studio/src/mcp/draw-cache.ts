import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { propHomes } from "../comments";
import type { Reach } from "../content/build";
import { boardCode } from "../reach/board-code";
import { type CodeGraph, codeGraph } from "../reach/graph";

/**
 * Drawings made once per set of inputs (platform/docs/seeing-boards.md, "Drawn once"). A drawing is
 * a function of what it is made from; the same inputs give the same pixels, state, problems, lines
 * said and step answers. So a drawing is kept under a key of exactly those
 * inputs and handed to every later ask: a board's show, changes, a check, a replayed play.
 *
 * The inputs, and only these:
 * - the code the page runs: the app and everything it bundles (platform/ but the studio and the
 *   editor; library/; the repo's root files, the lockfile among them), and the two studio files
 *   a drawing passes through (app-driver.ts, which drives the page and takes the picture, and
 *   model-schema.ts, which reads every board's state);
 * - the content the page loads for the board: its chapter's built files (build/), which the
 *   preview fetches together, sound lengths included;
 * - the browser (its version: text is drawn by it);
 * - the ask (board, language, screen, pictures, steps, state, …).
 *
 * Wide on purpose: an input left out would hand back a stale drawing, one put in too many only
 * draws again. Only drawings that are the same every time are kept: the clock jumping, no frames
 * watched in real time, nothing still running, no errors the page logged.
 *
 * Off with CHALK_DRAW_CACHE=off (timings, tests that measure drawing).
 */

export const isDrawCacheOn = () => process.env.CHALK_DRAW_CACHE !== "off";

/** Files' times and sizes, then a hash of their bytes when those moved (an edit moves both). */
type Stamped = { stamp: string; key: string };
const stamped = new Map<string, Stamped>();

function hashOf(id: string, files: readonly string[]): string {
  const stamp = files
    .map((f) => {
      const s = statSync(f);
      return `${f}:${s.mtimeMs}:${s.size}`;
    })
    .join("\n");
  const last = stamped.get(id);
  if (last !== undefined && last.stamp === stamp) return last.key;
  const h = createHash("sha1");
  for (const f of files) h.update(f).update("\0").update(readFileSync(f)).update("\0");
  const key = h.digest("hex");
  stamped.set(id, { stamp, key });
  return key;
}

const SKIP = new Set(["node_modules", ".git", "dist", "out", "comments.yaml", "runs", "source"]);
function walk(dir: string, out: string[], skip: (path: string) => boolean): void {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir).sort()) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    if (skip(full)) continue;
    const s = statSync(full);
    if (s.isDirectory()) walk(full, out, skip);
    else if (s.isFile()) out.push(full);
  }
}

/** The code the page runs, and the two studio files a drawing passes through. */
export function codeKey(root: string): string {
  const files: string[] = [];
  for (const name of readdirSync(root).sort()) {
    const full = join(root, name);
    if (statSync(full).isFile()) files.push(full);
  }
  const studio = join(root, "platform", "studio");
  const editor = join(root, "platform", "editor");
  walk(join(root, "platform"), files, (p) => p === studio || p === editor);
  walk(join(root, "library"), files, () => false);
  files.push(
    join(studio, "src", "mcp", "app-driver.ts"),
    join(studio, "src", "mcp", "model-schema.ts"),
  );
  return hashOf("code", files);
}

/**
 * What every drawing goes through, whatever the board: the repo's root files (the lockfile, so every
 * package's version), the app the preview is (its page, styles, fonts, config, shell), and the two
 * studio files a drawing passes through.
 */
export function shellKey(root: string): string {
  const files: string[] = [];
  for (const name of readdirSync(root).sort()) {
    const full = join(root, name);
    if (statSync(full).isFile()) files.push(full);
  }
  walk(join(root, "platform", "apps", "learner"), files, () => false);
  const studio = join(root, "platform", "studio");
  files.push(
    join(studio, "src", "mcp", "app-driver.ts"),
    join(studio, "src", "mcp", "model-schema.ts"),
  );
  return hashOf("shell", files);
}

/** The code graph and the props' homes, made again only when some code changed. */
let known: { code: string; graph: CodeGraph; homes: ReadonlyMap<string, string> } | undefined;
function graphNow(root: string) {
  const code = codeKey(root);
  if (known?.code !== code) known = { code, graph: codeGraph(root), homes: propHomes(root) };
  return known;
}

/** The build's record of what made each board (build/reach.json), read again when it changes. */
let reachAt: { stamp: string; reach: Reach } | undefined;
function reachNow(root: string): Reach | undefined {
  const file = join(root, "build", "reach.json");
  if (!existsSync(file)) return undefined;
  const s = statSync(file);
  const stamp = `${s.mtimeMs}:${s.size}`;
  if (reachAt?.stamp !== stamp)
    reachAt = { stamp, reach: JSON.parse(readFileSync(file, "utf8")) as Reach };
  return reachAt.reach;
}

/**
 * The code a board's drawing depends on: the code that board runs (its fingerprint, reach/
 * board-code.ts: the lines that made it, every prop package it places, the player and every board's
 * styles) and what every drawing goes through (shellKey). An edit to a prop no board here places
 * leaves it alone. When the board's code can't be told (a prop's own page, a board not in the
 * build's record), all the code, as before.
 */
export function boardCodeKey(root: string, board: string): string {
  const made = reachNow(root)?.boards[board.replace(/^content\//, "")];
  if (made !== undefined) {
    const { graph, homes } = graphNow(root);
    const code = boardCode(graph, made, homes);
    if (code !== undefined) return `board:${code.digest}:${shellKey(root)}`;
  }
  return `all:${codeKey(root)}`;
}

/** What the page loads for a board: its chapter's built files (a prop's page loads only code). */
export function contentKey(root: string, board: string): string {
  const path = board.replace(/^content\//, "");
  const [book, chapter] = path.split("/");
  if (board.startsWith("library/") || book === undefined || chapter === undefined) return "code";
  const files: string[] = [];
  for (const top of ["index.json", `${book}.json`, `${book}/${chapter}.json`]) {
    const f = join(root, "build", top);
    if (existsSync(f)) files.push(f);
  }
  walk(join(root, "build", book, chapter), files, () => false);
  return hashOf(`content:${book}/${chapter}`, files);
}

/** A kept drawing: what `shoot` answered. */
export type Kept<T> = { drawn: T };

const dirOf = (root: string) => join(root, "node_modules", ".cache", "chalk-drawn");
/** One folder per board and ask: its drawings under each set of inputs, the newest few kept. */
const askDir = (root: string, board: string, ask: string) =>
  join(dirOf(root), board.replace(/^content\//, "").replace(/[^\w/.-]/g, "_"), ask);
const KEEP = 3;

/** Buffers (pictures) as base64, read back as Buffers. */
const replacer = (_: string, v: unknown) =>
  v !== null && typeof v === "object" && (v as { type?: string }).type === "Buffer"
    ? { $png: Buffer.from((v as { data: number[] }).data).toString("base64") }
    : v;
const reviver = (_: string, v: unknown) =>
  v !== null && typeof v === "object" && typeof (v as { $png?: unknown }).$png === "string"
    ? Buffer.from((v as { $png: string }).$png, "base64")
    : v;

export function keyOf(parts: Readonly<Record<string, unknown>>): string {
  return createHash("sha1").update(JSON.stringify(parts)).digest("hex").slice(0, 20);
}

export function readKept<T>(
  root: string,
  board: string,
  ask: string,
  key: string,
): Kept<T> | undefined {
  const file = join(askDir(root, board, ask), `${key}.json`);
  if (!existsSync(file)) return undefined;
  try {
    return JSON.parse(readFileSync(file, "utf8"), reviver) as Kept<T>;
  } catch {
    return undefined;
  }
}

export function keep<T>(
  root: string,
  board: string,
  ask: string,
  key: string,
  kept: Kept<T>,
): void {
  const dir = askDir(root, board, ask);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${key}.json`);
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(kept, replacer));
  renameSync(tmp, file);
  // The newest few sets of inputs stay; older builds' drawings go.
  const all = readdirSync(dir)
    .filter((n) => n.endsWith(".json"))
    .map((n) => ({ n, at: statSync(join(dir, n)).mtimeMs }))
    .sort((a, b) => b.at - a.at);
  for (const old of all.slice(KEEP)) rmSync(join(dir, old.n), { force: true });
}

/** Everything kept, gone (a test, or a reset by hand). */
export function forgetAll(root: string): void {
  rmSync(dirOf(root), { recursive: true, force: true });
  mkdirSync(dirname(dirOf(root)), { recursive: true });
}
