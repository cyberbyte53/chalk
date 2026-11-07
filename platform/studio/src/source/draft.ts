import { expand } from "./build";
import { type DrawnObject, type PageObjects, area, intersect, withoutRepeats } from "./objects";
import { type NumberedPage, type Word, boundsOf, poppler } from "./read";
import { attr, decode } from "./read/pages";
import { type Box, ItemKind, type PageBlock, type PageFile } from "./schema";

/**
 * The structure draft (platform/docs/plans/sources.md, "Tools suggest, the agent decides"): a page
 * file pre-filled from signals any PDF has. The page's words are cut into runs at column-sized gaps;
 * a figure's caption takes the drawing beside it and the labels in that drawing; the other runs flow
 * down the page into columns by what they sit under; each column breaks into blocks at gaps, indents,
 * a change of font and numbering at a line's start. A kind is given only where numbering or font says
 * so; box, activity, example and equation are the agent's. Nothing is tied to one book.
 */

/** A piece of a page's text in one font (`pdftohtml -xml`), in points as the words are. */
export type StyleRun = { box: Box; size: number; bold: boolean; colour: string };
export type PageStyles = { page: number; runs: StyleRun[] };

/** `pdftohtml -xml -zoom 1`'s pages: the font of each run of text. */
export function stylesFromXml(xml: string): PageStyles[] {
  // A font is declared on the page it first appears on, and kept for those after.
  const fonts = new Map<string, { size: number; family: string; colour: string }>();
  return xml
    .split(/<page /)
    .slice(1)
    .map((chunk) => {
      for (const m of chunk.matchAll(/<fontspec ([^>]*)\/>/g)) {
        const tag = m[1] ?? "";
        const id = /id="(\d+)"/.exec(tag)?.[1] ?? "";
        const family = /family="([^"]*)"/.exec(tag)?.[1] ?? "";
        const colour = /color="([^"]*)"/.exec(tag)?.[1] ?? "";
        fonts.set(id, { size: attr(tag, "size"), family, colour });
      }
      const runs = [...chunk.matchAll(/<text ([^>]*)>(.*?)<\/text>/gs)].flatMap((m): StyleRun[] => {
        const tag = m[1] ?? "";
        const body = m[2] ?? "";
        const font = fonts.get(/font="(\d+)"/.exec(tag)?.[1] ?? "");
        if (font === undefined || decode(body.replace(/<[^>]+>/g, "")).trim() === "") return [];
        const [x, y] = [attr(tag, "left"), attr(tag, "top")];
        return [
          {
            box: [x, y, x + attr(tag, "width"), y + attr(tag, "height")],
            size: font.size,
            bold: body.includes("<b>") || /bold|black/i.test(font.family),
            colour: font.colour,
          },
        ];
      });
      return { page: Number(/number="(\d+)"/.exec(chunk)?.[1]), runs };
    });
}

/** Every page's fonts, from the PDF. */
export const readStyles = (pdf: string): PageStyles[] =>
  stylesFromXml(poppler("pdftohtml", ["-xml", "-i", "-zoom", "1", "-stdout", pdf]));

const median = (xs: readonly number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length === 0 ? 0 : (s[Math.floor(s.length / 2)] ?? 0);
};

const DIGIT = "[0-9०-९]";
/** A section's number: digits and points, at least one point (`7.1`, `7.1.2`). */
const SECTION = new RegExp(`^${DIGIT}+(\\.${DIGIT}+)+\\.?$`);
/** A question's number, in a list: `1.`, `2)`, `Q3.`. */
const NUMBERED = new RegExp(`^(?:Q\\.?\\s*)?${DIGIT}+[.)]$`);
/** The first of a list: `1.`. */
const FIRST = /^(?:Q\.?\s*)?[1१][.)]$/;
/** A part of a question or a list: `(i)`, `(a)`, `a)`. */
const PART = /^\(?[a-zA-Zivxऀ-ॿ]{1,4}\)$/;
/** The words that name a figure, in a book's languages. */
const FIGURE = /^(?:fig(?:s|ure)?\.?|चित्र|आकृति)$/i;
const FIGURE_JOINED = new RegExp(`^fig(?:ure)?\\.?\\s*${DIGIT}`, "i");
const HAS_DIGIT = new RegExp(DIGIT);
const FIGURE_NUMBER = new RegExp(`^${DIGIT}+(?:\\.${DIGIT}+)*`);

/**
 * A gap this wide (points) on a line, and this many times its line's usual one (a narrow justified
 * line's gaps are all wide), is no gap between words: a column's, or a caption's beside text.
 */
const COLUMN_GAP = 8;
const COLUMN_GAP_TIMES = 2;
/** Lines' starts this near (points) stand at one column's edge. */
const COLUMN_EDGE = 2;

type Run = {
  ids: string[];
  words: Word[];
  box: Box;
  text: string;
};

