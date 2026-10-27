import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Reach } from "../content/build";
import { FactsCache } from "../reach/facts";
import {
  type Drawn,
  type Picture,
  type Shot,
  type ShotOptions,
  type Step,
  closeLane,
  shoot,
} from "./app-driver";
import type { NodeShape } from "./model-schema";
import { type Labels, type Tile, compose } from "./picture";
import { actionSites } from "./sites";

/**
 * What `look` and `play` answer (platform/docs/seeing-boards.md). The rule: return what only the
 * running board knows (its state, what can be done now, how it looks), and point at the code for
 * what the code says (full repo paths and lines). Nothing is shortened; how much comes back is
 * decided by what was pointed at.
 */

export type Locale = "en" | "hi";

/** What was pointed at. */
export type Target =
  | { kind: "piece"; board: string; address: string }
  | { kind: "board"; board: string }
  /** A lesson's pages, or a question family's questions: drawn by the lesson's page. */
  | { kind: "group"; path: string; unit: string; boards: string[] }
  /** A chapter or a book: checked, not pictured. */
  | { kind: "many"; path: string; units: string[]; boards: string[] };

export type BoardEntry = { board: string; lesson: string; kind: "page" | "question" };

/**
 * What a path names: `…/story#game` a piece (or `#game/plates` a part), a board, a lesson or a
 * question family, or anything above (a chapter, a book). Undefined when it names nothing built.
 */
export function targetOf(path: string, all: readonly BoardEntry[]): Target | undefined {
  const clean = path
    .trim()
    .replace(/\/$/, "")
    .replace(/\.json$/, "");
  const hash = clean.indexOf("#");
  if (hash !== -1) {
    const board = clean.slice(0, hash);
    const address = clean.slice(hash + 1);
    if (!all.some((b) => b.board === board) || address === "") return undefined;
    return { kind: "piece", board, address };
  }
  if (all.some((b) => b.board === clean)) return { kind: "board", board: clean };
  const lesson = all.filter((b) => b.lesson === clean && b.kind === "page");
  if (lesson.length > 0)
    return { kind: "group", path: clean, unit: clean, boards: lesson.map((b) => b.board) };
  const under = all.filter((b) => b.board.startsWith(`${clean}/`));
  if (under.length === 0) return undefined;
  const units = [...new Set(under.map((b) => b.lesson))];
  if (/\/questions\/[^/]+$/.test(clean) && units.length === 1)
    return {
      kind: "group",
      path: clean,
      unit: units[0] as string,
      boards: under.map((b) => b.board),
    };
  return { kind: "many", path: clean, units, boards: under.map((b) => b.board) };
}

// ---- Words for values: in full, as they are ----

