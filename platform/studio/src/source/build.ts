import { isDeepStrictEqual } from "node:util";
import { Locale } from "@chalk/content";
import { plain } from "./hindi/candidates";
import { hasHindi } from "./hindi/script";
import type { DrawnObject } from "./objects";
import { tryExpand } from "./ranges";
import type { NumberedPage, Word } from "./read";
import {
  type Box,
  CROPPED,
  type Cause,
  type Item,
  ItemKind,
  type Made,
  Maker,
  type PageBlock,
  type PageFile,
  type Term,
  Tool,
} from "./schema";
import type { TextPiece } from "./scripts";
import { SnapIssue, snap, tableCells } from "./snap";
import { rowsOf } from "./snap";
import { type WordSuggestion, wordSuggestions } from "./suggest";
import { TOOL_VERSIONS } from "./tools";

/**
 * Building a chapter's items from the agents' page files and the PDF's words
 * (platform/docs/plans/sources.md, "The stages", 3): each block's words from the PDF, the tools'
 * suggestions and the agent's readings over them; figures and tables from the rough boxes, snapped to
 * what the PDF drew; a block that continues joined with the next page's continued block, ids by
 * position, the terms, and what is to be cropped. Each piece keeps who made it. Nothing here judges:
 * what can't be told apart from a mistake goes up as a question.
 */

/** A span not as the PDF gives it: its words, the PDF's words for them, the text, and who made it. */
export type Reading = { span: string; ids: string[]; pdf: string[]; text: string; by: Maker };

/** What the agent replaced of the tools' work. */
export const Edit = {
  /** A reading over a tool's. */
  Reading: "reading",
  /** A reading where the tools flagged nothing. */
  Addition: "addition",
  Box: "box",
  Cells: "cells",
} as const;
export type Edit = (typeof Edit)[keyof typeof Edit];

/** One override, what `pnpm source feedback` lists. */
export type Override = {
  tool: Tool;
  version: number;
  page: number;
  range: string;
  edit: Edit;
  suggested: string;
  decided: string;
  cause?: Cause;
};

/** How an override with no cause is asked about. A cause is the only answer: it can't be argued away. */
export const NO_CAUSE = "no cause ";

/** A question the build raises on a page: its id and what it asks. */
export type Raised = { id: string; question: string };

/** The agent's piece is what the tool gives now: the page file's copy can go (`--tidy` takes it). */
function raiseMatch(at: BlockContext, id: string, what: string, tool: Tool): void {
  at.raised.push({
    id: `matches ${id}`,
    question: `${what} is what ${tool} gives: now matches the tool, drop it`,
  });
}

/**
 * The agent replaced a tool's piece: the override recorded (`pnpm source feedback` gathers them), and
 * its cause asked for if neither the piece nor the page gives one.
 */
function recordOverride(
  at: BlockContext,
  id: string,
  what: string,
  o: Omit<Override, "version" | "page">,
): void {
  if (o.cause === undefined)
    at.raised.push({
      id: `${NO_CAUSE}${id}`,
      question: `${what} replaces ${o.tool}'s "${o.suggested}": give its cause, here or for the page`,
    });
  at.overrides.push({ ...o, version: TOOL_VERSIONS[o.tool], page: at.page });
}

/** What the page's tools have to work from, beyond its words. */
export type PageTools = {
  /** The PDF's drawn objects on this page. */
  objects?: readonly DrawnObject[];
  /** The PDF's text pieces on this page, with their sizes and baselines (the scripts tool reads them). */
  texts?: readonly TextPiece[];
  /** Whether a part of the page shows anything, the words of other blocks aside (snap asks it). */
  shows?: (others: readonly Word[]) => (part: Box) => boolean;
};

/** One block of a page, built. */
export type Block = {
  page: number;
  /** What names it in an issue: its first word (`L12.1`), or `block 3` when it has none. */
  handle: string;
  kind: ItemKind;
  /** Its number's and title's text; `numberIds` for the check that the number is in its words. */
  number?: string;
  numberIds?: string[];
  title?: string;
  answer?: string;
  /** Its words' ids, in reading order. */
  ids: string[];
  text: string;
  /** The box decided: snapped, the agent's, or (no drawing found) the rough one. */
  box?: Box;
  rows?: string[][];
  continued: boolean;
  continues: boolean;
  readings: Reading[];
  /** What of its box and cells isn't the PDF's. */
  made: Made[];
};