/** A page's words as runs: each PDF line cut where a column-sized gap runs through it. */
function runsOf(page: NumberedPage, skip: ReadonlySet<string>): Run[] {
  const runs: Run[] = [];
  page.lines.forEach((line, l) => {
    const gaps = line.slice(1).map((w, j) => w.x0 - (line[j]?.x1 ?? 0));
    const usual = Math.max(1, median(gaps));
    const parts = (at: number) => (gaps[at] ?? 0) >= Math.max(COLUMN_GAP, COLUMN_GAP_TIMES * usual);
    let ids: string[] = [];
    let words: Word[] = [];
    const flush = () => {
      if (words.length > 0)
        runs.push({ ids, words, box: boundsOf(words), text: words.map((w) => w.text).join(" ") });
      ids = [];
      words = [];
    };
    line.forEach((w, j) => {
      const id = `L${l + 1}.${j + 1}`;
      if (skip.has(id)) {
        flush();
        return;
      }
      const last = words.at(-1);
      if (
        last !== undefined &&
        parts(j - 1) &&
        !(words.length === 1 && [NUMBERED, PART, SECTION].some((m) => m.test(last.text)))
      )
        flush();
      ids.push(id);
      words.push(w);
    });
    flush();
  });
  return runs;
}

/**
 * What repeats across a book's pages at one place (the running heads, page numbers, footers), as
 * word ids per page: text the same but for its digits, at the same height and the same left or
 * right edge, on a quarter of the pages or more (books set left and right pages apart), and at least
 * three.
 */
export function draftFurniture(pages: readonly NumberedPage[]): Map<number, string[]> {
  const NEAR = 3;
  const enough = Math.max(3, pages.length / 4);
  const key = (r: Run) =>
    r.text
      .toLowerCase()
      .replace(/[\s]+/g, "")
      .replace(/[\d०-९]+/g, "#");
  const near = (a: Run, b: Run) =>
    Math.abs(a.box[1] - b.box[1]) <= NEAR &&
    (Math.abs(a.box[0] - b.box[0]) <= NEAR || Math.abs(a.box[2] - b.box[2]) <= NEAR);
  const perPage = pages.map((p) => runsOf(p, new Set()));
  const byKey = new Map<string, { page: number; run: Run }[]>();
  perPage.forEach((runs, i) => {
    for (const run of runs) {
      const k = key(run);
      const list = byKey.get(k) ?? [];
      list.push({ page: i, run });
      byKey.set(k, list);
    }
  });
  const out = new Map<number, string[]>();
  for (const list of byKey.values())
    for (const { page, run } of list) {
      const on = new Set(list.filter((o) => near(o.run, run)).map((o) => o.page));
      if (on.size < enough) continue;
      const n = pages[page]?.page;
      if (n !== undefined) out.set(n, [...(out.get(n) ?? []), ...run.ids]);
    }
  return out;
}

/**
 * A caption running into the text beside it on one PDF line, with no gap to tell (`Fig. 2.22:
 * Experimental 11. Identify the pair`): cut where a word stands at the start of the column the lines
 * above or below it start. A caption's own words don't stand there.
 */
function cutCaptions(runs: readonly Run[]): Run[] {
  return runs.flatMap((run): Run[] => {
    const label = captionLabel(run);
    if (label === 0) return [run];
    const height = run.box[3] - run.box[1];
    const starts = runs
      .filter(
        (o) =>
          o !== run &&
          o.box[0] > run.box[0] + height &&
          Math.abs(o.box[1] - run.box[1]) <= 2.5 * height,
      )
      .map((o) => o.box[0]);
    const at = run.words.findIndex(
      (w, i) => i > label && starts.some((x) => Math.abs(x - w.x0) <= COLUMN_EDGE),
    );
    if (at === -1) return [run];
    const part = (from: number, to?: number): Run => {
      const words = run.words.slice(from, to);
      return {
        ids: run.ids.slice(from, to),
        words,
        box: boundsOf(words),
        text: words.map((w) => w.text).join(" "),
      };
    };
    return [part(0, at), part(at)];
  });
}

/** A row of text: one or more runs side by side, in one font as far as it counts. */
type Row = Run & { size: number; bold: boolean; colour: string };

type Font = { size: number; bold: boolean; colour: string };

/** Each word's font, from the run its middle is in. */
function fontOf(w: Word, styles: PageStyles | undefined): Font | undefined {
  const [x, y] = [(w.x0 + w.x1) / 2, (w.y0 + w.y1) / 2];
  return styles?.runs.find(
    (r) => x >= r.box[0] - 1 && x <= r.box[2] + 1 && y >= r.box[1] - 1 && y <= r.box[3] + 1,
  );
}

/** The font most of some words' letters are in (bold only when nearly all are). */
function fontOfWords(words: readonly Word[], styles: PageStyles | undefined): Font {
  const counts = new Map<string, { font: Font; letters: number }>();
  let bold = 0;
  let total = 0;
  for (const w of words) {
    const f = fontOf(w, styles);
    const letters = w.text.length;
    total += letters;
    if (f?.bold === true) bold += letters;
    if (f === undefined) continue;
    const k = `${Math.round(f.size)}|${f.colour}`;
    const c = counts.get(k) ?? { font: f, letters: 0 };
    c.letters += letters;
    counts.set(k, c);
  }
  const top = [...counts.values()].sort((a, b) => b.letters - a.letters)[0]?.font;
  return {
    size: top?.size ?? 0,
    bold: total > 0 && bold / total >= 0.8,
    colour: top?.colour ?? "",
  };
}