/** A value written out in full: strings quoted, lists and objects as they are. */
export function full(v: unknown): string {
  // Quoted as written: only a quote inside and line breaks are marked.
  if (typeof v === "string") return `"${v.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
  if (v === null || v === undefined) return "none";
  if (typeof v !== "object") return String(v);
  if (Array.isArray(v)) return `[${v.map(full).join(", ")}]`;
  return `{${Object.entries(v as Record<string, unknown>)
    .map(([k, x]) => `${k}: ${full(x)}`)
    .join(", ")}}`;
}

/**
 * A value in the language shown: words written in both ({en, hi}) become the one on screen, at
 * any depth. Nothing else changes.
 */
export function shown<T>(v: T, locale: Locale): T {
  if (Array.isArray(v)) return v.map((x) => shown(x, locale)) as T;
  if (v === null || typeof v !== "object") return v;
  const keys = Object.keys(v);
  if (keys.length > 0 && keys.every((k) => k === "en" || k === "hi") && "en" in v) {
    const words = v as Record<string, unknown>;
    return (words[locale] ?? words.en) as T;
  }
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shown(x, locale)])) as T;
}

/** Fields as `name value · name value`, each in full. */
const fields = (r: Record<string, unknown>) =>
  Object.entries(r)
    .map(([k, v]) => `${k} ${full(v)}`)
    .join(" · ");

/** At a board, a field too long for one line is named, with where to see it whole. */
const BOARD_LINE = 100;
function boardFields(r: Record<string, unknown>, at: string): string {
  return Object.entries(r)
    .map(([k, v]) => {
      const words = full(v);
      if (words.length <= BOARD_LINE) return `${k} ${words}`;
      const size = Array.isArray(v) ? `${v.length} items` : `${words.length} characters`;
      return `${k} (${size}) → ${at}`;
    })
    .join(" · ");
}

const pad = (s: string, n: number) => (s.length >= n ? `${s} ` : s.padEnd(n));

// ---- Problems ----

/** Layout problems by piece name ("w2 (content/…:80): text cut off by 3px" → w2). */
export function problemsByPiece(overflow: readonly string[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const p of overflow) {
    const name = p.split(" (")[0] ?? "?";
    const what = p.slice(p.indexOf("): ") + 3);
    out.set(name, out.has(name) ? `${out.get(name)}; ${what}` : what);
  }
  return out;
}

// ---- Where things are written ----

/** The build's record of what each board was made from (build/reach.json). */
function readReach(root: string): Reach {
  const file = join(root, "build", "reach.json");
  if (!existsSync(file)) return { boards: {}, modules: {} };
  try {
    return JSON.parse(readFileSync(file, "utf8")) as Reach;
  } catch {
    return { boards: {}, modules: {} };
  }
}

let facts: FactsCache | undefined;
const factsOf = (root: string, file: string) => {
  facts ??= new FactsCache(join(root, "node_modules", ".cache", "chalk-reach", "facts.json"));
  return facts.get(join(root, file));
};

/**
 * Where each item of a list (options, by id) is written, inside the call a piece was placed by:
 * the line of its id in that call. Ids that aren't written there (made in code) have none.
 */
function itemLines(root: string, frame: string, ids: readonly string[]): Map<string, number> {
  const at = frame.lastIndexOf(":");
  const file = frame.slice(0, at);
  const line = Number(frame.slice(at + 1));
  const out = new Map<string, number>();
  const f = factsOf(root, file);
  if (f === undefined) return out;
  const call = f.calls
    .filter((r) => r[0] === line)
    .sort((a, b) => a[1] - a[0] - (b[1] - b[0]))
    .at(-1);
  if (call === undefined) return out;
  const lines = readFileSync(join(root, file), "utf8").split("\n");
  for (const id of ids) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const as = new RegExp(`(["'\`])${escaped}\\1|(^|[\\s{,])${escaped}\\s*:`);
    for (let n = call[0]; n <= call[1]; n++)
      if (as.test(lines[n - 1] ?? "")) {
        out.set(id, n);
        break;
      }
  }
  return out;
}

/** "content/x/overview.ts:34" → "overview.ts:34" (for lines inside the same file). */
const shortLine = (file: string, line: number) => `${file.split("/").at(-1)}:${line}`;

/** The setup, in full; a list of items with ids (options) one per line, with each one's line. */
function setupLines(
  root: string,
  setup: Record<string, unknown>,
  frame: string | undefined,
): string[] {
  const out: string[] = [];
  const plain: Record<string, unknown> = {};
  const lists: [string, Record<string, unknown>[]][] = [];
  for (const [k, v] of Object.entries(setup)) {
    const isItems =
      Array.isArray(v) &&
      v.length > 0 &&
      v.every((x) => x !== null && typeof x === "object" && "id" in (x as object));
    if (isItems) lists.push([k, v as Record<string, unknown>[]]);
    else plain[k] = v;
  }
  for (const [k, v] of Object.entries(plain)) out.push(`${k} ${full(v)}`);
  for (const [k, items] of lists) {
    const ids = items.map((i) => String(i.id));
    const lines = frame === undefined ? new Map<string, number>() : itemLines(root, frame, ids);
    const file = frame?.slice(0, frame.lastIndexOf(":")) ?? "";
    const isWritten = lines.size === ids.length;
    const written = [...ids].sort((a, b) => (lines.get(a) ?? 0) - (lines.get(b) ?? 0));
    const order = !isWritten
      ? "made in code"
      : written.every((id, i) => id === ids[i])
        ? "in the order written"
        : `shuffled (written as ${written.join(", ")})`;
    out.push(`${k}, ${order}:`);
    const width = Math.max(...ids.map((i) => i.length)) + 2;
    for (const item of items) {
      const { id, label, ...rest } = item;
      const where = lines.get(String(id));
      out.push(
        `  ${pad(String(id), width)}${label !== undefined ? `${full(label)}  ` : ""}${fields(rest)}${where !== undefined ? `  → ${shortLine(file, where)}` : ""}`.trimEnd(),
      );
    }
  }
  return out;
}

/** Writes lines under a heading, the heading's column held for the lines after the first. */
const block = (head: string, lines: readonly string[]) =>
  lines.map((l, i) => `${i === 0 ? pad(head, 9) : " ".repeat(9)}${l}`);

// ---- The answer for a board and for a piece ----

type Where = { sources: Record<string, { board?: string; pieces: Record<string, string> }> };

/** Every node of a board, groups' children after their group. */
function flat(nodes: readonly NodeShape[]): NodeShape[] {
  return nodes.flatMap((n) => [n, ...flat(n.children ?? [])]);
}

/** One version's heading: "ok · 390 · en" or "2 problems · 360 · hi". */
const versionWords = (shot: Shot, o: { width: number; locale: Locale; play?: boolean }) =>
  `${shot.overflow.length === 0 ? "ok" : `${shot.overflow.length} problem${shot.overflow.length === 1 ? "" : "s"}`} · ${o.width} · ${o.locale}${o.play ? " · played" : ""}`;

/** The board's answer: one line per piece, with its current state. */
export function boardText(
  shot: Shot,
  where: Where,
  versions: string,
  extra: { errors: readonly string[] },
): string {
  const site = where.sources[shot.board];
  const nodes = flat(shot.model?.nodes ?? []);
  const width = Math.max(6, ...nodes.map((n) => n.path.length + 2));
  const typeWidth = Math.max(6, ...nodes.map((n) => n.prop.length + 2));
  const out = [
    `${shot.board}   ${versions}`,
    `${pad("board", width)}${pad("", typeWidth)}→ ${site?.board ?? "?"}`,
  ];
  if (nodes.length === 0) out.push("(no board model: the page couldn't describe this board)");
  for (const n of nodes) {
    const source = site?.pieces[n.path];
    out.push(
      `${pad(n.path, width)}${pad(n.prop, typeWidth)}→ ${source ?? "?"}${n.isShown ? "" : "   [hidden now]"}`,
    );
    const live = { ...n.live };
    for (const [k, b] of Object.entries(n.bound)) live[k] = b.value;
    if (Object.keys(live).length > 0)
      out.push(`${" ".repeat(width)}now: ${boardFields(live, `${shot.board}#${n.path}`)}`);
  }
  if (shot.overflow.length > 0) out.push("problems:", ...shot.overflow.map((p) => `  ${p}`));
  if (extra.errors.length > 0) out.push("page errors:", ...extra.errors.map((e) => `  ${e}`));
  if (nodes.length > 0)
    out.push(
      `A piece's setup, parts and what can be done to it: look at ${shot.board}#${nodes[0]?.path}.`,
    );
  return out.join("\n");
}

/** A piece's answer: everything about it, each thing once. */
export function pieceText(
  root: string,
  shot: Shot,
  address: string,
  where: Where,
  versions: string,
): string {
  const pieceName = address.split("/")[0] ?? address;
  const node = flat(shot.model?.nodes ?? []).find((n) => n.path === pieceName);
  if (node === undefined) {
    const names = flat(shot.model?.nodes ?? []).map((n) => n.path);
    throw new Error(
      `No piece "${pieceName}" on ${shot.board} (pieces: ${names.join(", ") || "none described"}).`,
    );
  }
  const reach = readReach(root).boards[shot.board];
  const stack = reach?.pieces[pieceName]?.stack ?? [];
  const site = where.sources[shot.board]?.pieces[pieceName];
  const written = site ?? stack[0];
  const out = [`${shot.board}#${address}   ${node.prop}   ${versions}`];
  out.push(`${pad("written:", 9)}${written ?? "?"}`);
  const via = stack.filter((f) => f !== written);
  if (via.length > 0) out.push(...block("   via:", via));
  if (reach?.rows !== undefined) out.push(`${pad("  row:", 9)}${reach.rows}`);
  out.push("");
  if (Object.keys(node.setup).length > 0)
    out.push(...block("setup:", setupLines(root, node.setup, written)));
  if (Object.keys(node.live).length > 0)
    out.push(
      ...block(
        "now:",
        Object.entries(node.live).map(([k, v]) => `${k} ${full(v)}`),
      ),
    );
  const bound = Object.entries(node.bound);
  if (bound.length > 0)
    out.push(
      ...block(
        "worked out:",
        bound.map(([k, b]) => `${k} ${full(b.value)} ← ${b.from.join(", ") || "?"}`),
      ),
    );
  if (node.hidden !== undefined && Object.keys(node.hidden).length > 0)
    out.push(`hidden from the student: ${fields(node.hidden)}`);
  const sites = actionSites(root, node.prop);
  const can = node.can.map((c) => {
    const takes =
      c.takes !== undefined && c.takes !== null && Object.keys(c.takes as object).length > 0
        ? ` takes ${full(c.takes)}`
        : "";
    const at = c.codeAt ?? sites.get(c.action);
    return `${c.action}  (${c.who.join(", ")}${c.via.length > 0 ? `, via ${c.via.join(", ")}` : ""})${c.routed ? " routed by its group" : ""}${takes}${at ? `  → ${at}` : ""}`;
  });
  if (node.noControlNow?.length) can.push(`not reachable now: ${node.noControlNow.join(", ")}`);
  if (can.length > 0) out.push("", ...block("can:", can));
  // Parts, grouped by where they're drawn. A prop with no drawing of its own lists its fields as
  // parts: those are its setup and state, already above.
  const own = (path: string) => path.slice(pieceName.length + 1);
  const isFieldsOnly = node.parts.every(
    (p) => own(p.path) in node.setup || own(p.path) in node.live || own(p.path) === "canCheck",
  );
  const drawn = new Map<string, string[]>();
  for (const p of isFieldsOnly ? [] : node.parts) {
    const at = p.drawnAt ?? "?";
    drawn.set(at, [...(drawn.get(at) ?? []), p.path.slice(pieceName.length + 1) || p.path]);
  }
  if (drawn.size > 0)
    out.push(
      "",
      ...block(
        "parts:",
        [...drawn].map(([at, names]) => `${names.join(", ")} → ${at}`),
      ),
    );
  const mine = shot.overflow.filter((p) => p.startsWith(`${pieceName} (`));
  if (mine.length > 0 || node.problems.length > 0)
    out.push("", ...block("problems:", [...mine, ...node.problems]));
  return out.join("\n");
}

// ---- Drawing ----

export type LookArgs = {
  locales?: Locale[];
  widths?: number[];
  play?: boolean;
  labels?: boolean;
  continue?: boolean;
};

export type Answer = {
  text: string;
  image?: Buffer;
  structured: Record<string, unknown>;
};

const PHONE = 390;

type Version = { locale: Locale; width: number };

function versionsOf(a: { locales?: Locale[]; widths?: number[] }, isMany: boolean): Version[] {
  const locales = a.locales ?? (isMany ? (["en", "hi"] as Locale[]) : (["en"] as Locale[]));
  const widths = a.widths ?? (isMany ? [360, 640] : [PHONE]);
  return locales.flatMap((locale) => widths.map((width) => ({ locale, width })));
}

const captionOf = (v: Version, n: number) => (n > 1 ? `${v.locale} · ${v.width}` : "");

/** `look` at a piece, a board or a group. A chapter or book goes to `check`. */
export async function look(
  root: string,
  target: Exclude<Target, { kind: "many" }>,
  a: LookArgs,
  where: Where,
  lane: string,
): Promise<Answer> {
  const versions = versionsOf(a, false);
  if (a.continue === true && versions.length > 1)
    throw new Error("continue looks at the board as you left it: one language and one width.");
  const labels: Labels = a.labels === false ? "none" : target.kind === "piece" ? "parts" : "pieces";
  const options = (v: Version): ShotOptions => ({
    locale: v.locale,
    width: v.width,
    play: a.play === true,
    questions: target.kind === "group",
  });
  const board = target.kind === "group" ? target.unit : target.board;
  const drawn: Drawn[] = [];
  for (const v of versions) {
    const d = await shoot(
      root,
      board,
      options(v),
      a.continue === true ? { steps: [], shots: "last", isContinued: true } : undefined,
      lane,
    );
    for (const s of d.shots) if (s.model !== undefined) s.model = shown(s.model, v.locale);
    drawn.push(d);
  }
  if (target.kind === "group") {
    const wanted = new Set(target.boards);
    const tiles: Tile[] = [];
    const lines: string[] = [];
    let problems = 0;
    for (const [i, d] of drawn.entries()) {
      const v = versions[i] as Version;
      for (const s of d.shots.filter((x) => wanted.has(x.board))) {
        if (s.overflow.length > 0) {
          problems += 1;
          lines.push(
            `${s.board}${versions.length > 1 ? ` (${v.locale} · ${v.width})` : ""}`,
            ...s.overflow.map((p) => `  ${p}`),
          );
        }
        if (i === 0 || versions.length > 1)
          tiles.push({
            picture: pictureOf(s),
            labels: "none",
            caption: `${s.board.split("/").at(-1)}${versions.length > 1 ? ` · ${v.locale} ${v.width}` : ""}`,
          });
      }
    }
    const count = target.boards.length * versions.length;
    const image =
      tiles.length > 0 ? await compose(tiles, { kind: "grid", columns: 5, width: 160 }) : undefined;
    return {
      text: [
        `${target.path}: ${target.boards.length} board${target.boards.length === 1 ? "" : "s"}${versions.length > 1 ? `, ${count} drawings` : ""} · ${count - problems} ok · ${problems} with problems`,
        `boards: ${target.boards.map((b) => b.split("/").at(-1)).join(", ")}`,
        ...lines,
        "Look at a board for its pieces: …/<board>.",
      ].join("\n"),
      ...(image === undefined ? {} : { image }),
      structured: { target: target.path, boards: target.boards, problems },
    };
  }
  const shots = drawn.map((d) => d.shots[0]).filter((s): s is Shot => s !== undefined);
  const first = shots[0];
  if (first === undefined) throw new Error(`Nothing was drawn for ${board}.`);
  const heading = shots
    .map((s, i) => versionWords(s, { ...(versions[i] as Version), play: a.play === true }))
    .join(" | ");
  const text =
    target.kind === "piece"
      ? pieceText(root, first, target.address, where, heading)
      : boardText(first, where, heading, { errors: drawn[0]?.shots[0]?.errors ?? [] });
  const otherProblems = shots
    .slice(1)
    .flatMap((s, i) =>
      s.overflow.length === 0
        ? []
        : [
            `problems at ${versions[i + 1]?.locale} · ${versions[i + 1]?.width}:`,
            ...s.overflow.map((p) => `  ${p}`),
          ],
    );
  const image = await compose(
    shots.map((s, i) => ({
      picture: pictureOf(s),
      ...(target.kind === "piece" ? { crop: [target.address] } : {}),
      labels,
      problems: problemsByPiece(s.overflow),
      caption: captionOf(versions[i] as Version, shots.length),
    })),
    { kind: "row" },
  );
  return {
    text: [text, ...otherProblems].join("\n"),
    image,
    structured: {
      target: target.kind === "piece" ? `${target.board}#${target.address}` : target.board,
      versions: shots.map((s, i) => ({ ...versions[i], problems: s.overflow })),
      nodes: first.model?.nodes ?? [],
    },
  };
}

const pictureOf = (s: Shot): Picture => ({ png: s.png, width: s.width, boxes: s.boxes });

// ---- A chapter or book: checked, not pictured ----

/** How many pages draw at once for a check (each its own; agents' pages are left alone). */
const CHECK_PAGES = 3;

export async function check(
  root: string,
  target: Extract<Target, { kind: "many" }>,
  a: LookArgs,
  lane: string,
  progress: (message: string) => Promise<void>,
  signal: AbortSignal,
): Promise<Answer> {
  const versions = versionsOf(a, true);
  const jobs = target.units.flatMap((unit) => versions.map((v) => ({ unit, v })));
  const wanted = new Set(target.boards);
  const found: { board: string; v: Version; problems: string[] }[] = [];
  const seen = new Set<string>();
  let done = 0;
  let isCancelled = false;
  const worker = async (k: number) => {
    const myLane = `${lane}:check:${k}`;
    try {
      for (;;) {
        if (signal.aborted) {
          isCancelled = true;
          return;
        }
        const job = jobs.shift();
        if (job === undefined) return;
        const d = await shoot(
          root,
          job.unit,
          { locale: job.v.locale, width: job.v.width, questions: true, play: a.play === true },
          undefined,
          myLane,
        );
        for (const s of d.shots) {
          if (!wanted.has(s.board)) continue;
          seen.add(`${s.board}@${job.v.locale}${job.v.width}`);
          if (s.overflow.length > 0) found.push({ board: s.board, v: job.v, problems: s.overflow });
        }
        done += 1;
        await progress(`drawn ${seen.size} of ${target.boards.length * versions.length}`);
      }
    } finally {
      await closeLane(myLane);
    }
  };
  await Promise.all(Array.from({ length: CHECK_PAGES }, (_, k) => worker(k)));
  const total = target.boards.length * versions.length;
  const badBoards = new Set(found.map((f) => f.board));
  const missing = total - seen.size;
  const lines = [
    `${target.path}: ${target.boards.length} boards · ${seen.size} drawings (${[...new Set(versions.map((v) => v.locale))].join(", ")} × ${[...new Set(versions.map((v) => v.width))].join(", ")}) · ${target.boards.length - badBoards.size} ok · ${badBoards.size} with problems${isCancelled ? ` · cancelled after ${done} of ${done + jobs.length} lessons` : ""}`,
  ];
  if (missing > 0 && !isCancelled)
    lines.push(
      `${missing} drawings didn't come back (a board its lesson's page doesn't show): look at them one by one.`,
    );
  for (const board of badBoards) {
    lines.push(board);
    for (const f of found.filter((x) => x.board === board))
      lines.push(...f.problems.map((p) => `  ${f.v.locale} · ${f.v.width}: ${p}`));
  }
  if (badBoards.size > 0) lines.push("Look at a board to see it: look at …/<board>.");
  return {
    text: lines.join("\n"),
    structured: {
      target: target.path,
      boards: target.boards.length,
      drawings: seen.size,
      problems: found.map((f) => ({
        board: f.board,
        locale: f.v.locale,
        width: f.v.width,
        problems: f.problems,
      })),
      cancelled: isCancelled,
    },
  };
}

// ---- play ----

export type PlayArgs = {
  board: string;
  steps: Step[];
  continue?: boolean;
  shots?: "each" | "last" | "none";
  full?: boolean;
  locale?: Locale;
  width?: number;
  labels?: boolean;
};

/** A recorded event in words: what a tap set off, a signal, anything else. */
function eventWords(e: string, locale: Locale): string {
  const [kind = "", actor = "", ...rest] = e.split(" ");
  const raw = rest.join(" ");
  let payload: unknown;
  try {
    payload = shown(JSON.parse(raw), locale);
  } catch {
    payload = raw;
  }
  const p = (payload ?? {}) as Record<string, unknown>;
  if (kind === "cause" && typeof p.action === "string") {
    const args = p.args as Record<string, unknown> | undefined;
    return `${p.action}${args !== undefined && Object.keys(args).length > 0 ? ` ${full(args)}` : ""}${actor === "learner" ? "" : ` (${actor})`}`;
  }
  if (kind === "signal" && typeof p.signal === "string")
    return `signal ${p.signal}${p.payload !== undefined ? ` ${full(p.payload)}` : ""}`;
  return `${kind} ${actor} ${full(payload)}`;
}

/** The piece a changed value belongs to: "game.rounds" or "game/plates.count" → game. */
const pieceOfPath = (path: string) => path.split(/[./]/)[0] ?? path;

export async function play(root: string, a: PlayArgs, lane: string): Promise<Answer> {
  const shots = a.shots ?? "last";
  const o: ShotOptions = { locale: a.locale ?? "en", width: a.width ?? PHONE, play: true };
  const d = await shoot(
    root,
    a.board,
    o,
    { steps: a.steps, shots, isContinued: a.continue === true },
    lane,
  );
  const locale = o.locale ?? "en";
  for (const s of d.shots) if (s.model !== undefined) s.model = shown(s.model, locale);
  for (const r of d.steps) if (r.changed !== undefined) r.changed = shown(r.changed, locale);
  const lines = [`${a.board}   play · ${o.width} · ${o.locale}${a.continue ? " · continued" : ""}`];
  const changedPieces = new Set<string>();
  for (const [i, r] of d.steps.entries()) {
    const changed = Object.entries(r.changed ?? {});
    for (const [path] of changed) changedPieces.add(pieceOfPath(path));
    const parts = [
      ...r.events.map((e) => eventWords(e, locale)),
      ...changed.map(([path, c]) => `${path} ${full(c.was)} → ${full(c.now)}`),
    ];
    lines.push(
      `${i + 1}. ${r.step}${parts.length > 0 ? ` → ${parts.join(" · ")}` : " → nothing changed"}`,
    );
    if (r.passed) lines.push("   ✓ board passed");
    for (const e of r.errors) lines.push(`   ${e}`);
  }
  const shot = d.shots[0];
  const model = shot?.model;
  if (model !== undefined)
    lines.push(
      model.isPassed
        ? "passed"
        : `not passed${model.openQuestion ? `: ${model.openQuestion} is still open` : ""}`,
    );
  if (shot !== undefined && shot.overflow.length > 0)
    lines.push("problems now:", ...shot.overflow.map((p) => `  ${p}`));
  const labels: Labels = a.labels === false ? "none" : "pieces";
  const crop = a.full === true || changedPieces.size === 0 ? undefined : [...changedPieces];
  const after = [...d.steps].reverse().find((r) => r.picture !== undefined)?.picture;
  let image: Buffer | undefined;
  const has = (p: Picture, names: string[] | undefined) =>
    names === undefined || names.some((n) => p.boxes.some((b) => b.name === n));
  if (shots === "each") {
    const tiles: Tile[] = [];
    if (d.before !== undefined) tiles.push({ picture: d.before, labels, caption: "before" });
    for (const [i, r] of d.steps.entries())
      if (r.picture !== undefined)
        tiles.push({
          picture: r.picture,
          labels,
          caption: `${i + 1}. ${r.step}`,
          ...(crop !== undefined && has(r.picture, crop) ? { crop } : {}),
        });
    if (tiles.length > 0) image = await compose(tiles, { kind: "row" });
  } else if (shots === "last" && after !== undefined) {
    const tiles: Tile[] = [];
    if (d.before !== undefined)
      tiles.push({
        picture: d.before,
        labels,
        caption: "before",
        ...(crop !== undefined && has(d.before, crop) ? { crop } : {}),
      });
    tiles.push({
      picture: after,
      labels,
      caption: "after",
      problems: problemsByPiece(shot?.overflow ?? []),
      ...(crop !== undefined && has(after, crop) ? { crop } : {}),
    });
    image = await compose(tiles, { kind: "row" });
  }
  if (image !== undefined && crop !== undefined)
    lines.push(
      `picture: before | after, cut to ${crop.join(", ")} (full: true for the whole board)`,
    );
  return {
    text: lines.join("\n"),
    ...(image === undefined ? {} : { image }),
    structured: {
      board: a.board,
      steps: d.steps.map((r) => ({
        step: r.step,
        passed: r.passed,
        events: r.events,
        changed: r.changed ?? {},
        errors: r.errors,
      })),
      isPassed: model?.isPassed ?? false,
      nodes: model?.nodes ?? [],
    },
  };
}
