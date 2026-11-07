import { Locale } from "@chalk/content";
import { type Block, type BuiltPage, withReadings } from "./build";
import type { NumberedPage, Word } from "./read";
import { type Box, CROPPED, type Item, ItemKind, type Made, type Term } from "./schema";

/**
 * A chapter built from its pages (platform/docs/plans/sources.md, "The stages", 3): a block that
 * continues joined with the next page's continued block, ids by position, the terms, and what is to be
 * cropped.
 */

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
