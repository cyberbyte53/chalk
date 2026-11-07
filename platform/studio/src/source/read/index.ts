import { readChanakya } from "./chanakya";
import { type PageText, poppler } from "./pages";
import { readText } from "./text";

/**
 * Stage 1, reading (platform/docs/plans/sources.md): a PDF's pages as words, by the reader its kind
 * of book needs. Every later stage sees only the pages, never the reader. A new kind of book (a scan:
 * OCR) is one more reader here.
 */

export const Reader = {
  /** A PDF whose text layer is Unicode. */
  Text: "text",
  /** A PDF set in the old Walkman-Chanakya Hindi font: its text layer converted by the font's table. */
  Chanakya: "chanakya",
} as const;
export type Reader = (typeof Reader)[keyof typeof Reader];

const READERS: Readonly<Record<Reader, (pdf: string) => PageText[]>> = {
  [Reader.Text]: readText,
  [Reader.Chanakya]: readChanakya,
};

/** The reader a PDF needs, from its fonts. */
export function readerFor(pdf: string): Reader {
  return /chanakya/i.test(poppler("pdffonts", [pdf])) ? Reader.Chanakya : Reader.Text;
}

/** A PDF's pages, read by its reader. */
export const readPages = (pdf: string, reader: Reader): PageText[] => READERS[reader](pdf);

export { type PageText, type Word, pageText, poppler } from "./pages";
export { PAGE_SCALE, editionOf, printedPages, renderPages } from "./images";
