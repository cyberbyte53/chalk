import { Locale } from "@chalk/content";
import type { NumberedPage, Word } from "./read";
import {
  type Box,
  CROPPED,
  type Item,
  ItemKind,
  type PageBlock,
  type PageFile,
  type Term,
} from "./schema";

/**
 * Building a chapter's items from the agents' page files and the PDF's words
 * (platform/docs/plans/sources.md, "The stages", 3): each block's text from its word ranges and
 * readings, a block that continues joined with the next page's continued block, ids by position,
 * the terms, and what is to be cropped. Nothing here judges: check.ts raises the issues.
 */

/** A span the agent read from the image: its words, the PDF's letters for them, and the reading. */
export type Reading = { span: string; ids: string[]; pdf: string; text: string };

/** One block of a page, built. */
export type Block = {
  page: number;
  /** What names it in an issue: its first word (`L12.1`), or `block 3` when it has none. */
  handle: string;
  kind: ItemKind;
  number?: string;
  title?: string;
  answer?: string;
  /** Its words' ids, in reading order. */
  ids: string[];
  text: string;
  box?: Box;
  continued: boolean;
  continues: boolean;
  readings: Reading[];
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
};

/** Thrown for a range that isn't on the page: a mistake, never meant. */
class OffThePage extends Error {}

/**
 * `L6-L14, L16.1-8, L16.9-L18, L20.3` → the word ids, in order. A line alone is all its words;
 * `L16.1-8` is words 1 to 8 of line 16.
 */
export function expand(ranges: string, words: ReadonlyMap<string, unknown>): string[] {
  const all = [...words.keys()];
  const at = new Map(all.map((id, i) => [id, i]));
  const firstOf = (l: string) => all.find((w) => w.startsWith(`${l}.`));
  const lastOf = (l: string) => [...all].reverse().find((w) => w.startsWith(`${l}.`));
  const ids: string[] = [];
  for (const part of ranges
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "")) {
    const m = /^(L\d+)(?:\.(\d+))?(?:-(L\d+)?(?:\.?(\d+))?)?$/.exec(part);
    if (m?.[1] === undefined) throw new OffThePage(`can't read the range "${part}"`);
    const [, l1, w1, l2, w2] = m;
    const start = w1 !== undefined ? `${l1}.${w1}` : firstOf(l1);
    let end: string | undefined;
    if (!part.includes("-")) end = w1 !== undefined ? `${l1}.${w1}` : lastOf(l1);
    else if (l2 !== undefined) end = w2 !== undefined ? `${l2}.${w2}` : lastOf(l2);
    else end = w2 !== undefined ? `${l1}.${w2}` : lastOf(l1);
    const from = start === undefined ? undefined : at.get(start);
    const to = end === undefined ? undefined : at.get(end);
    if (from === undefined || to === undefined || to < from)
      throw new OffThePage(`the range "${part}" isn't on the page`);
    ids.push(...all.slice(from, to + 1));
  }
  return ids;
}

/** A range expanded, or the problem with it. */
function tryExpand(
  ranges: string,
  words: NumberedPage,
  problems: string[],
  where: string,
): string[] | undefined {
  try {
    return expand(ranges, words.words);
  } catch (error) {
    if (!(error instanceof OffThePage)) throw error;
    problems.push(`${where}: ${error.message}`);
    return undefined;
  }
}

const textOf = (words: NumberedPage, ids: readonly string[]) =>
  ids.map((id) => words.words.get(id)?.text ?? "").join(" ");

/** Some words with the readings that fall among them put in: a reading's first word is it, the rest go. */
function withReadings(words: NumberedPage, ids: readonly string[], readings: readonly Reading[]) {
  const replaced = new Map<string, string>();
  for (const r of readings) r.ids.forEach((id, k) => replaced.set(id, k === 0 ? r.text : ""));
  return ids
    .map((id) => replaced.get(id) ?? words.words.get(id)?.text ?? "")
    .filter((w) => w !== "")
    .join(" ");
}

