import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PROPS_ROOT, contentAddress, shownAddress } from "@chalk/content/address";
import { full } from "@chalk/content/words";
import type { PartSnapshot } from "@chalk/prop";
import type { Reach } from "../content/build";
import { buildInputsKey } from "../content/inputs";
import { useText, usesOf } from "../prop-text";
import { FactsCache } from "../reach/facts";
import { type Shown, keepShown } from "../reach/shown";
import type { ChapterScript, ScriptEntry } from "../sound/voice/make";
import type { Said } from "../sound/voice/said";
import {
  type Drawn,
  type Heard,
  LOOK_PAGES,
  type Picture,
  type Shot,
  type ShotOptions,
  type Step,
  closeLane,
  shoot,
  stillRunning,
  timing,
} from "./app-driver";
import type { NodeShape } from "./model-schema";
import { type Labels, type Tile, compose } from "./picture";
import { actionSites, defaultsSite, typeSite } from "./sites";

/**
 * What `show` answers (platform/docs/seeing-boards.md, platform/docs/show.md). The rule: return what only the
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

// ---- Words for values: in full, as they are (../words.ts) ----

export { full };

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
export function readReach(root: string): Reach {
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
  /** What the piece's parts show: a value shown there isn't written here again. */
  onScreen: ReadonlySet<string>,
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
  // A value a part shows is written once, with the part.
  for (const [k, v] of Object.entries(plain))
    if (!(typeof v === "string" && onScreen.has(v))) out.push(`${k} ${full(v)}`);
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
      const isShown = typeof label === "string" && onScreen.has(label);
      out.push(
        `  ${pad(String(id), width)}${label !== undefined && !isShown ? `${full(label)}  ` : ""}${fields(rest)}${where !== undefined ? `  → ${shortLine(file, where)}` : ""}`.trimEnd(),
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

/** One version's heading: "ok · 390 · en" or "2 problems · 360 · hi". */
/** A screen in words: "390" for a phone-height column, "640×720" when the height is given. */
export const screenWords = (s: { width: number; height?: number }) =>
  s.height === undefined ? `${s.width}` : `${s.width}×${s.height}`;

const versionWords = (shot: Shot, o: Version & { play?: boolean }) =>
  `${shot.overflow.length === 0 ? "ok" : `${shot.overflow.length} problem${shot.overflow.length === 1 ? "" : "s"}`} · ${screenWords(o)} · ${o.locale}${o.play ? " · played" : ""}`;

/**
 * The board's answer: one line per piece, written where (its file once, at the top; each piece
 * by its line in it), with its state where it isn't as the prop starts it.
 */
export function boardText(
  shot: Shot,
  where: Where,
  versions: string,
  extra: { errors: readonly string[] },
): string {
  const site = where.sources[shot.board];
  const nodes = shot.model?.nodes ?? [];
  const width = Math.max(6, ...nodes.map((n) => n.path.length + 2));
  const typeWidth = Math.max(6, ...nodes.map((n) => n.prop.length + 2));
  const out = [
    `${shownAddress(shot.board)}   ${versions}`,
    `${pad("board", width)}${pad("", typeWidth)}→ ${site?.board ?? "?"}`,
  ];
  if (nodes.length === 0) out.push("(no board model: the page couldn't describe this board)");
  const boardFile = site?.board?.slice(0, site.board.lastIndexOf(":"));
  for (const n of nodes) {
    const source = site?.pieces[n.path];
    const at =
      source !== undefined && boardFile !== undefined && source.startsWith(`${boardFile}:`)
        ? shortLine(boardFile, Number(source.slice(boardFile.length + 1)))
        : source;
    out.push(
      `${pad(n.path, width)}${pad(n.prop, typeWidth)}→ ${at ?? "?"}${n.isShown ? "" : "   [hidden now]"}`,
    );
    const atStart = new Set(n.atStart ?? []);
    const live = Object.fromEntries(Object.entries(n.live).filter(([k]) => !atStart.has(k)));
    for (const [k, b] of Object.entries(n.bound)) live[k] = b.value;
    if (Object.keys(live).length > 0)
      out.push(`${" ".repeat(width)}now: ${boardFields(live, shownAddress(shot.board, n.path))}`);
  }
  if (shot.overflow.length > 0) out.push("problems:", ...shot.overflow.map((p) => `  ${p}`));
  if (shot.running !== undefined) out.push(stillRunning(shot.running));
  if (extra.errors.length > 0) out.push("page errors:", ...extra.errors.map((e) => `  ${e}`));
  if (nodes.length > 0)
    out.push(
      `A piece's setup, its whole state, its parts and what can be done to it: show ${shownAddress(shot.board, nodes[0]?.path)}.`,
    );
  return out.join("\n");
}

/** A board's script, as the content build made it (build/<book>/<chapter>/script.json). */
function scriptEntries(root: string, board: string): readonly ScriptEntry[] {
  const [book, chapter] = board.split("/");
  const file = join(root, "build", `${book}`, `${chapter}`, "script.json");
  if (!existsSync(file)) return [];
  const script = JSON.parse(readFileSync(file, "utf8")) as ChapterScript;
  return script.boards.find((b) => b.path === board)?.lines ?? [];
}

/** One line in words: its moment, who says it, and what is said in each language (or is missing). */
function entryLines(e: ScriptEntry): string[] {
  const said = (s: Said | undefined) =>
    s === undefined
      ? "—"
      : "words" in s
        ? `"${s.words}" (${s.from})`
        : `NEEDS its spoken words: ${s.needs}${s.suggested === undefined ? "" : `; suggested "${s.suggested}"`}`;
  return [
    `${e.moment}: ${e.line} · ${e.speaker}`,
    ...Object.entries(e.said).map(([locale, s]) => `  ${locale}: ${said(s)}`),
  ];
}

/** A board's script: each line in order, its moment, who says it, and what the voice says. */
export function scriptText(root: string, board: string): string[] {
  const entries = scriptEntries(root, board);
  return entries.length === 0
    ? []
    : [
        "script (what the voice says, in order):",
        ...entries.flatMap((e) => entryLines(e).map((l) => `  ${l}`)),
      ];
}

/**
 * The line an address names on a board, if it names one: a line of its own by its name
 * (`board#finally`), a piece's as `board#fiveHouses/said`.
 */
function lineAt(
  root: string,
  board: string,
  address: string,
): { name: string; about?: string } | undefined {
  const lines = readReach(root).boards[board]?.lines;
  const [first, part, ...more] = address.split("/");
  if (lines === undefined || first === undefined || more.length > 0) return undefined;
  if (part !== undefined && part !== "said") return undefined;
  const entry = lines[first];
  // A piece's own name is the piece; its line is "<piece>/said". A line of its own has no piece.
  if (entry === undefined || (entry.piece !== undefined && part !== "said")) return undefined;
  return { name: first, ...(entry.about === undefined ? {} : { about: entry.about }) };
}

/** One line of a board, everything about it. */
function lineText(root: string, board: string, name: string): string[] {
  const reach = readReach(root).boards[board]?.lines?.[name];
  const entry = scriptEntries(root, board).find((e) => e.line === name);
  return [
    `${shownAddress(board, reach?.piece === undefined ? name : `${name}/said`)}   line`,
    ...(entry !== undefined
      ? entryLines(entry)
      : [
          `${reach?.moment ?? "?"}: ${name} · ${reach?.speaker ?? "?"} (no clips yet: pnpm build-content)`,
        ]),
  ];
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
  const node = (shot.model?.nodes ?? []).find((n) => n.path === pieceName);
  if (node === undefined) {
    const names = (shot.model?.nodes ?? []).map((n) => n.path);
    throw new Error(
      `No piece "${pieceName}" on ${shownAddress(shot.board)} (pieces: ${names.join(", ") || "none described"}).`,
    );
  }
  const reach = readReach(root).boards[shot.board];
  const stack = reach?.pieces[pieceName]?.stack ?? [];
  const site = where.sources[shot.board]?.pieces[pieceName];
  // A prop on its own page is written where it is defined; a piece, where the board places it.
  const written =
    site ?? stack[0] ?? (shot.board.startsWith(PROPS_ROOT) ? typeSite(root, node.prop) : undefined);
  const out = [`${shownAddress(shot.board, address)}   ${node.prop}   ${versions}`];
  out.push(`${pad("written:", 9)}${written ?? "?"}`);
  const via = stack.filter((f) => f !== written);
  if (via.length > 0) out.push(...block("   via:", via));
  if (reach?.rows !== undefined) out.push(`${pad("  row:", 9)}${reach.rows}`);
  out.push("");
  // Its setup: what the board gave where it placed it; the rest are the prop's defaults, pointed at.
  const given = Object.fromEntries(
    Object.entries(node.setup).filter(([k]) => node.given.includes(k)),
  );
  const defaultCount = Object.keys(node.setup).length - Object.keys(given).length;
  const setup = setupLines(
    root,
    given,
    written,
    new Set(node.parts.flatMap((p) => (typeof p.value === "string" ? [p.value] : []))),
  );
  if (defaultCount > 0) {
    const at = defaultsSite(root, node.prop);
    setup.push(`${defaultCount} more as the prop's defaults${at === undefined ? "" : `  → ${at}`}`);
  }
  if (setup.length > 0) out.push(...block("setup:", setup));
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
    return `${c.action}  (${c.who.join(", ")}${c.via.length > 0 ? `, via ${c.via.join(", ")}` : ""})${takes}${at ? `  → ${at}` : ""}`;
  });
  if (node.noControlNow?.length) can.push(`not reachable now: ${node.noControlNow.join(", ")}`);
  if (can.length > 0) out.push("", ...block("can:", can));
  // Parts, as the view draws them: what each shows or does, and where it's drawn.
  const partLine = (p: PartSnapshot): string => {
    const name = p.path.slice(pieceName.length + 1) || p.path;
    const shown =
      p.words !== undefined
        ? ` shows "${p.words}"`
        : p.value !== undefined
          ? ` shows ${full(p.value)}`
          : "";
    const does =
      p.does !== undefined
        ? ` does ${[p.does].flat().join(", ")}${p.args !== undefined ? ` ${full(p.args)}` : ""}${p.isByHand ? " (its own values)" : ""}${p.isOff ? " (off now)" : ""}`
        : "";
    return `${name}${shown}${does}${p.drawnAt !== undefined ? `  → ${p.drawnAt}` : ""}`;
  };
  if (node.parts.length > 0) out.push("", ...block("parts:", node.parts.map(partLine)));
  if (shot.running !== undefined) out.push("", stillRunning(shot.running));
  const mine = shot.overflow.filter((p) => p.startsWith(`${pieceName} (`));
  if (mine.length > 0 || node.problems.length > 0)
    out.push("", ...block("problems:", [...mine, ...node.problems]));
  return out.join("\n");
}