const sameFont = (a: Font, b: Font) =>
  Math.round(a.size) === Math.round(b.size) && a.bold === b.bold && a.colour === b.colour;

/** The font of most of the page's letters: its body text. */
function bodyFont(rows: readonly Row[]): Font {
  const counts = new Map<string, { font: Font; letters: number }>();
  for (const r of rows) {
    const k = `${Math.round(r.size)}|${r.bold}|${r.colour}`;
    const c = counts.get(k) ?? { font: r, letters: 0 };
    c.letters += r.text.length;
    counts.set(k, c);
  }
  return (
    [...counts.values()].sort((a, b) => b.letters - a.letters)[0]?.font ?? {
      size: 0,
      bold: false,
      colour: "",
    }
  );
}

const xOverlap = (a: Box, b: Box) => Math.min(a[2], b[2]) - Math.max(a[0], b[0]);

/** A word without what a broken text layer adds to it: U+FFFD, joiners, a sign doubled. */
const unbroken = (t: string): string =>
  t.replace(/[\uFFFD\u200C\u200D]/g, "").replace(/([\u093E-\u094D])\1+/gu, "$1");

/** How many of a caption's first words are its label, `Fig. 7.4:` (0: it is no caption's start). */
function captionLabel(r: Run): number {
  const [first, second] = r.words;
  if (first === undefined) return 0;
  if (FIGURE_JOINED.test(first.text)) return 1;
  if (FIGURE.test(unbroken(first.text)) && second !== undefined && FIGURE_NUMBER.test(second.text))
    return 2;
  return 0;
}

/**
 * Whether a run that starts with a figure's name is its caption, not a sentence that happens to
 * start a line with a mention of it: the name is followed by `:` or a dash, or the run stops short.
 */
function isCaption(r: Row, rows: readonly Row[], columnWidth: number): boolean {
  const label = captionLabel(r);
  if (label === 0) return false;
  if (r.words[label - 1]?.text.endsWith(":") === true) return true;
  if (/^[—–:-]/.test(r.words[label]?.text ?? "")) return true;
  const width = r.box[2] - r.box[0];
  const goesOn = rows.some(
    (b) =>
      b !== r &&
      b.box[1] >= r.box[1] &&
      b.box[1] - r.box[3] < 4 &&
      xOverlap(b.box, r.box) > 0.5 * width &&
      b.box[2] - b.box[0] >= width,
  );
  return width < 0.6 * columnWidth && !goesOn;
}

/** The nearest two boxes come, across and down; 0 where they overlap that way. */
const apart = (a: Box, b: Box): [number, number] => [
  Math.max(0, a[0] - b[2], b[0] - a[2]),
  Math.max(0, a[1] - b[3], b[1] - a[3]),
];

/** Objects this near (points) are one drawing. */
const SAME_DRAWING = 12;
/** A caption this far (points) from a drawing isn't its. */
const CAPTION_REACH = 45;
/** A drawing is at least this big each way (points). */
const MIN_DRAWING = 15;
/** A figure's labels sit in its drawing or this near it (points): a graph's axes' numbers. */
const LABEL_REACH = 14;
/** A run of this many words in the body's font is a line of text, however it sits against a drawing. */
const TEXT_LINE = 5;

/** Whether a run is a line of text: enough words with letters in them, not a scale's numbers. */
const isTextLine = (r: Run): boolean =>
  r.words.filter((w) => /\p{L}/u.test(w.text)).length >= TEXT_LINE;

/** Whether a word's middle is in a box, or within `reach` points of it. */
const inBox = (b: Box, w: Word, reach: number) => {
  const [x, y] = [(w.x0 + w.x1) / 2, (w.y0 + w.y1) / 2];
  return x >= b[0] - reach && x <= b[2] + reach && y >= b[1] - reach && y <= b[3] + reach;
};

/**
 * The drawing beside a caption: from the drawn object nearest it (one above counting nearer than one
 * below), everything near that, for as long as the drawing covers no line of text (a panel or a frame
 * has text on it; the figure on it doesn't). A line alone (an underline, a rule) is no drawing.
 */
function drawingOf(
  caption: Box,
  objects: readonly DrawnObject[],
  lines: readonly Row[],
  pageArea: number,
): Box | undefined {
  const clear = (b: Box) =>
    area(b) <= 0.5 * pageArea && !lines.some((r) => r.words.some((w) => inBox(b, w, 0)));
  const usable = objects.map((o) => o.box).filter(clear);
  const score = (b: Box) => {
    const [dx, dy] = apart(b, caption);
    return Math.max(dx, dy) + (b[1] > caption[1] ? 8 : 0);
  };
  const seeds = usable
    .filter((b) => Math.max(...apart(b, caption)) <= CAPTION_REACH)
    .sort((a, b) => score(a) - score(b));
  for (const seed of seeds) {
    let box = seed;
    let grew = true;
    while (grew) {
      grew = false;
      for (const o of usable) {
        const [dx, dy] = apart(box, o);
        if (dx > SAME_DRAWING || dy > SAME_DRAWING) continue;
        const wider = widen(box, o);
        if (wider.every((v, i) => v === box[i]) || !clear(wider)) continue;
        box = wider;
        grew = true;
      }
    }
    if (Math.min(box[2] - box[0], box[3] - box[1]) >= MIN_DRAWING) return box;
  }
  return undefined;
}

