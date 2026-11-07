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
  return spans.map(({ ids, pdf }) => ({
    ids,
    pdf,
    repair: pdf.some((p) => DEVANAGARI.test(p)) ? repair(pdf) : { reading: pdf.join("") },
  }));
}