/** A page built: its blocks, which holders each word is in, and what can't be meant. */
export type BuiltPage = {
  page: number;
  file: PageFile;
  words: NumberedPage;
  blocks: Block[];
  /** Each word's holders (`furniture`, a block's handle), for the checks that every word is in one. */
  holders: Map<string, string[]>;
  /** Each term's span, its words, and the block it is in, if any. */
  terms: { span: string; ids: string[]; block?: Block }[];
  /** What can't be meant: a range not on the page, a reading outside its block. */
  problems: string[];
  /** The questions raised on the way: spans left, partial overlaps, an override that now matches. */
  raised: Raised[];
  overrides: Override[];
};

const textOf = (words: NumberedPage, ids: readonly string[]) =>
  ids.map((id) => words.words.get(id)?.text ?? "");

/** A word's text with the readings over it: a reading's first word is it, the rest are empty. */
function decidedWords(readings: readonly Reading[]): Map<string, string> {
  const replaced = new Map<string, string>();
  for (const r of readings) r.ids.forEach((id, k) => replaced.set(id, k === 0 ? r.text : ""));
  return replaced;
}

/** Some words with the readings that fall among them put in. */
function withReadings(words: NumberedPage, ids: readonly string[], readings: readonly Reading[]) {
  const replaced = decidedWords(readings);
  return ids
    .map((id) => replaced.get(id) ?? words.words.get(id)?.text ?? "")
    .filter((w) => w !== "")
    .join(" ")
    .replace(/\t+/g, " ");
}

/** What the tools alone make of some words: their readings in, the rest as the PDF gives them. */
function asTheToolsGive(
  words: NumberedPage,
  ids: readonly string[],
  touched: readonly WordSuggestion[],
): string {
  const readings = touched.flatMap((s): Reading[] =>
    s.reading === undefined
      ? []
      : [{ span: s.range, ids: s.ids, pdf: s.pdf, text: s.reading, by: s.by }],
  );
  return withReadings(words, ids, readings);
}

/** One page file read against the page's words, with what the tools suggest for it. */
export function buildPage(file: PageFile, words: NumberedPage, tools: PageTools = {}): BuiltPage {
  const problems: string[] = [];
  const raised: Raised[] = [];
  const overrides: Override[] = [];
  const holders = new Map<string, string[]>();
  const hold = (ids: readonly string[], who: string) => {
    for (const id of ids) holders.set(id, [...(holders.get(id) ?? []), who]);
  };
  hold(tryExpand(file.furniture ?? "", words, problems, "furniture") ?? [], "furniture");
  const at: BlockContext = {
    page: file.page,
    ...(file.cause === undefined ? {} : { cause: file.cause }),
    words,
    tools,
    suggestions: wordSuggestions(words, tools.texts),
    problems,
    raised,
    overrides,
  };
  const blocks = file.blocks.map((b, i) => buildBlock(b, i, at));
  for (const b of blocks) hold(b.ids, b.handle);
  const terms = (file.terms ?? []).map((span) => {
    const ids = tryExpand(span, words, problems, `term "${span}"`) ?? [];
    const block = blocks.find((b) => ids.length > 0 && ids.every((id) => b.ids.includes(id)));
    return { span, ids, ...(block === undefined ? {} : { block }) };
  });
  const seen = new Set<string>();
  const once = raised.filter((r) => !seen.has(r.id) && seen.add(r.id));
  const given = new Set(overrides.flatMap((o) => (o.cause === undefined ? [] : [o.cause])));
  for (const c of Object.keys(file.notes ?? {}))
    if (!given.has(c as Cause)) problems.push(`a note on "${c}", which no override here gives`);
  return {
    page: file.page,
    file,
    words,
    blocks,
    holders,
    terms,
    problems,
    raised: once,
    overrides,
  };
}