/** One page file read against the page's words. */
export function buildPage(file: PageFile, words: NumberedPage): BuiltPage {
  const problems: string[] = [];
  const holders = new Map<string, string[]>();
  const hold = (ids: readonly string[], who: string) => {
    for (const id of ids) holders.set(id, [...(holders.get(id) ?? []), who]);
  };
  hold(tryExpand(file.furniture ?? "", words, problems, "furniture") ?? [], "furniture");
  const blocks = file.blocks.map((b, i) => buildBlock(b, i, file.page, words, problems));
  for (const b of blocks) hold(b.ids, b.handle);
  const terms = (file.terms ?? []).map((span) => {
    const ids = tryExpand(span, words, problems, `term "${span}"`) ?? [];
    const block = blocks.find((b) => ids.length > 0 && ids.every((id) => b.ids.includes(id)));
    return { span, ids, ...(block === undefined ? {} : { block }) };
  });
  return { page: file.page, file, words, blocks, holders, terms, problems };
}

function buildBlock(
  b: PageBlock,
  i: number,
  page: number,
  words: NumberedPage,
  problems: string[],
): Block {
  const where = `block ${i + 1} (${b.kind})`;
  const ids = tryExpand(b.words, words, problems, where) ?? [];
  if (ids.length === 0 && !CROPPED.includes(b.kind)) problems.push(`${where}: no words`);
  const readings: Reading[] = [];
  for (const [span, text] of Object.entries(b.read ?? {})) {
    const spanIds = tryExpand(span, words, problems, `${where}, read "${span}"`);
    if (spanIds === undefined) continue;
    if (!spanIds.every((id) => ids.includes(id))) {
      problems.push(`${where}, read "${span}": not in the block's words`);
      continue;
    }
    if (readings.some((r) => r.ids.some((id) => spanIds.includes(id)))) {
      problems.push(`${where}, read "${span}": overlaps another reading`);
      continue;
    }
    readings.push({ span, ids: spanIds, pdf: textOf(words, spanIds), text });
  }
  return {
    page,
    handle: ids[0] ?? `block ${i + 1}`,
    kind: b.kind,
    ...(b.number === undefined ? {} : { number: b.number }),
    ...(b.title === undefined ? {} : { title: b.title }),
    ...(b.answer === undefined ? {} : { answer: b.answer }),
    ids,
    text: withReadings(words, ids, readings),
    ...(b.box === undefined ? {} : { box: b.box }),
    continued: b.continued === true,
    continues: b.continues === true,
    readings,
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
export function joinPages(
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
 * (`2.3`, its blocks `2.3.1`), and so do an exercise's questions (`1.5`, its `1.5.1`). What comes
 * before the first section (an epigraph) is section `0`'s. A subsection is a section whose number
 * has more parts than the chapter's top sections' (7.1.1 under 7.1).
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
    if (item.kind === ItemKind.Question && exercise !== undefined) return next(exercise);
    const id = next(subsection ?? section);
    exercise = item.kind === ItemKind.Exercise ? id : undefined;
    return id;
  });
}

/** A figure or table to crop: its page, box, and the words of other blocks inside it, to blank. */
export type Crop = { id: string; page: number; box: Box; blank: Word[] };

/** The chapter built: its items, terms and crops, and which block each item is made of. */
export type Built = {
  items: Item[];
  /** Each item's blocks, in the items' order. */
  parts: Block[][];
  unpaired: Unpaired[];
  terms: Term[];
  crops: Crop[];
};

const overlaps = (w: Word, [x0, y0, x1, y1]: Box): boolean =>
  w.x0 < x1 && w.x1 > x0 && w.y0 < y1 && w.y1 > y0;

/** The chapter's items, terms and crops, from its pages built in order. */
export function buildChapter(lang: Locale, pages: readonly BuiltPage[], pageCount: number): Built {
  const { joined, unpaired } = joinPages(pages, pageCount);
  const heads = joined.map((parts) => parts[0] as Block);
  const ids = positionalIds(heads);
  const items: Item[] = joined.map((parts, i) => {
    const head = parts[0] as Block;
    return {
      id: ids[i] as string,
      kind: head.kind,
      page: head.page,
      ...(head.number === undefined ? {} : { number: head.number }),
      ...(head.title === undefined ? {} : { title: head.title }),
      text: parts.map((b) => b.text).join(" "),
      ...(head.answer === undefined ? {} : { answer: head.answer }),
      ...(head.box === undefined || !CROPPED.includes(head.kind) ? {} : { crop: head.box }),
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
      const term = withReadings(p.words, t.ids, t.block.readings);
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
  return { items, parts: joined, unpaired, terms, crops };
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
