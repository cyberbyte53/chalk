import { execFileSync } from "node:child_process";
import { Locale } from "@chalk/content";
import { fromChanakya, isChanakya } from "./chanakya";

/**
 * A PDF's text layer, page by page: each word and where it is (points from the page's top left),
 * in reading order, the running head and the footer apart; and what is set in bold (where a term
 * is defined). Read with poppler (`pdftotext`, `pdftohtml`).
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
const decode = (s: string) =>
  s.replace(/&(amp|lt|gt|quot|apos|#\d+);/g, (e) =>
    e.startsWith("&#") ? String.fromCodePoint(Number(e.slice(2, -1))) : (entities[e] ?? e),
  );
const attr = (tag: string, name: string) =>
  Number(new RegExp(`${name}="([\\d.]+)"`).exec(tag)?.[1]);

const HEAD_BAND = 0.16;
const FOOT_BAND = 0.94;

/** A page's words, its running head and footer apart: a running head is near the top and holds the page's number; a footer is the bottom strip. */
function splitPage(
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

/** `pdftotext -bbox-layout`'s pages: words in reading order, the head and foot apart. */
export function pagesFromBbox(xhtml: string): Omit<PageText, "bold">[] {
  return xhtml
    .split(/<page /)
    .slice(1)
    .map((chunk, i) =>
      splitPage(
        i + 1,
        attr(chunk, "width"),
        attr(chunk, "height"),
        [...chunk.matchAll(/<word ([^>]*)>([^<]*)<\/word>/g)].map(
          (m): Word => ({
            text: decode(m[2] ?? ""),
            x0: attr(m[1] ?? "", "xMin"),
            y0: attr(m[1] ?? "", "yMin"),
            x1: attr(m[1] ?? "", "xMax"),
            y1: attr(m[1] ?? "", "yMax"),
          }),
        ),
      ),
    );
}

/** How far a Hindi line's marks (ि, ें, the reph) rise above its run, as a share of its height. */
const MARKS_ABOVE = 0.3;
/** And how far its commas and brackets fall below it. */
const MARKS_BELOW = 0.15;

/**
 * `pdftohtml -xml -zoom 1`'s pages, each run of text read by its font (a legacy Hindi font's code
 * converted): its words (placed across the run by their share of its letters) in reading order, the
 * head and foot apart, and the runs set in a bold font.
 */
export function pagesFromXml(xml: string): PageText[] {
  // A font is declared on the first page that uses it, and used by later pages by its id.
  const fonts = new Map<string | undefined, string>();
  return xml
    .split(/<page /)
    .slice(1)
    .map((chunk, i) => {
      for (const m of chunk.matchAll(/<fontspec id="(\d+)"[^>]*family="([^"]*)"/g))
        fonts.set(m[1], m[2] ?? "");
      const words: Word[] = [];
      const bold: string[] = [];
      let open = false;
      for (const m of chunk.matchAll(/<text ([^>]*)>(.*?)<\/text>/g)) {
        const tag = m[1] ?? "";
        const font = fonts.get(/font="(\d+)"/.exec(tag)?.[1]) ?? "";
        const raw = decode((m[2] ?? "").replace(/<[^>]+>/g, ""));
        const text = isChanakya(font) ? fromChanakya(raw) : raw;
        const [top, left, width, height] = ["top", "left", "width", "height"].map((a) =>
          attr(tag, a),
        ) as [number, number, number, number];
        // Each word's place: the run's width shared by the code's letters (widths aren't known),
        // from the space before it, and the marks above the line (ि, ें, the reph) taken in.
        const share = (n: number) => left + (width * n) / Math.max(1, raw.length);
        let at = 0;
        let from = 0;
        for (const part of raw.split(/(\s+)/)) {
          at += part.length;
          if (part.trim() === "") continue;
          words.push({
            text: isChanakya(font) ? fromChanakya(part) : part,
            x0: share(from),
            y0: top - height * MARKS_ABOVE,
            x1: share(at),
            y1: top + height * (1 + MARKS_BELOW),
          });
          from = at;
        }
        const isBold = /bold/i.test(font) || /<b>/.test(m[2] ?? "");
        if (isBold && text.trim() !== "") {
          if (open && bold.length > 0) bold[bold.length - 1] = `${bold.at(-1)} ${text.trim()}`;
          else bold.push(text.trim());
        }
        open = isBold;
      }
      return { ...splitPage(i + 1, attr(chunk, "width"), attr(chunk, "height"), words), bold };
    });
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

/** `pdftohtml -xml`'s bold runs, page by page (consecutive bold pieces joined). */
export function boldFromXml(xml: string): string[][] {
  return xml
    .split(/<page /)
    .slice(1)
    .map((chunk) => {
      const runs: string[] = [];
      let open = false;
      for (const m of chunk.matchAll(/<text [^>]*>(.*?)<\/text>/g)) {
        const inner = m[1] ?? "";
        const b = /^(?:<i>)?<b>(.*?)<\/b>(?:<\/i>)?$/.exec(inner);
        if (b?.[1] !== undefined) {
          const text = decode(b[1].replace(/<[^>]+>/g, "")).trim();
          if (open && runs.length > 0) runs[runs.length - 1] = `${runs.at(-1)} ${text}`.trim();
          else runs.push(text);
          open = true;
        } else open = false;
      }
      return runs.filter((r) => r !== "");
    });
}

/** The text layer of a PDF in a language that is set in Unicode fonts. */
function unicodeTextLayer(pdf: string): PageText[] {
  const pages = pagesFromBbox(poppler("pdftotext", ["-bbox-layout", pdf, "-"]));
  const bold = boldFromXml(poppler("pdftohtml", ["-xml", "-i", "-stdout", "-q", pdf]));
  return pages.map((p, i) => ({ ...p, bold: bold[i] ?? [] }));
}

/** The text layer of a PDF set in a legacy Hindi font (Chanakya), converted by its table (chanakya.ts). */
function legacyHindiTextLayer(pdf: string): PageText[] {
  return pagesFromXml(poppler("pdftohtml", ["-xml", "-i", "-stdout", "-q", "-zoom", "1", pdf]));
}

/** Each language's reader of a PDF's text layer. */
export const TEXT_LAYER: Readonly<Record<Locale, (pdf: string) => PageText[]>> = {
  [Locale.En]: unicodeTextLayer,
  [Locale.Hi]: legacyHindiTextLayer,
};

/** A page's words as one text, in reading order. */
export const pageText = (p: Pick<PageText, "words">): string =>
  p.words.map((w) => w.text).join(" ");