// ---- Drawing ----

/**
 * How fast boards' clocks run when looked at or played, unless asked otherwise: they jump to where
 * they end, each thing at its own time (platform/docs/one-clock.md).
 */
export const DEFAULT_SPEED = Number.POSITIVE_INFINITY;

/** A screen to draw on: the column's width, and the screen's height when it matters. */
export type Screen = { width: number; height?: number };

/** The screens a check draws every board on: a small phone, a laptop column, and a projector. */
export const CHECK_SCREENS: readonly Screen[] = [
  { width: 360, height: 640 },
  { width: 640 },
  { width: 640, height: 720 },
];

export type LookArgs = {
  /** How fast the board's clock runs (1: real time; default DEFAULT_SPEED). */
  speed?: number;
  locales?: Locale[];
  screens?: Screen[];
  play?: boolean;
  labels?: boolean;
  /** A prop on its own page: the fields it starts from, over its defaults. */
  state?: Readonly<Record<string, unknown>>;
  /** How many pages to draw the versions on at once (LOOK_PAGES); for measuring it. */
  pages?: number;
};

/** What a tool answers: text, and pictures, each arriving at the size it is seen (picture.ts). */
export type Answer = {
  text: string;
  images?: Buffer[];
};

/** The phone: the first of the check screens, where steps are done unless another is named. */
const PHONE = CHECK_SCREENS[0] as Screen;