type BlockContext = {
  page: number;
  /** The page's own cause: of every override that names none. */
  cause?: Cause;
  words: NumberedPage;
  tools: PageTools;
  suggestions: readonly WordSuggestion[];
  problems: string[];
  raised: Raised[];
  overrides: Override[];
};

/** An agent's reading as the page file gives it: its range, its words (when the range is real), text. */
type Entry = { span: string; ids: string[]; text: string };

/**
 * The agent's readings that, read apart, together spell a tool's suggestion exactly, spacing aside
 * ("Na" and "⁺" read on their own lines where the scripts tool reads "Na⁺"): those now match the tool.
 * Readings and the suggestions they touch form groups; a group goes whole or not at all: every
 * suggestion in it spelled by its readings in order, every word of each reading inside one of them (an
 * empty reading blanking more, a stray digit too, keeps the group).
 */
function spelledTogether(
  entries: readonly Entry[],
  suggestions: readonly WordSuggestion[],
  words: NumberedPage,
): Set<string> {
  const runs = suggestions.filter((s) => s.reading !== undefined);
  const touching = (e: Entry, s: WordSuggestion) => e.ids.some((id) => s.ids.includes(id));
  const spells = (s: WordSuggestion) => {
    const parts = entries.filter((e) => touching(e, s));
    if (!parts.every((e) => e.text === "" || e.ids.every((id) => s.ids.includes(id)))) return false;
    const at = (e: Entry) =>
      Math.min(...e.ids.map((id) => s.ids.indexOf(id)).filter((k) => k >= 0));
    const covered = new Set(parts.flatMap((e) => e.ids));
    const uncovered = s.ids.filter(
      (id) => !covered.has(id) && (words.words.get(id)?.text ?? "") !== "",
    );
    const spelled = [...parts]
      .sort((x, y) => at(x) - at(y))
      .map((e) => e.text)
      .join("");
    const bare = (t: string) => plain(t).replace(/\s/g, "");
    return uncovered.length === 0 && bare(spelled) === bare(s.reading ?? "");
  };
  const whole = new Set<string>();
  const seen = new Set<Entry>();
  for (const first of entries) {
    if (seen.has(first)) continue;
    // The group: readings linked through the suggestions they touch.
    const group = [first];
    const groupRuns = new Set<WordSuggestion>();
    for (let k = 0; k < group.length; k += 1) {
      const e = group[k] as Entry;
      seen.add(e);
      for (const s of runs.filter((r) => touching(e, r))) {
        groupRuns.add(s);
        for (const other of entries) if (!seen.has(other) && touching(other, s)) group.push(other);
      }
    }
    const inRuns = new Set([...groupRuns].flatMap((s) => s.ids));
    if (
      group.length >= 2 &&
      [...groupRuns].every(spells) &&
      group.every((e) => e.ids.every((id) => inRuns.has(id)))
    )
      for (const e of group) whole.add(e.span);
  }
  return whole;
}

