import type { PageText, Word } from "./pages";

/**
 * A page's words numbered, in the PDF's lines (platform/docs/plans/sources.md, "The stages"): `L12`
 * is a line, `L12.3` its third word. What the agents cite in their page files, and what the build
 * reads those citations against. Lines are only a convenience: one can run across a side column
 * and the body, so blocks cite word ranges.
 */

/** A page's numbered words, in order: `L12.3` → the word. */
export type NumberedPage = {
  page: number;
  width: number;
  height: number;
  lines: Word[][];
  /** Every word by its id (`L12.3`), in reading order. */
  words: Map<string, Word>;
};

/**
 * A word the PDF may have broken, a hint for the agent (others may be broken too): a doubled sign
 * or consonant, U+FFFD, a joiner not after ्, a mark standing alone at a word's start.
 */
export const looksBroken = (t: string): boolean =>
  /््|([ा-ौँ-ः])\1|\uFFFD|(?<!्)(?:\u200C|\u200D)|^[ऀ-ःऺ-ॏ]/.test(t) || /([क-ह])््?\1/.test(t);

const middle = (w: Word) => (w.y0 + w.y1) / 2;

/** A page's words as lines: words in a row whose middles are close and that run left to right. */
export function numberPage(page: PageText): NumberedPage {
  const lines: Word[][] = [];
  for (const w of page.words) {
    if (w.text.trim() === "") continue;
    const line = lines.at(-1);
    const last = line?.at(-1);
    if (
      line !== undefined &&
      last !== undefined &&
      Math.abs(middle(w) - middle(last)) < 4 &&
      w.x0 > last.x0
    )
      line.push(w);
    else lines.push([w]);
  }
  const words = new Map<string, Word>();
  lines.forEach((line, i) => {
    line.forEach((w, j) => words.set(`L${i + 1}.${j + 1}`, w));
  });
  return { page: page.page, width: page.width, height: page.height, lines, words };
}

/** A box around some words: `[x0, y0, x1, y1]`. */
export const boundsOf = (words: readonly Word[]): [number, number, number, number] => [
  Math.min(...words.map((w) => w.x0)),
  Math.min(...words.map((w) => w.y0)),
  Math.max(...words.map((w) => w.x1)),
  Math.max(...words.map((w) => w.y1)),
];

/**
 * `page-NN.words.txt`, what an agent reads beside the page's image: a line per PDF line, its box,
 * then each word with its number, `*` before one that looks broken.
 */
export function wordsFile(page: NumberedPage, heading: string): string {
  const lines = page.lines.map((l, i) => {
    const box = boundsOf(l).map(Math.round);
    const words = l.map((w, j) => `${j + 1}:${looksBroken(w.text) ? "*" : ""}${w.text}`);
    return `L${i + 1} [${box.join(",")}] ${words.join(" ")}`;
  });
  return `# ${heading}; boxes in points [x0,y0,x1,y1] from the top left; * = looks broken\n${lines.join("\n")}\n`;
}