type Version = Screen & { locale: Locale };

/** The versions to draw: both languages on the check screens, unless fewer are asked for. */
function versionsOf(a: { locales?: Locale[]; screens?: Screen[] }): Version[] {
  const locales = a.locales ?? (["en", "hi"] as Locale[]);
  const screens = a.screens ?? CHECK_SCREENS;
  return locales.flatMap((locale) => screens.map((screen) => ({ ...screen, locale })));
}

const captionOf = (v: Version, n: number) => (n > 1 ? `${v.locale} · ${screenWords(v)}` : "");

/** `show` without steps, at a piece, a board or a group. A chapter or book goes to `check`. */
export async function look(
  root: string,
  target: Exclude<Target, { kind: "many" }>,
  a: LookArgs,
  where: Where,
  lane: string,
): Promise<Answer> {
  // A line is part of the board: its answer is the line (its moment, who says it, what is said in
  // each language, its clips), with a picture of what it is about.
  const line = target.kind === "piece" ? lineAt(root, target.board, target.address) : undefined;
  if (line !== undefined && target.kind === "piece") {
    const about = line.about?.split(".")[0];
    const shown = await look(
      root,
      about === undefined
        ? { kind: "board", board: target.board }
        : { kind: "piece", board: target.board, address: about },
      a,
      where,
      lane,
    );
    return {
      ...shown,
      text: [...lineText(root, target.board, line.name), "", shown.text].join("\n"),
    };
  }
  const versions = versionsOf(a);
  const labels: Labels = a.labels === false ? "none" : target.kind === "piece" ? "parts" : "pieces";
  const isWholeProp =
    target.kind === "piece" && target.board.startsWith(PROPS_ROOT) && !target.address.includes("/");
  const options = (v: Version): ShotOptions => ({
    locale: v.locale,
    width: v.width,
    ...(v.height === undefined ? {} : { height: v.height }),
    play: a.play === true,
    questions: target.kind === "group",
    speed: a.speed ?? DEFAULT_SPEED,
    ...(a.state === undefined ? {} : { state: a.state }),
    // A whole prop on its own page: its page too (what it is for, every board that uses it).
    ...(isWholeProp ? { withProps: true } : {}),
    // A lesson's boards are thumbnails: no need for double resolution.
    pictures: target.kind === "group" ? "thumb" : "full",
  });
  const board = target.kind === "group" ? target.unit : target.board;
  // What a board shows in every version, kept for `changes` (reach/shown.ts): only a whole built
  // board, drawn as it is (every version, nothing hidden, no state given).
  const isWhole =
    target.kind === "board" &&
    !board.startsWith(PROPS_ROOT) &&
    a.locales === undefined &&
    a.screens === undefined &&
    a.play !== true &&
    a.state === undefined &&
    a.speed === undefined;
  const inputs = isWhole ? buildInputsKey(root) : "";
  const drawn = await drawVersions(root, board, versions, options, lane, a.pages);
  if (isWhole)
    keepShown(root, "open", shownBoard(board), { inputs, versions: shownOf(drawn, versions) });
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
            `${shownAddress(s.board)}${versions.length > 1 ? ` (${v.locale} · ${screenWords(v)})` : ""}`,
            ...s.overflow.map((p) => `  ${p}`),
          );
        }
        // Thumbnails of the first version: the others are checked, and their problems listed.
        if (i === 0)
          tiles.push({
            picture: pictureOf(s),
            labels: "none",
            caption: s.board.split("/").at(-1) ?? s.board,
          });
      }
    }
    const count = target.boards.length * versions.length;
    const images =
      tiles.length > 0 ? await compose(tiles, { kind: "grid", columns: 5, width: 160 }) : [];
    return {
      text: [
        `${contentAddress(target.path)}: ${target.boards.length} board${target.boards.length === 1 ? "" : "s"}${versions.length > 1 ? `, ${count} drawings` : ""} · ${count - problems} ok · ${problems} with problems${versions.length > 1 ? ` (thumbnails: ${captionOf(versions[0] as Version, 2)})` : ""}`,
        `boards: ${target.boards.map((b) => b.split("/").at(-1)).join(", ")}`,
        ...lines,
        `Show a board for its pieces: ${contentAddress(target.path)}/<board>.`,
      ].join("\n"),
      images,
    };
  }
  const shots = drawn.map((d) => d.shots[0]).filter((s): s is Shot => s !== undefined);
  const first = shots[0];
  if (first === undefined) throw new Error(`Nothing was drawn for ${shownAddress(board)}.`);
  const heading = shots
    .map((s, i) => versionWords(s, { ...(versions[i] as Version), play: a.play === true }))
    .join(" | ");
  const page = isWholeProp
    ? drawn[0]?.props?.find((p) => p.address === (target as { board: string }).board)
    : undefined;
  const text =
    target.kind === "piece"
      ? [
          pieceText(root, first, target.address, where, heading),
          ...(page === undefined
            ? []
            : ["", useText(page, usesOf(readReach(root)).get(page.type) ?? [])]),
        ].join("\n")
      : [
          boardText(first, where, heading, { errors: drawn[0]?.shots[0]?.errors ?? [] }),
          ...scriptText(root, first.board),
        ].join("\n");
  const otherProblems = shots
    .slice(1)
    .flatMap((s, i) =>
      s.overflow.length === 0
        ? []
        : [
            `problems at ${versions[i + 1]?.locale} · ${screenWords(versions[i + 1] as Version)}:`,
            ...s.overflow.map((p) => `  ${p}`),
          ],
    );
  // Each version a picture of its own, so each arrives at the size it was drawn.
  const images: Buffer[] = [];
  for (const [i, s] of shots.entries())
    images.push(
      ...(await timedCompose(() =>
        compose(
          [
            {
              picture: pictureOf(s),
              ...(target.kind === "piece" ? { crop: [target.address] } : {}),
              labels,
              problems: problemsByPiece(s.overflow),
              caption: captionOf(versions[i] as Version, shots.length),
            },
          ],
          { kind: "row" },
        ),
      )),
    );
  return {
    text: [text, ...otherProblems].join("\n"),
    images,
  };
}