/** The agent's readings over this block's words, each worked out against the tools' suggestions. */
function agentReadings(
  b: PageBlock,
  where: string,
  ids: readonly string[],
  at: BlockContext,
): Reading[] {
  const { words, suggestions, problems, raised } = at;
  const readings: Reading[] = [];
  const entries: (Entry & { value: string | { text: string; cause?: Cause } })[] = Object.entries(
    b.read ?? {},
  ).map(([span, value]) => ({
    span,
    value,
    ids: tryExpand(span, words, problems, `${where}, read "${span}"`) ?? [],
    text: typeof value === "string" ? value : value.text,
  }));
  const whole = spelledTogether(entries, suggestions, words);
  for (const { span, value, ids: spanIds } of entries) {
    if (whole.has(span)) {
      raised.push({
        id: `matches ${span}`,
        question:
          "with the agent's other readings it spells what the tool gives: now matches the tool, drop it",
      });
      continue;
    }
    if (spanIds.length === 0) continue;
    if (!spanIds.every((id) => ids.includes(id))) {
      problems.push(`${where}, read "${span}": not in the block's words`);
      continue;
    }
    if (readings.some((r) => r.ids.some((id) => spanIds.includes(id)))) {
      problems.push(`${where}, read "${span}": overlaps another reading`);
      continue;
    }
    const { text, cause: own } =
      typeof value === "string" ? { text: value, cause: undefined } : value;
    const cause = own ?? at.cause;
    const pdf = textOf(words, spanIds);
    readings.push({ span, ids: spanIds, pdf, text, by: Maker.Agent });
    const inSpan = new Set(spanIds);
    const touched = suggestions.filter((s) => s.ids.some((id) => inSpan.has(id)));
    for (const s of touched)
      if (!s.ids.every((id) => inSpan.has(id)))
        raised.push({
          id: `partial ${span}`,
          question: `this reading covers only part of the tool's span ${s.range} ("${s.pdf.join(" ")}"): cover it whole`,
        });
    // Filling what a tool left needs no reason: its own why is the record.
    if (touched.length > 0 && touched.every((s) => s.left !== undefined)) continue;
    const suggested = asTheToolsGive(words, spanIds, touched);
    const tool = touched.some((s) => s.by === Tool.Scripts)
      ? Tool.Scripts
      : pdf.some(hasHindi)
        ? Tool.HindiRepair
        : Tool.Reader;
    // Only a reading over whole suggestions can be dropped: over part of one, the tool's is never applied.
    const isWhole = touched.every((s) => s.ids.every((id) => inSpan.has(id)));
    if (isWhole && plain(text) === plain(suggested)) {
      raiseMatch(at, span, `"${text}"`, tool);
      continue;
    }
    recordOverride(at, span, "this reading", {
      tool,
      range: span,
      edit: touched.length > 0 ? Edit.Reading : Edit.Addition,
      suggested,
      decided: text,
      ...(cause === undefined ? {} : { cause }),
    });
  }
  return readings;
}

/** The block's words decided: the agent's readings, and the tools' on the rest; what a tool left raised. */
function decideWords(
  b: PageBlock,
  where: string,
  ids: readonly string[],
  at: BlockContext,
): Reading[] {
  const readings = agentReadings(b, where, ids, at);
  const covered = new Set(readings.flatMap((r) => r.ids));
  const own = new Set(ids);
  for (const s of at.suggestions) {
    if (s.ids.some((id) => covered.has(id)) || !s.ids.some((id) => own.has(id))) continue;
    if (!s.ids.every((id) => own.has(id))) {
      at.raised.push({
        id: `across ${s.range}`,
        question: `the tool's span "${s.pdf.join(" ")}" runs across blocks, so its suggestion isn't used: a mistake in the ranges, or read each part?`,
      });
      continue;
    }
    if (s.reading !== undefined)
      readings.push({ span: s.range, ids: s.ids, pdf: s.pdf, text: s.reading, by: s.by });
    else
      at.raised.push({
        id: `left ${s.range}`,
        question: `${s.by} made no suggestion for "${s.pdf.join(" ")}" (${s.left}): read it, or answer why it stands as the PDF gives it`,
      });
  }
  return readings;
}

/** A block's number or title: its range's words, as decided. */
function labelOf(
  range: string | undefined,
  name: string,
  where: string,
  readings: readonly Reading[],
  at: BlockContext,
): { ids: string[]; text: string } | undefined {
  if (range === undefined) return undefined;
  const ids = tryExpand(range, at.words, at.problems, `${where}, its ${name}`);
  if (ids === undefined) return undefined;
  const text = withReadings(at.words, ids, readings);
  // A number the PDF glued to the next word with a tab ("2.4\tलवण", one word, which a reading may
  // give with a space): the number is the PDF's text before the tab, the title the rest.
  const [number = "", ...after] = (at.words.words.get(ids[0] ?? "")?.text ?? "").split("\t");
  if (after.length > 0) {
    if (name === "number") return { ids, text: number };
    if (text.startsWith(number)) return { ids, text: text.slice(number.length).trim() };
  }
  return { ids, text };
}

