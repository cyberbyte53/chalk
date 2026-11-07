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

const middle = (w: Word) => (w.y0 + w.y1) / 2;

/** A page's words as the PDF's lines: words in a row whose middles are close and that run left to right. */
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
  return numbered(page, lines);
}

/** Lines given their numbers. */
function numbered(page: Omit<NumberedPage, "lines" | "words">, lines: Word[][]): NumberedPage {
  const words = new Map<string, Word>();
  lines.forEach((line, i) => {
    line.forEach((w, j) => words.set(`L${i + 1}.${j + 1}`, w));
  });
  return { page: page.page, width: page.width, height: page.height, lines, words };
}

/** Lines of the page within this many of a line's heights above or below it show its columns. */
const COLUMN_REACH = 8;
/** A gap under this many line heights is a wide space between words, never a column's edge. */
const COLUMN_GAP = 1.2;
/** Lines that must be on each side of a gap for it to be a gutter between columns. */
const COLUMN_LINES = 2;
/** A column is at least this share of the page's width. */
const COLUMN_WIDTH = 0.08;
/** The largest share of the lines around a gap that may run across it. */
const ACROSS = 0.2;

/** A line's height: its tallest word's. */
const heightOf = (line: readonly Word[]) => Math.max(...line.map((w) => w.y1 - w.y0));

/** Whether some words are wide enough to be a column's: not a list's number, not a label. */
const isColumnWide = (words: readonly Word[], pageWidth: number) =>
  words.length > 0 &&
  Math.max(...words.map((w) => w.x1)) - Math.min(...words.map((w) => w.x0)) >=
    COLUMN_WIDTH * pageWidth;

/**
 * Where a line runs across two columns of the page: the indexes of the words that start a new part.
 * A large gap inside the line is a gutter only if the lines around it say so: hardly any runs across
 * it, lines stand on each side of it, wide enough to be columns (or in parts, like this one), and some
 * stand wholly on one side. So a body's wide space, which lines run across, a table's rows, all in
 * parts, and a list's numbers, too narrow for a column, stay in their line.
 */
function columnStarts(
  line: readonly Word[],
  around: readonly (readonly Word[])[],
  pageWidth: number,
): number[] {
  const least = COLUMN_GAP * heightOf(line);
  const starts: number[] = [];
  let edge = line[0]?.x1 ?? 0;
  line.forEach((w, j) => {
    const gap = w.x0 - edge;
    edge = Math.max(edge, w.x1);
    if (j === 0 || gap < least) return;
    const at = w.x0 - gap / 2;
    let [onLeft, onRight, both, across] = [0, 0, 0, 0];
    for (const l of around) {
      const left = l.filter((x) => x.x1 <= at);
      const right = l.filter((x) => x.x0 >= at);
      if (left.length + right.length < l.length) across += 1;
      else if (left.length > 0 && right.length > 0) {
        // In parts only if its own gap is wide too; a body line's wide space runs across.
        const own = Math.min(...right.map((x) => x.x0)) - Math.max(...left.map((x) => x.x1));
        if (own < least) across += 1;
        else if (isColumnWide(left, pageWidth) && isColumnWide(right, pageWidth)) both += 1;
      } else if (isColumnWide(left, pageWidth)) onLeft += 1;
      else if (isColumnWide(right, pageWidth)) onRight += 1;
    }
    if (
      onLeft + both >= COLUMN_LINES &&
      onRight + both >= COLUMN_LINES &&
      Math.max(onLeft, onRight) >= COLUMN_LINES &&
      across <= ACROSS * around.length
    )
      starts.push(j);
  });
  return starts;
}

/**
 * The page with each line that runs across two columns made two (a side box beside the body, on one
 * height in the PDF), numbered again: geometry only, nothing about a book. The left part keeps the
 * line's place, the right part comes next.
 */
export function splitColumns(page: NumberedPage): NumberedPage {
  const middleOf = (l: readonly Word[]) =>
    (Math.min(...l.map((w) => w.y0)) + Math.max(...l.map((w) => w.y1))) / 2;
  const lines = page.lines.flatMap((line) => {
    const reach = COLUMN_REACH * heightOf(line);
    const around = page.lines.filter(
      (l) => l !== line && Math.abs(middleOf(l) - middleOf(line)) <= reach,
    );
    const starts = columnStarts(line, around, page.width);
    return [0, ...starts].map((from, k) => line.slice(from, starts[k]));
  });
  return numbered(page, lines);
}

/** A box around some words: `[x0, y0, x1, y1]`. */
export const boundsOf = (words: readonly Word[]): [number, number, number, number] => [
  Math.min(...words.map((w) => w.x0)),
  Math.min(...words.map((w) => w.y0)),
  Math.max(...words.map((w) => w.x1)),
  Math.max(...words.map((w) => w.y1)),
];

/**
 * `page-NN.words.txt`, what an agent reads beside the page's image: a line per PDF line (split where
 * it runs across two columns), its box, then each word with its number. Nothing here marks a word as
 * doubtful: the agent proofreads all of it.
 */
export function wordsFile(page: NumberedPage, heading: string): string {
  const lines = page.lines.map((l, i) => {
    const box = boundsOf(l).map(Math.round);
    const words = l.map((w, j) => `${j + 1}:${w.text}`);
    return `L${i + 1} [${box.join(",")}] ${words.join(" ")}`;
  });
  return `# ${heading}; boxes in points [x0,y0,x1,y1] from the top left\n${lines.join("\n")}\n`;
}