/** A block being made: rows, in order, or a figure with its box. */
type Draft = {
  rows: Row[];
  kind: ItemKind;
  box?: Box;
  label?: { ids: string[]; as: "number" | "title" };
  /** Set beside the main text. */
  side: boolean;
};

/** A column of a page: rows that sit under one another. */
type Flow = {
  rows: Row[];
  box: Box;
  /** On a panel or in a frame the PDF draws: whatever is in it is one block. */
  boxed?: boolean;
};

const widen = (a: Box, b: Box): Box => [
  Math.min(a[0], b[0]),
  Math.min(a[1], b[1]),
  Math.max(a[2], b[2]),
  Math.max(a[3], b[3]),
];

/** Rows this far apart (points) start a new flow, even under one another. */
const FLOW_GAP = 40;

/**
 * The page's columns: each row, top to bottom, goes on under the flow it overlaps most across; beside
 * every flow it starts a new one. A run on the same height as a flow's last row joins that row (a
 * formula and its number, a line's far end).
 */
function flowsOf(rows: readonly Row[]): Flow[] {
  const flows: Flow[] = [];
  for (const row of [...rows].sort((a, b) => a.box[1] - b.box[1] || a.box[0] - b.box[0])) {
    const open = flows.filter((f) => row.box[1] - f.box[3] <= FLOW_GAP);
    const best = open
      .map((flow) => ({ flow, over: xOverlap(flow.box, row.box) }))
      .filter(
        (o) => o.over > 0.25 * Math.min(o.flow.box[2] - o.flow.box[0], row.box[2] - row.box[0]),
      )
      .sort((a, b) => b.over - a.over)[0]?.flow;
    if (best === undefined) {
      flows.push({ rows: [row], box: row.box });
      continue;
    }
    const last = best.rows.at(-1);
    if (last !== undefined && sameHeight(last, row)) joinRow(last, row);
    else best.rows.push(row);
    best.box = widen(best.box, row.box);
  }
  return flows;
}

/** A panel holds at least this many lines of text. */
const PANEL_ROWS = 2;
const PANEL_SIZE = 25;
/** A panel's heading may sit across its top edge, starting this far (points) above it. */
const PANEL_HEAD = 12;

/**
 * The rows on each panel or in each frame the PDF draws (the largest that holds a row takes it), as
 * flows, and the rows on none.
 */
function panelFlows(
  rows: readonly Row[],
  objects: readonly DrawnObject[],
  pageArea: number,
): { flows: Flow[]; rest: Row[] } {
  const big = objects
    .filter((o) => {
      const [w, h] = [o.box[2] - o.box[0], o.box[3] - o.box[1]];
      return area(o.box) <= 0.5 * pageArea && Math.min(w, h) >= PANEL_SIZE;
    })
    .sort((a, b) => area(b.box) - area(a.box));
  const taken = new Set<Row>();
  const flows: Flow[] = [];
  for (const o of big) {
    const held: Box = [o.box[0] - 1, o.box[1] - PANEL_HEAD, o.box[2] + 1, o.box[3] + 1];
    const inside = rows.filter(
      (r) => !taken.has(r) && r.box[3] > o.box[1] && r.words.every((w) => inBox(held, w, 0)),
    );
    if (inside.filter(isTextLine).length < PANEL_ROWS) continue;
    for (const r of inside) taken.add(r);
    const parts = flowsOf(inside);
    flows.push({
      rows: parts.flatMap((f) => f.rows),
      box: parts.map((f) => f.box).reduce(widen),
      boxed: true,
    });
  }
  return { flows, rest: rows.filter((r) => !taken.has(r)) };
}

const sameHeight = (a: Row, b: Row) => {
  const over = Math.min(a.box[3], b.box[3]) - Math.max(a.box[1], b.box[1]);
  return over >= 0.5 * Math.min(a.box[3] - a.box[1], b.box[3] - b.box[1]);
};

/** Puts a run on the same height into a row, its words left to right, the row's font kept. */
function joinRow(row: Row, other: Row): void {
  const all = [...row.words.map((w, i) => ({ w, id: row.ids[i] ?? "" }))];
  other.words.forEach((w, i) => all.push({ w, id: other.ids[i] ?? "" }));
  all.sort((a, b) => a.w.x0 - b.w.x0);
  row.ids = all.map((a) => a.id);
  row.words = all.map((a) => a.w);
  row.text = row.words.map((w) => w.text).join(" ");
  row.box = widen(row.box, other.box);
  if (other.text.length > row.text.length - other.text.length) {
    row.size = other.size;
    row.bold = other.bold;
    row.colour = other.colour;
  }
}