const isInside = (box: Box, page: NumberedPage) =>
  box[0] >= 0 &&
  box[1] >= 0 &&
  box[2] <= page.width &&
  box[3] <= page.height &&
  box[0] < box[2] &&
  box[1] < box[3];
const rounded = (box: Box): Box => box.map((v) => Math.round(v * 10) / 10) as Box;
/** Two boxes this near (points) are the same box. */
const SAME_BOX = 1;
const sameBox = (a: Box, b: Box) => a.every((v, i) => Math.abs(v - (b[i] ?? 0)) <= SAME_BOX);

/** A figure's or table's box decided: snapped from the rough one, or the agent's over it. */
function decideBox(b: PageBlock, handle: string, ids: readonly string[], at: BlockContext) {
  const { words, tools, raised } = at;
  const made: Made[] = [];
  if (!CROPPED.includes(b.kind) || b.box === undefined || !isInside(b.box, words))
    return { made, ...(b.box === undefined ? {} : { box: b.box }) };
  const own = new Set(ids);
  const mine = ids.flatMap((id) => words.words.get(id) ?? []);
  const others = [...words.words].filter(([id]) => !own.has(id)).map(([, w]) => w);
  const snapFrom = (rough: Box) =>
    snap(rough, tools.objects ?? [], mine, {
      others,
      ...(tools.shows === undefined ? {} : { shows: tools.shows(others) }),
    });
  const clamp = (x: Box): Box =>
    rounded([
      Math.max(x[0], 0),
      Math.max(x[1], 0),
      Math.min(x[2], words.width),
      Math.min(x[3], words.height),
    ]);
  const crossings = (rough: Box) =>
    snapFrom(rough)
      .issues.filter((i) => i.kind === SnapIssue.Crosses)
      .map((i) => i.question)
      .join("; ");
  const tool = snapFrom(b.box);
  const found = tool.objects.length > 0;
  const raiseCrossing = (rough: Box) => {
    const q = crossings(rough);
    if (q !== "") raised.push({ id: `crosses ${handle}`, question: q });
  };
  if (b.crop !== undefined) {
    made.push({ box: true, by: Maker.Agent });
    raiseCrossing(b.crop.box);
    if (!found) return { made, box: b.crop.box };
    const suggested = clamp(tool.box);
    if (sameBox(suggested, b.crop.box)) {
      raiseMatch(at, `box ${handle}`, `[${b.crop.box.join(", ")}]`, Tool.FigureSnap);
      return { made, box: b.crop.box };
    }
    const cause = b.crop.cause ?? at.cause;
    recordOverride(at, `box ${handle}`, "this box", {
      tool: Tool.FigureSnap,
      range: handle,
      edit: Edit.Box,
      suggested: suggested.join(", "),
      decided: b.crop.box.join(", "),
      ...(cause === undefined ? {} : { cause }),
    });
    return { made, box: b.crop.box };
  }
  if (!found) {
    made.push({ box: true, by: Maker.Agent });
    raised.push({
      id: `no drawing ${handle}`,
      question: `${Tool.FigureSnap} made no suggestion: ${tool.issues.map((i) => i.question).join("; ")} Give its \`crop\`, or answer why the rough box stands`,
    });
    return { made, box: b.box };
  }
  made.push({ box: true, by: Maker.FigureSnap });
  raiseCrossing(b.box);
  return { made, box: clamp(tool.box) };
}