/** Each version drawn, at once, on up to LOOK_PAGES pages: the caller's own and pages of its own. */
async function drawVersions(
  root: string,
  board: string,
  versions: readonly Version[],
  options: (v: Version) => ShotOptions,
  lane: string,
  pages = LOOK_PAGES,
): Promise<Drawn[]> {
  const drawn: Drawn[] = new Array(versions.length);
  let next = 0;
  const worker = async (k: number) => {
    for (let i = next++; i < versions.length; i = next++) {
      const v = versions[i] as Version;
      const d = await shoot(root, board, options(v), undefined, k === 0 ? lane : `${lane}:v:${k}`);
      for (const s of d.shots) if (s.model !== undefined) s.model = shown(s.model, v.locale);
      drawn[i] = d;
    }
  };
  await Promise.all(Array.from({ length: Math.min(pages, versions.length) }, (_, k) => worker(k)));
  return drawn;
}

/** A board's path as `changes` keeps it: "class9-maths/…", without content/. */
const shownBoard = (board: string) => board.replace(/^content\//, "");

/** What each version showed: its picture, where each piece is, and each piece's state and problems. */
function shownOf(drawn: readonly Drawn[], versions: readonly Version[]): Shown["versions"] {
  return drawn.flatMap((d, i) => {
    const s = d.shots[0];
    const v = versions[i];
    if (s === undefined || v === undefined) return [];
    const problems = problemsByPiece(s.overflow);
    const read = (s.model?.nodes ?? [])
      .map((n) => {
        const bound = Object.fromEntries(Object.entries(n.bound).map(([k, b]) => [k, b.value]));
        // A part's words are read in English whatever the version (the agents' language): each
        // version's own words are in its state and its picture.
        const parts = n.parts.map((p) =>
          v.locale === "en"
            ? [p.path, p.words ?? p.value ?? null, p.isOff === true]
            : [p.path, p.isOff === true],
        );
        return `${n.path}: ${JSON.stringify({ isShown: n.isShown, setup: n.setup, live: n.live, bound, parts, problem: problems.get(n.path) ?? null })}`;
      })
      .join("\n");
    return [
      {
        version: `${v.locale} · ${screenWords(v)}`,
        read,
        boxes: s.boxes.filter((b) => b.kind === "piece"),
        scale: s.png.length > 0 ? s.png.readUInt32BE(16) / s.width : 2,
        png: s.png,
      },
    ];
  });
}

/**
 * A board drawn as `show` draws it without steps, every version, as `changes` keeps it: for a
 * board whose make-up changed, or one passed without a drawing from its review.
 */
export async function drawShown(root: string, board: string, lane: string): Promise<Shown> {
  const inputs = buildInputsKey(root);
  const versions = versionsOf({});
  const drawn = await drawVersions(
    root,
    shownBoard(board),
    versions,
    (v) => ({
      locale: v.locale,
      width: v.width,
      ...(v.height === undefined ? {} : { height: v.height }),
      speed: DEFAULT_SPEED,
      pictures: "full",
    }),
    lane,
  );
  return { inputs, versions: shownOf(drawn, versions) };
}

/** The pictures put together, timed when something measures (timing in app-driver.ts). */
async function timedCompose<T>(fn: () => Promise<T>): Promise<T> {
  if (!timing.isOn) return fn();
  const t = performance.now();
  try {
    return await fn();
  } finally {
    timing.spent.set(
      "compose",
      (timing.spent.get("compose") ?? 0) + (performance.now() - t) / 1000,
    );
  }
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
  const versions = versionsOf(a);
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
          {
            locale: job.v.locale,
            width: job.v.width,
            ...(job.v.height === undefined ? {} : { height: job.v.height }),
            questions: true,
            play: a.play === true,
            speed: a.speed ?? DEFAULT_SPEED,
            // A check reads the layout; it shows no pictures.
            pictures: "none",
          },
          undefined,
          myLane,
        );
        for (const s of d.shots) {
          if (!wanted.has(s.board)) continue;
          seen.add(`${s.board}@${job.v.locale}${screenWords(job.v)}`);
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
    `${contentAddress(target.path)}: ${target.boards.length} boards · ${seen.size} drawings (${[...new Set(versions.map((v) => v.locale))].join(", ")} × ${[...new Set(versions.map((v) => screenWords(v)))].join(", ")}) · ${target.boards.length - badBoards.size} ok · ${badBoards.size} with problems${isCancelled ? ` · cancelled after ${done} of ${done + jobs.length} lessons` : ""}`,
  ];
  if (missing > 0 && !isCancelled)
    lines.push(
      `${missing} drawings didn't come back (a board its lesson's page doesn't show): show them one by one.`,
    );
  for (const board of badBoards) {
    lines.push(shownAddress(board));
    for (const f of found.filter((x) => x.board === board))
      lines.push(...f.problems.map((p) => `  ${f.v.locale} · ${screenWords(f.v)}: ${p}`));
  }
  if (badBoards.size > 0) lines.push("Show a board to see it: show its address.");
  return {
    text: lines.join("\n"),
  };
}

