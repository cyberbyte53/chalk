import type { NumberedPage, Word } from "../read";
import { type Repair, repair } from "./repair";

/**
 * A page's Hindi spans, found by the machine with no agent: the pieces of a line that touch on the
 * page are one word, and only a gap is between words. A PDF breaks a word into pieces (a mark, a
 * stray space) but keeps them touching; a word's own gap (about 2.4 points in the proof's books) is
 * never closed. Each touching run is repaired as one span; pieces with a gap between them are never
 * joined, so the PDF's own words stay split wherever it has a gap.
 */

/** The most a piece may start past the run's right edge and still touch it, in points. */
export const TOUCH = 0.5;

/** One span of a page: its words' ids (`L12.3`), the PDF's words, and its repair (or why not). */
export type PageSpan = { ids: string[]; pdf: string[]; repair: Repair };

const DEVANAGARI = /[ऀ-ॿ]/u;

/**
 * A line's words in touching runs. A mark's box is a point inside its word, so a piece is measured
 * from the run's furthest right edge so far, never only the piece before it.
 */
export function touchingRuns(line: readonly Word[]): number[][] {
  const runs: number[][] = [];
  let right = Number.NEGATIVE_INFINITY;
  line.forEach((w, i) => {
    const run = runs.at(-1);
    if (run !== undefined && w.x0 <= right + TOUCH) run.push(i);
    else {
      runs.push([i]);
      right = Number.NEGATIVE_INFINITY;
    }
    right = Math.max(right, w.x1);
  });
  return runs;
}

const middle = (w: Word) => (w.y0 + w.y1) / 2;
/** Two words at one height on the page: the PDF may number one printed line as two. */
const sameHeight = (a: Word, b: Word) => Math.abs(middle(a) - middle(b)) < (a.y1 - a.y0) / 2;

/**
 * Every span of a page, in reading order: a run without Hindi is kept as the PDF gives it. Pieces that
 * touch are one word; a piece from another of the PDF's numbered lines touches only at one height, and
 * starting inside the last piece or right at the run's edge (L56 स त, L57 ं लित ु is संतुलित, printed on
 * one line; a line that starts further left is another word however near).
 */
export function pageSpans(page: NumberedPage): PageSpan[] {
  const spans: { ids: string[]; pdf: string[] }[] = [];
  let right = Number.NEGATIVE_INFINITY;
  let last: { word: Word; line: number } | undefined;
  page.lines.forEach((line, l) => {
    line.forEach((word, j) => {
      const open = spans.at(-1);
      const touches =
        last !== undefined &&
        open !== undefined &&
        (last.line === l
          ? word.x0 <= right + TOUCH
          : sameHeight(last.word, word) &&
            word.x0 >= last.word.x0 - TOUCH &&
            word.x0 <= right + TOUCH &&
            DEVANAGARI.test(word.text) &&
            DEVANAGARI.test(last.word.text));
      if (touches) {
        open?.ids.push(`L${l + 1}.${j + 1}`);
        open?.pdf.push(word.text);
        right = Math.max(right, word.x1);
      } else {
        spans.push({ ids: [`L${l + 1}.${j + 1}`], pdf: [word.text] });
        right = word.x1;
      }
      last = { word, line: l };
    });
  });
  return joinNarrowGaps(page, spans).map(({ ids, pdf }) => ({
    ids,
    pdf,
    repair: pdf.some((p) => DEVANAGARI.test(p)) ? repair(pdf) : { reading: pdf.join("") },
  }));
}

/** A gap this much narrower than its line's usual gap is inside a word (के|वल 2.3 against 3.0). */
export const NARROW = 0.8;
/** A line's usual gap is known from this many gaps. */
const GAPS = 4;
const LETTER = /[\u0904-\u0939\u0958-\u0961\u0972-\u097F]/u;
const ONLY_HINDI = /^[\u0900-\u097F\u200C\u200D]+$/u;

/**
 * Two neighbouring spans of a line joined where the PDF put a space inside a word: the gap between
 * them well below the line's usual gap (a justified line's gaps between words are equal), each all
 * Hindi with a letter of its own (a loose mark belongs to the word before), and together exactly one
 * known word. A line with few gaps, or none narrower, is left as it is: the agent's.
 */
function joinNarrowGaps(
  page: NumberedPage,
  spans: { ids: string[]; pdf: string[] }[],
): { ids: string[]; pdf: string[] }[] {
  const wordOf = (id: string) => {
    const [l, j] = id.slice(1).split(".").map(Number);
    return page.lines[(l ?? 0) - 1]?.[(j ?? 0) - 1];
  };
  const lineOf = (id: string) => id.slice(1).split(".")[0];
  const gapBetween = (a: { ids: string[] }, b: { ids: string[] }) => {
    const [x, y] = [wordOf(a.ids.at(-1) ?? ""), wordOf(b.ids[0] ?? "")];
    const sameLine = lineOf(a.ids.at(-1) ?? "") === lineOf(b.ids[0] ?? "");
    return x === undefined || y === undefined || !sameLine ? undefined : y.x0 - x.x1;
  };
  const usual = new Map<string, number>();
  const byLine = new Map<string, number[]>();
  spans.forEach((s, i) => {
    const gap = i === 0 ? undefined : gapBetween(spans[i - 1] ?? s, s);
    if (gap !== undefined) {
      const l = lineOf(s.ids[0] ?? "") ?? "";
      byLine.set(l, [...(byLine.get(l) ?? []), gap]);
    }
  });
  for (const [l, gaps] of byLine)
    if (gaps.length >= GAPS)
      usual.set(l, [...gaps].sort((a, b) => a - b)[Math.floor(gaps.length / 2)] ?? 0);
  const out: { ids: string[]; pdf: string[] }[] = [];
  for (const s of spans) {
    const prev = out.at(-1);
    const gap = prev === undefined ? undefined : gapBetween(prev, s);
    const line = usual.get(lineOf(s.ids[0] ?? "") ?? "");
    const [a, b] = [prev?.pdf.join("") ?? "", s.pdf.join("")];
    const joins =
      prev !== undefined &&
      gap !== undefined &&
      line !== undefined &&
      gap < NARROW * line &&
      ONLY_HINDI.test(a) &&
      ONLY_HINDI.test(b) &&
      LETTER.test(a) &&
      LETTER.test(b) &&
      isOneWord(repair([...prev.pdf, ...s.pdf]));
    if (joins && prev !== undefined) {
      prev.ids.push(...s.ids);
      prev.pdf.push(...s.pdf);
    } else out.push({ ids: [...s.ids], pdf: [...s.pdf] });
  }
  return out;
}

const isOneWord = (r: Repair) => "reading" in r && !r.reading.includes(" ");