/** A table's rows decided: read from its rules, or the agent's by word ranges. */
function decideCells(
  b: PageBlock,
  handle: string,
  where: string,
  ids: readonly string[],
  readings: readonly Reading[],
  box: Box | undefined,
  at: BlockContext,
): { rows?: string[][]; made: Made[] } {
  const { words, raised, problems } = at;
  if (b.kind !== ItemKind.Table || box === undefined || !isInside(box, words)) return { made: [] };
  const decided = decidedWords(readings);
  const placed = ids.flatMap((id) => {
    const w = words.words.get(id);
    const text = decided.get(id) ?? w?.text ?? "";
    return w === undefined || text === "" ? [] : [{ ...w, text }];
  });
  const table = tableCells(box, at.tools.objects ?? [], placed);
  const suggested = table.cells.length > 0 ? rowsOf(table) : undefined;
  if (b.cells === undefined) {
    if (suggested !== undefined)
      return { rows: suggested, made: [{ cells: true, by: Maker.TableCells }] };
    raised.push({
      id: `no rules ${handle}`,
      question: `${Tool.TableCells} made no suggestion: ${table.issues.map((i) => i.question).join("; ")} (\`cells\`, by word ranges), or answer why not`,
    });
    return { made: [] };
  }
  const rows = b.cells.rows.map((row) =>
    row.map((range) => {
      const cell = tryExpand(range, words, problems, `${where}, a cell "${range}"`) ?? [];
      if (!cell.every((id) => ids.includes(id)))
        problems.push(`${where}, a cell "${range}": not in the block's words`);
      return withReadings(words, cell, readings);
    }),
  );
  const made: Made[] = [{ cells: true, by: Maker.Agent }];
  if (suggested === undefined) return { rows, made };
  if (isDeepStrictEqual(rows, suggested)) {
    raiseMatch(at, `cells ${handle}`, "these rows", Tool.TableCells);
    return { rows, made };
  }
  const cause = b.cells.cause ?? at.cause;
  recordOverride(at, `cells ${handle}`, "these cells", {
    tool: Tool.TableCells,
    range: handle,
    edit: Edit.Cells,
    suggested: suggested.map((r) => r.join(" | ")).join(" / "),
    decided: rows.map((r) => r.join(" | ")).join(" / "),
    ...(cause === undefined ? {} : { cause }),
  });
  return { rows, made };
}

function buildBlock(b: PageBlock, i: number, at: BlockContext): Block {
  const { words, problems, page } = at;
  const where = `block ${i + 1} (${b.kind})`;
  const ids = tryExpand(b.words, words, problems, where) ?? [];
  if (ids.length === 0 && !CROPPED.includes(b.kind)) problems.push(`${where}: no words`);
  const handle = ids[0] ?? `block ${i + 1}`;
  const readings = decideWords(b, where, ids, at);
  const number = labelOf(b.number, "number", where, readings, at);
  const title = labelOf(b.title, "title", where, readings, at);
  const box = decideBox(b, handle, ids, at);
  const cells = decideCells(b, handle, where, ids, readings, box.box, at);
  return {
    page,
    handle,
    kind: b.kind,
    ...(number === undefined ? {} : { number: number.text, numberIds: number.ids }),
    ...(title === undefined ? {} : { title: title.text }),
    ...(b.answer === undefined ? {} : { answer: b.answer }),
    ids,
    text: withReadings(words, ids, readings),
    ...(box.box === undefined ? {} : { box: box.box }),
    ...(cells.rows === undefined ? {} : { rows: cells.rows }),
    continued: b.continued === true,
    continues: b.continues === true,
    readings,
    made: [...box.made, ...cells.made],
  };
}

/** A block whose join across a page doesn't pair: it continues onto nothing, or follows nothing. */
export type Unpaired = { block: Block; side: JoinSide };
export const JoinSide = { Continues: "continues", Continued: "continued" } as const;
export type JoinSide = (typeof JoinSide)[keyof typeof JoinSide];

/**
 * The pages' blocks as the chapter's blocks: a block that continues is joined with the next page's
 * continued block, in order (a page's first that continues with the next page's first continued),
 * and takes its kind and number from where it starts. A join is unpaired only where both its pages
 * are read (or it runs off the book's first or last page): a page not read yet is reported apart.
 */