/** A gap this much past a flow's usual one (points) is between blocks. */
const BLOCK_GAP = 5;
/** A flow narrower than this share of the widest is a side column. */
const SIDE_WIDTH = 0.5;
/** A side column's blocks part only at a gap this much past its usual one (points). */
const SIDE_GAP = 9;
/** A line starting this far right of its neighbour (points) starts a paragraph. */
const INDENT = 4;
/** A line starting this far right of its block (points) is set on its own: a formula. */
const SET_APART = 30;
/** A mark this short, this far (points) from the next word, is a bullet. */
const BULLET_GAP = 4;
/** A heading in the margin may sit this far (points) below the first line it heads. */
const LIFT = 6;
/** A heading has no more lines than this. */
const HEADING_ROWS = 2;
const HEADING_WORDS = 14;

/** Where a line's words start, past a mark that hangs out from them: `1.`, `(i)`, a bullet. */
const textStart = (r: Row): number => {
  const [first, second] = r.words;
  if (first === undefined || second === undefined) return r.box[0];
  const marked =
    NUMBERED.test(first.text) ||
    PART.test(first.text) ||
    (first.text.length <= 2 && second.x0 - first.x1 >= BULLET_GAP);
  return marked ? second.x0 : r.box[0];
};

/** A flow's rows into blocks, at gaps, indents, a change of font and numbering. */
function blocksOf(flow: Flow, side: boolean, styles: PageStyles | undefined): Row[][] {
  if (flow.boxed) return [flow.rows];
  const gaps = flow.rows.slice(1).map((r, i) => r.box[1] - (flow.rows[i]?.box[3] ?? 0));
  const usual = median(gaps.filter((g) => g > -6));
  const left = median(flow.rows.map((r) => r.box[0]));
  const blocks: Row[][] = [];
  let block: Row[] = [];
  let anchor = 0;
  flow.rows.forEach((row, i) => {
    const prev = flow.rows[i - 1];
    const first = row.words[0]?.text ?? "";
    const start =
      prev === undefined ||
      (side
        ? row.box[1] - prev.box[3] > usual + SIDE_GAP
        : row.box[1] - prev.box[3] > usual + BLOCK_GAP ||
          (!sameFont(row, prev) && !runsOn(prev, row, styles)) ||
          SECTION.test(first) ||
          NUMBERED.test(first) ||
          (!PART.test(first) &&
            (row.box[0] > anchor + INDENT ||
              (row.box[0] < anchor - INDENT && setApart(prev, anchor, left)))));
    if (start && block.length > 0) {
      blocks.push(block);
      block = [];
    }
    const marked = textStart(row);
    if (block.length === 0 || marked !== row.box[0]) anchor = marked;
    else anchor = Math.min(anchor, row.box[0]);
    block.push(row);
  });
  if (block.length > 0) blocks.push(block);
  return blocks;
}

/** Whether a row starts in the font the row before ended in: a bold phrase running over a line's end. */
function runsOn(prev: Row, row: Row, styles: PageStyles | undefined): boolean {
  const [a, b] = [prev.words.at(-1), row.words[0]];
  if (a === undefined || b === undefined) return false;
  const [fa, fb] = [fontOf(a, styles), fontOf(b, styles)];
  return fa !== undefined && fb !== undefined && sameFont(fa, fb);
}

/** A line far right of where its flow's lines start, its block's only line so far: set on its own. */
const setApart = (row: Row, anchor: number, left: number) =>
  row.box[0] >= anchor && row.box[0] - left > SET_APART;

const isHeading = (rows: readonly Row[], body: Font) =>
  rows.length <= HEADING_ROWS &&
  rows.reduce((n, r) => n + r.words.length, 0) <= HEADING_WORDS &&
  rows.every(
    (r) =>
      r.bold !== body.bold ||
      r.colour !== body.colour ||
      Math.round(r.size) > Math.round(body.size),
  );

/** The kind a block's numbering or font says, and which of its words are its label. */
function kindOf(rows: readonly Row[], body: Font, side: boolean): Pick<Draft, "kind" | "label"> {
  const first = rows[0];
  const word = first?.words[0]?.text ?? "";
  const firstId = first?.ids[0] ?? "";
  if (SECTION.test(word) && rows.length <= HEADING_ROWS + 1 && isSet(first, body))
    return { kind: ItemKind.Section, label: { ids: [firstId], as: "number" } };
  if (!side && isHeading(rows, body))
    return { kind: ItemKind.Heading, label: { ids: rows.flatMap((r) => r.ids), as: "title" } };
  return { kind: ItemKind.Text };
}

const isSet = (r: Row | undefined, body: Font) =>
  r !== undefined &&
  (r.bold || r.colour !== body.colour || Math.round(r.size) > Math.round(body.size));

/** An exercise's heading has at most this many words: more is a heading with its own sentence. */
const EXERCISE_WORDS = 4;

/**
 * Numbering in its context, in reading order: a short heading a list numbered from 1 comes straight
 * after is an exercise (its label the number it prints after its name, or its words as a title), and
 * a numbered line in an exercise is a question, up to the next section or heading. Outside one, a list
 * numbered from 1 is one block, with the line before it when that says a list is coming. A numbered
 * line in neither (a page starting at "14.") is taken for a question from a page before.
 */
