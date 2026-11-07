import { Reader } from "../schema";
import { readChanakya } from "./chanakya";
import { type NumberedPage, numberPage, splitColumns } from "./lines";
import { type PageText, poppler } from "./pages";
import { readText } from "./text";

/**
 * Reading a PDF (platform/docs/plans/sources.md, "The stages"): its pages' words, by the reader its
 * kind of book needs. Every later stage sees only the words, never the reader. A new kind of book (a
 * scan: OCR) is one more reader here.
 */

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

/** A PDF's pages as the agents and the build number them: its lines, those across two columns split. */
export const numberedPages = (pdf: string, reader: Reader): NumberedPage[] =>
  readPages(pdf, reader).map((page) => splitColumns(numberPage(page)));

export { type PageText, type Word, poppler } from "./pages";
export {
  type NumberedPage,
  boundsOf,
  numberPage,
  splitColumns,
  wordsFile,
} from "./lines";
export { PAGE_SCALE, renderPages } from "./images";
