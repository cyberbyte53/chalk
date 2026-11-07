import { type PageText, type Word, attr, decode, poppler } from "./pages";

/** The `text` reader: a PDF whose text layer is Unicode, read with poppler. */

/** `pdftotext -bbox-layout`'s pages: every word, in reading order. */
function pagesFromBbox(xhtml: string): PageText[] {
  return xhtml
    .split(/<page /)
    .slice(1)
    .map((chunk, i) => ({
      page: i + 1,
      width: attr(chunk, "width"),
      height: attr(chunk, "height"),
      words: [...chunk.matchAll(/<word ([^>]*)>([^<]*)<\/word>/g)].map(
        (m): Word => ({
          text: decode(m[2] ?? ""),
          x0: attr(m[1] ?? "", "xMin"),
          y0: attr(m[1] ?? "", "yMin"),
          x1: attr(m[1] ?? "", "xMax"),
          y1: attr(m[1] ?? "", "yMax"),
        }),
      ),
    }));
}

export function readText(pdf: string): PageText[] {
  return pagesFromBbox(poppler("pdftotext", ["-bbox-layout", pdf, "-"]));
}