function markNumbering(drafts: Draft[], before: boolean): void {
  let exercise = before;
  let list: Draft | undefined;
  for (let i = 0; i < drafts.length; i += 1) {
    const d = drafts[i];
    if (d === undefined) continue;
    const firstWord = d.rows[0]?.words[0]?.text ?? "";
    const words = d.rows.flatMap((r) => r.words.map((w, j) => ({ w, id: r.ids[j] ?? "" })));
    if (d.kind === ItemKind.Section) {
      exercise = false;
      list = undefined;
    } else if (d.kind === ItemKind.Heading) {
      const next = drafts[i + 1]?.rows[0]?.words[0]?.text ?? "";
      exercise =
        FIRST.test(next) &&
        words.length <= EXERCISE_WORDS &&
        !words.some(({ w }) => w.text.endsWith(":"));
      list = undefined;
      if (exercise) {
        d.kind = ItemKind.Exercise;
        const last = words.at(-1);
        if (last !== undefined && HAS_DIGIT.test(last.w.text))
          d.label = { ids: [last.id], as: "number" };
      }
    } else if (d.kind === ItemKind.Text && !d.side && NUMBERED.test(firstWord)) {
      const prev = drafts[i - 1];
      if (!exercise && FIRST.test(firstWord)) {
        const brought = prev?.kind === ItemKind.Text && !prev.side;
        const says = prev?.rows.at(-1)?.words.at(-1)?.text.endsWith(":") === true;
        list = brought && says ? prev : d;
      }
      if (!exercise && list !== undefined) {
        if (list !== d && prev === list) {
          list.rows.push(...d.rows);
          drafts.splice(i, 1);
          i -= 1;
        }
        continue;
      }
      d.kind = ItemKind.Question;
      d.label = { ids: [d.rows[0]?.ids[0] ?? ""], as: "number" };
    }
  }
}

const lineAndWord = (id: string): [number, number] => {
  const m = /^L(\d+)\.(\d+)$/.exec(id);
  return [Number(m?.[1]), Number(m?.[2])];
};

/** Word ids as ranges (`L12.3-7, L13-L15, L16.1-4`), in the order given. */
export function rangesOf(page: NumberedPage, ids: readonly string[]): string {
  const size = (l: number) => page.lines[l - 1]?.length ?? 0;
  const next = (l: number, w: number): [number, number] => (w < size(l) ? [l, w + 1] : [l + 1, 1]);
  const spans: { from: [number, number]; to: [number, number] }[] = [];
  for (const id of ids) {
    const at = lineAndWord(id);
    const span = spans.at(-1);
    if (span !== undefined) {
      const n = next(...span.to);
      if (n[0] === at[0] && n[1] === at[1]) {
        span.to = at;
        continue;
      }
    }
    spans.push({ from: at, to: at });
  }
  const write = ({
    from: [l0, w0],
    to: [l1, w1],
  }: { from: [number, number]; to: [number, number] }) => {
    const wholeStart = w0 === 1;
    const wholeEnd = w1 === size(l1);
    if (l0 === l1) {
      if (wholeStart && wholeEnd) return `L${l0}`;
      return w0 === w1 ? `L${l0}.${w0}` : `L${l0}.${w0}-${w1}`;
    }
    const a = wholeStart ? `L${l0}` : `L${l0}.${w0}`;
    const b = wholeEnd ? `L${l1}` : `L${l1}.${w1}`;
    return `${a}-${b}`;
  };
  return spans.map(write).join(", ");
}

/** What a page's draft is read from, beside its words and drawn objects. */
export type DraftSignals = {
  /** The page's fonts (`readStyles`); without them nothing is told by font. */
  styles?: PageStyles;
  /** The words already proposed as furniture (`draftFurniture`), as word ids. */
  furniture?: readonly string[];
  /** The page before ends in an exercise, so a numbered line here is its question. */
  inExercise?: boolean;
};

