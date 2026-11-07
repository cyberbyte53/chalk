import type { PageText, Word } from "../read";
import { type Box, CROPPED, type Item } from "../schema";
import { lettersOnly } from "./letters";

/** Where figures and tables sit on their pages, and which of a page's words are theirs. */

/** How far from a box its caption may be, in points, to be snapped to. */
const CAPTION_REACH = 60;
const PAD = 2;

/** Where the page prints a number (`Fig. 3.11`, perhaps as one word `Fig.3.11`): each place's words. */
export function placesOf(number: string, words: readonly Word[]): Word[][] {
  const want = lettersOnly(number).toLowerCase();
  const out: Word[][] = [];
  for (let i = 0; i < words.length; i += 1)
    for (let n = 1; n <= 3 && i + n <= words.length; n += 1) {
      const run = words.slice(i, i + n);
      if (lettersOnly(run.map((w) => w.text).join("")).toLowerCase() !== want) continue;
      out.push(run);
      break;
    }
  return out;
}

const boundsOf = (words: readonly Word[]): Box => [
  Math.min(...words.map((w) => w.x0)),
  Math.min(...words.map((w) => w.y0)),
  Math.max(...words.map((w) => w.x1)),
  Math.max(...words.map((w) => w.y1)),
];

const gap = ([a0, b0, a1, b1]: Box, [c0, d0, c1, d1]: Box) =>
  Math.hypot(Math.max(0, c0 - a1, a0 - c1), Math.max(0, d0 - b1, b0 - d1));

/**
 * The page's words that blocks read, as runs: from each word, the longest run of words in a row whose
 * letters a block near the page has, kept when it is two words or more. Each word → its run.
 */
export function readRuns(page: PageText, items: readonly Item[]): Map<Word, Word[]> {
  const blocks = blocksNear(items, page.page);
  const words = page.words;
  const out = new Map<Word, Word[]>();
  let i = 0;
  while (i < words.length) {
    let end = i;
    let run = lettersOnly(words[i]?.text ?? "");
    for (let j = i + 1; j < words.length; j += 1) {
      run += lettersOnly(words[j]?.text ?? "");
      if (!blocks.includes(run)) break;
      end = j;
    }
    if (end > i) {
      const seg = words.slice(i, end + 1);
      for (const w of seg) out.set(w, seg);
    }
    i = end + 1;
  }
  return out;
}

/**
 * A figure's caption: the place of its number nearest its box, within reach, that isn't in a
 * sentence (a block's run that goes beyond it: "see Fig.3.15"); else none.
 */
export function captionOf(
  box: Box,
  number: string | undefined,
  page: PageText,
  runs: ReadonlyMap<Word, Word[]>,
): Word[] {
  if (number === undefined) return [];
  const isInSentence = (place: Word[]) =>
    place.some((w) =>
      (runs.get(w) ?? []).some((x) => !place.includes(x) && lettersOnly(x.text) !== ""),
    );
  return (
    placesOf(number, page.words)
      .filter((place) => !isInSentence(place))
      .map((place) => ({ place, d: gap(box, boundsOf(place)) }))
      .filter((p) => p.d <= CAPTION_REACH)
      .sort((a, b) => a.d - b.d)[0]?.place ?? []
  );
}

/** A model's box snapped to its caption, taken in whole: the crop holds the figure and its caption. */
export function snapToCaption(box: Box, caption: readonly Word[]): Box {
  if (caption.length === 0) return box;
  const [x0, y0, x1, y1] = boundsOf(caption);
  return [
    Math.min(box[0], x0 - PAD),
    Math.min(box[1], y0 - PAD),
    Math.max(box[2], x1 + PAD),
    Math.max(box[3], y1 + PAD),
  ];
}

/** Whether any of a word is inside a box. */
export const overlaps = (w: Word, [x0, y0, x1, y1]: Box): boolean =>
  w.x1 > x0 && w.x0 < x1 && w.y1 > y0 && w.y0 < y1;

/** The blocks' words near a page (it, the one before and the one after), letters only, each apart. */
const blocksNear = (items: readonly Item[], page: number) =>
  items
    .filter((i) => !CROPPED.includes(i.kind) && Math.abs(i.page - page) <= 1)
    .map((i) => lettersOnly(i.text))
    // Apart: a run read across two blocks would be a caption read as their sentence.
    .join("|");

/** Where a figure or table is on its page: its box snapped to its caption, and the words in it. */
export type Placed = {
  box: Box;
  caption: Word[];
  /** Its own words: its caption, and labels set as text. */
  own: Word[];
  /** The page's running text the box takes in (text a figure sits beside): a block reads it. */
  running: Word[];
};

/** A figure or table placed on its page; undefined with no box. */
export function place(item: Item, page: PageText, items: readonly Item[]): Placed | undefined {
  if (item.crop === undefined) return undefined;
  const runs = readRuns(page, items);
  const caption = captionOf(item.crop, item.number, page, runs);
  const box = snapToCaption(item.crop, caption);
  const inBox = page.words.filter((w) => overlaps(w, box) && !caption.includes(w));
  // Words a block reads are the page's running text, unless the figure's own text reads them too
  // (a portrait's name, also said in the text beside it).
  const ours = lettersOnly(item.text);
  const isRunning = (w: Word) => {
    const run = runs.get(w);
    if (run === undefined) return false;
    const inside = lettersOnly(
      run
        .filter((x) => inBox.includes(x))
        .map((x) => x.text)
        .join(""),
    );
    return inside === "" || !ours.includes(inside);
  };
  return {
    box,
    caption,
    own: [...caption, ...inBox.filter((w) => !isRunning(w))],
    running: inBox.filter(isRunning),
  };
}

/** A page's words less the figures' and tables' own (their captions and labels): the running text. */
export function runningWords(page: PageText, items: readonly Item[]): Word[] {
  const own = new Set(
    items
      .filter((i) => CROPPED.includes(i.kind) && i.page === page.page)
      .flatMap((i) => place(i, page, items)?.own ?? []),
  );
  return page.words.filter((w) => !own.has(w));
}