// ---- play ----

export type PlayArgs = {
  board: string;
  /**
   * Watch the board move after each step: a frame about every `every` ms (real time), at most
   * `most` kept (those that differ). The clock runs at real speed unless `speed` says otherwise.
   */
  frames?: { every?: number; most?: number };
  /** The screen the steps are done on (default the phone: 360×640). */
  screen?: Screen;
  /** How fast the board's clock runs (1: real time; default DEFAULT_SPEED). */
  speed?: number;
  steps: Step[];
  shots?: "each" | "last" | "none";
  full?: boolean;
  locale?: Locale;
  labels?: boolean;
  /** A prop on its own page: the fields it starts from, over its defaults. */
  state?: Readonly<Record<string, unknown>>;
};

/** A recorded event, read: its kind, who, and what it carries (an action's arguments, a signal's payload). */
type Event = { kind: string; actor: string; name: string; data: unknown; extra: string };

function readEvent(e: string, locale: Locale): Event {
  const [kind = "", actor = "", ...rest] = e.split(" ");
  const raw = rest.join(" ");
  let payload: unknown;
  try {
    payload = shown(JSON.parse(raw), locale);
  } catch {
    payload = raw;
  }
  const p = rounded(payload ?? {}) as Record<string, unknown>;
  if (kind === "cause" && typeof p.action === "string") {
    const args = p.args as Record<string, unknown> | undefined;
    return {
      kind,
      actor,
      name: p.action,
      data: args !== undefined && Object.keys(args).length > 0 ? args : undefined,
      extra: actor === "learner" ? "" : ` (${actor})`,
    };
  }
  if (kind === "signal" && typeof p.signal === "string")
    return { kind, actor, name: `signal ${p.signal}`, data: p.payload, extra: "" };
  return { kind, actor, name: `${kind} ${actor}`, data: payload, extra: "" };
}

