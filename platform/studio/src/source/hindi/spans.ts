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

/** Every span of a page, in reading order: a run without Hindi is kept as the PDF gives it. */
export function pageSpans(page: NumberedPage): PageSpan[] {
  return page.lines.flatMap((line, l) =>
    touchingRuns(line).map((run) => {
      const ids = run.map((j) => `L${l + 1}.${j + 1}`);
      const pdf = run.map((j) => line[j]?.text ?? "");
      const kept: Repair = { reading: pdf.join("") };
      return { ids, pdf, repair: pdf.some((p) => DEVANAGARI.test(p)) ? repair(pdf) : kept };
    }),
  );
}