function joinPages(
  pages: readonly BuiltPage[],
  pageCount: number,
): { joined: Block[][]; unpaired: Unpaired[] } {
  const joined: Block[][] = [];
  const unpaired: Unpaired[] = [];
  const isRead = new Set(pages.map((p) => p.page));
  let open: Block[][] = [];
  for (const p of pages) {
    const waiting = open;
    const hasBefore = isRead.has(p.page - 1);
    const next: Block[][] = [];
    for (const b of p.blocks) {
      const before = b.continued && hasBefore ? waiting.shift() : undefined;
      if (b.continued && before === undefined && (hasBefore || p.page === 1))
        unpaired.push({ block: b, side: JoinSide.Continued });
      const parts = before ?? [b];
      if (before === undefined) joined.push(parts);
      else before.push(b);
      if (b.continues) next.push(parts);
    }
    for (const parts of waiting)
      unpaired.push({ block: parts.at(-1) as Block, side: JoinSide.Continues });
    const hasAfter = isRead.has(p.page + 1);
    open = hasAfter ? next : [];
    if (!hasAfter && p.page === pageCount)
      for (const parts of next)
        unpaired.push({ block: parts.at(-1) as Block, side: JoinSide.Continues });
  }
  return { joined, unpaired };
}

/** Devanagari digits as ASCII ones (the Hindi book may print either). */
export const asciiDigits = (s: string): string =>
  s.replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x0966));

/** A printed number's digits: `Fig. 3.11` → `3.11`, `प्रश्नावली ३.१` → `3.1`, `1.` → `1`. */
export const digitsOf = (number: string): string | undefined =>
  /\d+(?:\.\d+)*/.exec(asciiDigits(number))?.[0];

/**
 * Our ids for a book's items: positions, one scheme for every book and language. The chapter's
 * sections in order are `1`, `2`, …; a section's blocks `1.1`, `1.2`, …; a subsection nests a level
 * (`2.3`, its blocks `2.3.1`), and an exercise holds everything up to the next section or exercise
 * (`1.5`, its questions and the figures between them `1.5.1`, `1.5.2`). What comes before the first
 * section (an epigraph) is section `0`'s. A subsection is a section whose number has more parts than
 * the chapter's top sections' (7.1.1 under 7.1).
 */
export function positionalIds(items: readonly { kind: string; number?: string }[]): string[] {
  const depth = (i: { kind: string; number?: string }) =>
    i.kind === ItemKind.Section && i.number !== undefined
      ? digitsOf(i.number)?.split(".").length
      : undefined;
  const depths = items.map(depth).filter((d) => d !== undefined);
  const top = depths.length === 0 ? 0 : Math.min(...depths);
  const counts = new Map<string, number>();
  const next = (parent: string) => {
    const n = (counts.get(parent) ?? 0) + 1;
    counts.set(parent, n);
    return `${parent}.${n}`;
  };
  let sections = 0;
  let section = "0";
  let subsection: string | undefined;
  let exercise: string | undefined;
  return items.map((item) => {
    const isSubsection = (depth(item) ?? top) > top;
    if (item.kind === ItemKind.Section && !isSubsection) {
      sections += 1;
      section = `${sections}`;
      subsection = undefined;
      exercise = undefined;
      return section;
    }
    if (item.kind === ItemKind.Section) {
      subsection = next(section);
      exercise = undefined;
      return subsection;
    }
    if (item.kind === ItemKind.Exercise) {
      exercise = next(subsection ?? section);
      return exercise;
    }
    return next(exercise ?? subsection ?? section);
  });
}

/** A figure or table to crop: its page, box, and the words of other blocks inside it, to blank. */
export type Crop = { id: string; page: number; box: Box; blank: Word[] };

/**
 * A term without the sentence's punctuation after it ("solution." is "solution"), its own closing
 * bracket kept: "(Isobar)" stays whole, "x-axis)" loses the bracket it never opened.
 */
export function trimTerm(text: string): string {
  let t = text.replace(/[\s,.;:!?।]+$/u, "");
  while (/[)\]]$/u.test(t)) {
    const open = (t.match(/[([]/gu) ?? []).length;
    const close = (t.match(/[)\]]/gu) ?? []).length;
    if (close <= open) break;
    t = t.slice(0, -1).replace(/[\s,.;:!?।]+$/u, "");
  }
  return t;
}

/** The chapter built: its items, terms and crops, and which block each item is made of. */
export type Built = {
  items: Item[];
  /** Each item's blocks, in the items' order. */
  parts: Block[][];
  unpaired: Unpaired[];
  terms: Term[];
  crops: Crop[];
  /** The pages built, for what is asked once across them. */
  pages: readonly BuiltPage[];
};