const eventWords = (e: Event) =>
  `${e.name}${e.data !== undefined ? ` ${full(e.data)}` : ""}${e.extra}`;

/**
 * Events in words, a run of the same one folded into one line: a drag through seven squares is
 * `movePoint ×7: {x: 4, y: 3} → {x: -2, y: 4}` and `signal moved ×7`, not fourteen lines.
 */
export function eventLines(events: readonly string[], locale: Locale): string[] {
  const read = events.map((e) => readEvent(e, locale));
  // Actions and signals interleave (move, moved, move, moved…): fold each name's run on its own.
  const runs: { first: Event; last: Event; count: number }[] = [];
  for (const e of read) {
    // One of the last two runs (so an action and the signal it raises fold side by side).
    const run = runs.slice(-2).find((r) => r.first.name === e.name && r.first.extra === e.extra);
    if (run !== undefined) {
      run.last = e;
      run.count += 1;
    } else runs.push({ first: e, last: e, count: 1 });
  }
  return runs.map(({ first, last, count }) => {
    if (count === 1) return eventWords(first);
    const from = first.data === undefined ? "" : ` ${full(first.data)}`;
    const to = last.data === undefined ? "" : ` → ${full(last.data)}`;
    return `${first.name} ×${count}${from === "" && to === "" ? "" : `:${from}${to}`}${first.extra}`;
  });
}