/** A page's structure, drafted: blocks in reading order (the main text's, then a side column's). */
export function draftPage(
  page: NumberedPage,
  objects?: PageObjects,
  signals: DraftSignals = {},
): PageFile {
  const furniture = [...(signals.furniture ?? [])];
  const rows = cutCaptions(runsOf(page, new Set(furniture))).map((run): Row => {
    const font = fontOfWords(run.words, signals.styles);
    return { ...run, size: font.size, bold: font.bold, colour: font.colour };
  });
  const body = bodyFont(rows);
  const widest = Math.max(
    ...flowsOf(rows.map((r) => ({ ...r }))).map((f) => f.box[2] - f.box[0]),
    page.width / 2,
  );
  const { figures, rest } = takeFigures(rows, body, objects, page, widest);
  const panels = panelFlows(rest, objects?.objects ?? [], page.width * page.height);
  const flows = [...flowsOf(panels.rest), ...panels.flows];
  const wide = Math.max(...flows.map((f) => f.box[2] - f.box[0]), 1);
  const isSide = (f: Flow) => f.box[2] - f.box[0] < SIDE_WIDTH * wide;
  const inOrder = flows
    .map((f, i) => ({ f, i }))
    .sort((a, b) => {
      const [sa, sb] = [isSide(a.f), isSide(b.f)];
      if (sa !== sb) return sa ? 1 : -1;
      if (xOverlap(a.f.box, b.f.box) <= 0) return a.f.box[0] - b.f.box[0];
      return a.f.box[1] - b.f.box[1];
    })
    .map((o) => o.f);
  const drafts: Draft[] = inOrder.flatMap((flow) =>
    blocksOf(flow, isSide(flow), signals.styles).map((blockRows): Draft => {
      const side = isSide(flow);
      return { rows: blockRows, side, ...kindOf(blockRows, body, side) };
    }),
  );
  liftSideHeadings(drafts, flows, isSide, body);
  markNumbering(drafts, signals.inExercise ?? false);
  for (const fig of figures) insertFigure(drafts, fig);
  const blocks = drafts.map((d): PageBlock => {
    const block: PageBlock = {
      kind: d.kind,
      words: rangesOf(
        page,
        d.rows.flatMap((r) => r.ids),
      ),
    };
    if (d.label !== undefined) block[d.label.as] = rangesOf(page, d.label.ids);
    if (d.box !== undefined) {
      const [x0, y0, x1, y1] = d.box;
      block.box = [Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1)];
    }
    return block;
  });
  return {
    page: page.page,
    ...(furniture.length === 0 ? {} : { furniture: rangesOf(page, sortIds(furniture)) }),
    blocks,
  };
}

const sortIds = (ids: readonly string[]): string[] =>
  [...ids].sort((a, b) => {
    const [la, wa] = lineAndWord(a);
    const [lb, wb] = lineAndWord(b);
    return la - lb || wa - wb;
  });

/**
 * The page's figures: each caption, the lines of its that follow in its own font (never the body's),
 * the drawing beside it and the labels in that drawing. What is left is the page's text.
 */
function takeFigures(
  rows: readonly Row[],
  body: Font,
  objects: PageObjects | undefined,
  page: NumberedPage,
  columnWidth: number,
): { figures: Draft[]; rest: Row[] } {
  const captions = rows.filter((r) => isCaption(r, rows, columnWidth));
  const lines = rows.filter((r) => isTextLine(r) && captionLabel(r) === 0);
  const taken = new Set<Row>();
  const inPart = new Map<Row, Set<string>>();
  const figures: Draft[] = [];
  const sorted = [...rows].sort((a, b) => a.box[1] - b.box[1]);
  for (const row of sorted) {
    if (taken.has(row) || !isCaption(row, rows, columnWidth)) continue;
    const caption: Row[] = [row];
    taken.add(row);
    if (!sameFont(row, body))
      for (const next of sorted) {
        const last = caption.at(-1);
        if (last === undefined || taken.has(next) || next.box[1] <= last.box[1]) continue;
        if (next.box[1] - last.box[3] > 3 || xOverlap(next.box, last.box) <= 0) continue;
        if (!sameFont(next, row)) continue;
        if (captionLabel(next) > 0) break;
        caption.push(next);
        taken.add(next);
      }
    const capBox = caption.map((r) => r.box).reduce(widen);
    const others = captions.filter((c) => c !== row);
    const drawing = drawingOf(
      capBox,
      objects?.objects ?? [],
      [...lines.filter((l) => !caption.includes(l)), ...others],
      page.width * page.height,
    );
    const labels: Row[] = [];
    if (drawing !== undefined)
      for (const other of rows) {
        if (taken.has(other)) continue;
        // A short run by the drawing is a label (a graph's numbers); of a longer one, only what is on it.
        const reach = isTextLine(other) ? 0 : LABEL_REACH;
        const near = reach > 0 ? widen(drawing, capBox) : drawing;
        const inIt = other.words.every((w) => inBox(near, w, reach));
        const ids = inIt
          ? other.ids
          : other.ids.filter((_, i) => {
              const w = other.words[i];
              return w !== undefined && inBox(drawing, w, 0);
            });
        if (ids.length === 0) continue;
        const seen = inPart.get(other) ?? new Set<string>();
        for (const id of ids) seen.add(id);
        inPart.set(other, seen);
        labels.push(partOf(other, new Set(ids)));
      }
    const label = captionLabel(row);
    figures.push({
      rows: [...labels, ...caption],
      kind: ItemKind.Figure,
      ...(drawing === undefined
        ? {}
        : { box: [...labels, ...caption].map((r) => r.box).reduce(widen, drawing) }),
      label: { ids: row.ids.slice(0, label), as: "number" },
      side: false,
    });
  }
  const rest = rows.flatMap((r): Row[] => {
    if (taken.has(r)) return [];
    const gone = inPart.get(r);
    if (gone === undefined) return [r];
    const left = new Set(r.ids.filter((id) => !gone.has(id)));
    return left.size === 0 ? [] : [partOf(r, left)];
  });
  return { figures, rest };
}

/** A row's part: only the given words. */
function partOf(r: Row, ids: ReadonlySet<string>): Row {
  const keep = r.ids.map((id, i) => ({ id, w: r.words[i] })).filter((o) => ids.has(o.id));
  const words = keep.flatMap((o) => (o.w === undefined ? [] : [o.w]));
  return {
    ...r,
    ids: keep.map((o) => o.id),
    words,
    box: boundsOf(words),
    text: words.map((w) => w.text).join(" "),
  };
}

