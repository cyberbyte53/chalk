import { execFileSync } from "node:child_process";

/**
 * What every reader gives (stage 1, platform/docs/plans/sources.md): a PDF's pages, each word and where
 * it is (points from the page's top left), in reading order, the running head and the footer apart;
 * and what is set in bold (where a term is defined). And what readers share: poppler, a page split into
 * head, words and foot, stacked fractions.
 */

export type Word = { text: string; x0: number; y0: number; x1: number; y1: number };

export type PageText = {
  /** The PDF's page, from 1. */
  page: number;
  width: number;
  height: number;
  /** The page's words in reading order, without its running head and footer. */
  words: Word[];
  /** The running head's words (the page's number among them), and the footer's. */
  head: Word[];
  foot: Word[];
  /** Runs set in bold, in reading order. */
  bold: string[];
};

/** Runs a poppler tool, or says how to install it. */
export function poppler(tool: string, args: string[]): string {
  try {
    return execFileSync(tool, args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT")
      throw new Error(
        `${tool} isn't installed: it comes with poppler (macOS: brew install poppler; Debian: apt install poppler-utils)`,
      );
    throw error;
  }
}

const entities: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
};
export const decode = (s: string) =>
  s.replace(/&(amp|lt|gt|quot|apos|#\d+);/g, (e) =>
    e.startsWith("&#") ? String.fromCodePoint(Number(e.slice(2, -1))) : (entities[e] ?? e),
  );
export const attr = (tag: string, name: string) =>
  Number(new RegExp(`${name}="([\\d.]+)"`).exec(tag)?.[1]);

const HEAD_BAND = 0.16;
const FOOT_BAND = 0.94;

/** A page's words, its running head and footer apart: a running head is near the top and holds the page's number; a footer is the bottom strip. */
export function splitPage(
  page: number,
  width: number,
  height: number,
  all: Word[],
): Omit<PageText, "bold"> {
  const number = all.find((w) => /^\d+$/.test(w.text) && w.y1 < height * HEAD_BAND);
  const isHead = (w: Word) =>
    number !== undefined &&
    (w.y0 + w.y1) / 2 >= number.y0 - 3 &&
    (w.y0 + w.y1) / 2 <= number.y1 + 3;
  const isFoot = (w: Word) => w.y0 > height * FOOT_BAND;
  return {
    page,
    width,
    height,
    words: withoutStackedFractions(all.filter((w) => !isHead(w) && !isFoot(w))),
    head: all.filter(isHead),
    foot: all.filter(isFoot),
  };
}

const middle = (w: Word) => (w.y0 + w.y1) / 2;

/**
 * A stacked fraction's digits (⅔ set as 2 over 3) are words above and below the line they sit in,
 * read out of order: they are left out, as the comparison leaves fractions out (letters.ts).
 */
export function withoutStackedFractions(words: readonly Word[]): Word[] {
  const isDigits = (w: Word) => /^\d+$/.test(w.text);
  const stacked = new Set<Word>();
  for (const top of words.filter(isDigits))
    for (const bottom of words.filter(isDigits)) {
      const isUnder =
        Math.abs((top.x0 + top.x1) / 2 - (bottom.x0 + bottom.x1) / 2) < 2 &&
        bottom.y0 - top.y1 < 8 &&
        bottom.y0 > top.y0;
      const isAcross = words.some(
        (w) =>
          w !== top &&
          w !== bottom &&
          middle(w) > top.y1 - 2 &&
          middle(w) < bottom.y0 + 2 &&
          Math.min(Math.abs(w.x1 - top.x0), Math.abs(w.x0 - top.x1)) < 30,
      );
      if (isUnder && isAcross) {
        stacked.add(top);
        stacked.add(bottom);
      }
    }
  return words.filter((w) => !stacked.has(w));
}

/** A page's words as one text, in reading order. */
export const pageText = (p: Pick<PageText, "words">): string =>
  p.words.map((w) => w.text).join(" ");