/** Frames in a strip: four to a row, each this wide (CSS pixels), so a frame stays readable. */
const FRAMES_PER_ROW = 4;
const FRAME_WIDTH = 320;

/**
 * A value for reading in the steps' lines: numbers to 3 decimals (a glide caught midway is
 * 1.0198540144593176). Only what is written; values sent to actions and a board's state stay exact.
 */
function rounded(v: unknown): unknown {
  if (typeof v === "number") return Number.isInteger(v) ? v : Number(v.toFixed(3));
  if (Array.isArray(v)) return v.map(rounded);
  if (v !== null && typeof v === "object")
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, rounded(x)]));
  return v;
}

/** The piece a changed value belongs to: "game.rounds" or "game/plates.count" → game. */
const pieceOfPath = (path: string) => path.split(/[./]/)[0] ?? path;

/** What was heard, in words: `   said · narrator · fiveHouses: "Street 4 rises…" (6.8 s)`, `   sound · step (line.walker.stepped)`. */
function heardLine(h: Heard): string {
  if ("sound" in h) return `   sound · ${h.sound} (${h.signal})`;
  const cut = h.cutAt === undefined ? "" : `, cut after ${(h.cutAt - h.at).toFixed(1)} s`;
  return `   said · ${h.speaker} · ${h.line}: "${h.words}" (${h.seconds.toFixed(1)} s${cut})`;
}