/**
 * A heading alone in the margin (one line, set by its font) heads what is beside it, not a side
 * column: it goes in before the first of the main text that starts at its height or below.
 */
function liftSideHeadings(
  drafts: Draft[],
  flows: readonly Flow[],
  isSide: (f: Flow) => boolean,
  body: Font,
): void {
  const alone = flows.filter((f) => isSide(f) && f.rows.length === 1);
  for (const flow of alone) {
    const row = flow.rows[0];
    const at = drafts.findIndex((d) => d.rows[0] === row);
    const draft = drafts[at];
    if (row === undefined || draft === undefined || !isSet(row, body)) continue;
    drafts.splice(at, 1);
    const below = drafts.findIndex((d) => !d.side && (d.rows[0]?.box[1] ?? 0) >= row.box[1] - LIFT);
    draft.side = false;
    draft.kind = ItemKind.Heading;
    draft.label = { ids: row.ids, as: "title" };
    drafts.splice(below === -1 ? drafts.length : below, 0, draft);
  }
}

/** A figure goes in by height among the blocks around it: before the first that starts below it. */
function insertFigure(drafts: Draft[], fig: Draft): void {
  const box = fig.box ?? fig.rows.map((r) => r.box).reduce(widen);
  const boxOf = (d: Draft) => d.rows.map((r) => r.box).reduce(widen);
  const at = drafts.findIndex((d) => {
    const b = boxOf(d);
    return xOverlap(b, box) > 0 && b[1] > box[1] && !d.side;
  });
  if (at === -1) {
    const firstSide = drafts.findIndex((d) => d.side);
    drafts.splice(firstSide === -1 ? drafts.length : firstSide, 0, fig);
  } else drafts.splice(at, 0, fig);
}

/** Text that ends with this has finished its sentence. */
const ENDS = /[.!?।॥:;)"”’]$/;

/**
 * A sentence running over a page's end: the main text's lowest block (a text or a question) doesn't
 * end its sentence, and the next page's highest is plain text.
 */
function markJoins(files: readonly PageFile[], pages: readonly NumberedPage[]): void {
  const spread = (page: NumberedPage, block: PageBlock) => {
    const ids = expand(block.words, page.words);
    const words = ids.flatMap((id) => {
      const w = page.words.get(id);
      return w === undefined ? [] : [w];
    });
    return { block, box: boundsOf(words), last: words.at(-1)?.text ?? "" };
  };
  const mainOf = (page: NumberedPage, file: PageFile) => {
    const all = file.blocks.filter((b) => b.kind !== ItemKind.Figure).map((b) => spread(page, b));
    const widest = Math.max(...all.map((b) => b.box[2] - b.box[0]), 0);
    return all.filter((b) => b.box[2] - b.box[0] >= SIDE_WIDTH * widest);
  };
  files.forEach((file, i) => {
    const [page, nextPage, next] = [pages[i], pages[i + 1], files[i + 1]];
    if (page === undefined || nextPage === undefined || next === undefined) return;
    const lowest = mainOf(page, file).sort((a, b) => b.box[3] - a.box[3])[0];
    const highest = mainOf(nextPage, next).sort((a, b) => a.box[1] - b.box[1])[0];
    if (lowest === undefined || highest === undefined) return;
    const kinds: ItemKind[] = [ItemKind.Text, ItemKind.Question];
    if (!kinds.includes(lowest.block.kind) || highest.block.kind !== ItemKind.Text) return;
    if (ENDS.test(lowest.last)) return;
    lowest.block.continues = true;
    highest.block.continued = true;
  });
}

/** Whether a page ends in an exercise: its last section, heading or exercise says, else the page before. */
function endsInExercise(file: PageFile, before: boolean): boolean {
  for (const b of [...file.blocks].reverse()) {
    if (b.kind === ItemKind.Exercise || b.kind === ItemKind.Question) return true;
    if (b.kind === ItemKind.Section || b.kind === ItemKind.Heading) return false;
  }
  return before;
}

/**
 * A book's pages drafted together: furniture by what repeats, the drawn objects without what is
 * drawn on every page, and a sentence running over a page's end joined to the next.
 */
export function draftPages(
  pages: readonly NumberedPage[],
  objects?: readonly PageObjects[],
  styles?: readonly PageStyles[],
): PageFile[] {
  const furniture = draftFurniture(pages);
  const drawn = objects === undefined ? [] : withoutRepeats(objects);
  let inExercise = false;
  const files = pages.map((p) => {
    const signals: DraftSignals = { furniture: furniture.get(p.page) ?? [], inExercise };
    const s = styles?.find((x) => x.page === p.page);
    if (s !== undefined) signals.styles = s;
    const file = draftPage(
      p,
      drawn.find((o) => o.page === p.page),
      signals,
    );
    inExercise = endsInExercise(file, inExercise);
    return file;
  });
  markJoins(files, pages);
  return files;
}