/** What of an item didn't come from the PDF as it is: its words in reading order, its box, its cells. */
function madeOf(parts: readonly Block[]): Made[] {
  const head = parts[0] as Block;
  return parts.flatMap((part) => {
    const place = new Map(part.ids.map((id, i) => [id, i]));
    const words = [...part.readings]
      .sort((a, b) => (place.get(a.ids[0] ?? "") ?? 0) - (place.get(b.ids[0] ?? "") ?? 0))
      .map(
        (r): Made => ({
          words: r.span,
          ...(part.page === head.page ? {} : { page: part.page }),
          by: r.by,
        }),
      );
    return [...words, ...part.made];
  });
}

const overlaps = (w: Word, [x0, y0, x1, y1]: Box): boolean =>
  w.x0 < x1 && w.x1 > x0 && w.y0 < y1 && w.y1 > y0;

/** The chapter's items, terms and crops, from its pages built in order. */
export function buildChapter(lang: Locale, pages: readonly BuiltPage[], pageCount: number): Built {
  const { joined, unpaired } = joinPages(pages, pageCount);
  const heads = joined.map((parts) => parts[0] as Block);
  const ids = positionalIds(heads);
  const items: Item[] = joined.map((parts, i) => {
    const head = parts[0] as Block;
    const rows = parts.flatMap((b) => b.rows ?? []);
    const made = madeOf(parts);
    return {
      id: ids[i] as string,
      kind: head.kind,
      page: head.page,
      ...(head.number === undefined ? {} : { number: head.number }),
      ...(head.title === undefined ? {} : { title: head.title }),
      text: parts.map((b) => b.text).join(" "),
      ...(head.answer === undefined ? {} : { answer: head.answer }),
      ...(rows.length === 0 ? {} : { rows }),
      ...(head.box === undefined || !CROPPED.includes(head.kind) ? {} : { crop: head.box }),
      ...(made.length === 0 ? {} : { made }),
    };
  });
  const idOf = new Map<Block, string>();
  joined.forEach((parts, i) => {
    for (const b of parts) idOf.set(b, ids[i] as string);
  });
  const terms: Term[] = pages.flatMap((p) =>
    p.terms.flatMap((t) => {
      const item = t.block === undefined ? undefined : idOf.get(t.block);
      if (t.block === undefined || item === undefined) return [];
      // A term is its words, not the sentence's punctuation around them ("solution." is "solution").
      const term = trimTerm(withReadings(p.words, t.ids, t.block.readings));
      const en = lang === Locale.En ? undefined : bracketedAfter(p.words, t.block, t.ids);
      return [{ term, item, ...(en === undefined ? {} : { en }) }];
    }),
  );
  const crops: Crop[] = [];
  for (const p of pages) {
    for (const b of p.blocks) {
      const id = idOf.get(b);
      if (!CROPPED.includes(b.kind) || b.box === undefined || id === undefined) continue;
      const box = b.box;
      const own = new Set(b.ids);
      const blank = [...p.words.words]
        .filter(([wid, w]) => !own.has(wid) && overlaps(w, box))
        .map(([, w]) => w);
      crops.push({ id, page: p.page, box, blank });
    }
  }
  return { items, parts: joined, unpaired, terms, crops, pages };
}

/** The English a term's block gives in brackets right after it (मूल-बिन्दु (origin)), if any. */
function bracketedAfter(
  words: NumberedPage,
  block: Block,
  span: readonly string[],
): string | undefined {
  const after = block.ids.indexOf(span.at(-1) ?? "") + 1;
  if (after <= 0) return undefined;
  const following: string[] = [];
  for (const id of block.ids.slice(after)) {
    const text = words.words.get(id)?.text ?? "";
    if (following.length === 0 && !text.startsWith("(")) return undefined;
    following.push(text);
    if (text.includes(")")) break;
  }
  const inside = /^\(([^()]*)\)/.exec(following.join(" "))?.[1]?.trim();
  return inside !== undefined && /^[A-Za-z][A-Za-z\s-]*$/.test(inside) ? inside : undefined;
}