export async function play(root: string, a: PlayArgs, lane: string): Promise<Answer> {
  const shots = a.shots ?? "last";
  const screen = a.screen ?? PHONE;
  const o: ShotOptions = {
    locale: a.locale ?? "en",
    width: screen.width,
    ...(screen.height === undefined ? {} : { height: screen.height }),
    play: true,
    // Motion is watched at real speed: at 10× there would be nothing to see.
    speed: a.speed ?? (a.frames === undefined ? DEFAULT_SPEED : 1),
    ...(a.state === undefined ? {} : { state: a.state }),
  };
  // A prop on its own page: its parts are named under it, without the piece (which is the prop).
  const isProp = a.board.startsWith(PROPS_ROOT);
  // A part's name as steps write it: "town/walker/walker", not its encoded segment (walker%2Fwalker).
  const local = (encoded: string) => {
    const path = decodeURIComponent(encoded);
    return isProp ? path.split("/").slice(1).join("/") || path : path;
  };
  const piece = `${a.board.split("/").at(-1)}/`;
  const stepAsked = (words: string) => (isProp ? words.replace(` ${piece}`, " ") : words);
  const frames =
    a.frames === undefined ? undefined : { every: a.frames.every ?? 100, most: a.frames.most ?? 6 };
  const d = await shoot(
    root,
    a.board,
    o,
    { steps: a.steps, shots, ...(frames ? { frames } : {}) },
    lane,
  );
  const locale = o.locale ?? "en";
  for (const s of d.shots) if (s.model !== undefined) s.model = shown(s.model, locale);
  for (const r of d.steps)
    if (r.changed !== undefined) r.changed = rounded(shown(r.changed, locale)) as typeof r.changed;
  const lines = [
    `${shownAddress(a.board)}   ${a.steps.length} step${a.steps.length === 1 ? "" : "s"} · ${screenWords(screen)} · ${o.locale}${o.speed === 1 ? " · real time" : Number.isFinite(o.speed) ? ` · clock ×${o.speed}` : ""}`,
  ];
  if (d.runningAtOpen !== undefined) lines.push(`as it opened: ${stillRunning(d.runningAtOpen)}`);
  if (d.heardAtOpen !== undefined) lines.push("as it opened:", ...d.heardAtOpen.map(heardLine));
  const changedPieces = new Set<string>();
  for (const [i, r] of d.steps.entries()) {
    const changed = Object.entries(r.changed ?? {});
    for (const [path] of changed) changedPieces.add(pieceOfPath(path));
    const parts = [
      ...eventLines(r.events, locale),
      ...changed.map(([path, c]) =>
        c.was === undefined
          ? `+ ${local(path)} ${full(c.now)}`
          : c.now === undefined
            ? `− ${local(path)}`
            : `${local(path)} ${full(c.was)} → ${full(c.now)}`,
      ),
    ];
    if (r.motion !== undefined)
      parts.push(
        r.motion.stillAfter !== undefined
          ? r.motion.frames.length === 1
            ? `still after ${r.motion.stillAfter}s (nothing moved)`
            : `still after ${r.motion.stillAfter}s (${r.motion.frames.length} different frames)`
          : r.motion.stoppedBy === "most"
            ? `${r.motion.frames.length} different frames by ${r.motion.stillChangingAt}s, the most asked for: not watched to the end (ask for more frames)`
            : `still changing after ${r.motion.stillChangingAt}s`,
      );
    lines.push(
      // A step that failed says only that: "nothing changed" would read as a step that ran.
      `${i + 1}. ${stepAsked(r.step)}${parts.length > 0 ? ` → ${parts.join(" · ")}` : r.errors.length > 0 ? " → didn't run" : " → nothing changed"}`,
    );
    for (const h of r.heard ?? []) lines.push(heardLine(h));
    if (r.passed) lines.push("   ✓ board passed");
    for (const e of r.errors) lines.push(`   ${e}`);
  }
  const shot = d.shots[0];
  const model = shot?.model;
  if (model !== undefined && !isProp)
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
  const images: Buffer[] = [];
  const has = (p: Picture, names: string[] | undefined) =>
    names === undefined || names.some((n) => p.boxes.some((b) => b.name === n));
  const motions = d.steps.filter((r) => r.motion !== undefined);
  if (motions.length > 0) {
    // The frames, in order, each at its time after its step; cut to what the steps changed.
    const tiles: Tile[] = [];
    for (const [i, r] of d.steps.entries())
      for (const f of r.motion?.frames ?? [])
        tiles.push({
          picture: f.picture,
          labels: "none",
          caption: `${d.steps.length > 1 ? `${i + 1}. ` : ""}${f.t}s`,
          ...(crop !== undefined && has(f.picture, crop) ? { crop } : {}),
        });
    // A grid, four to a row, so each frame stays big enough to read.
    if (tiles.length > 0)
      images.push(
        ...(await compose(tiles, {
          kind: "grid",
          columns: Math.min(FRAMES_PER_ROW, tiles.length),
          width: FRAME_WIDTH,
        })),
      );
  } else if (shots === "each") {
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
    // Each step a picture of its own: a row of them would be shrunk to fit.
    for (const tile of tiles) images.push(...(await compose([tile], { kind: "row" })));
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
    // Before, then after: each a picture of its own, so neither is shrunk to fit beside the other.
    for (const tile of tiles) images.push(...(await compose([tile], { kind: "row" })));
  }
  if (images.length > 0 && crop !== undefined)
    lines.push(
      motions.length > 0
        ? `picture: the frames that differed, in order, cut to ${crop.join(", ")} (full: true for the whole board)`
        : `pictures: before, after, cut to ${crop.join(", ")} (full: true for the whole board)`,
    );
  return {
    text: lines.join("\n"),
    images,
  };
}
