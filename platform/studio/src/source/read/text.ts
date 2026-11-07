import { type PageText, type Word, attr, decode, poppler, splitPage } from "./pages";

/** The `text` reader: a PDF whose text layer is Unicode, read with poppler. */

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

export function readText(pdf: string): PageText[] {
  const pages = pagesFromBbox(poppler("pdftotext", ["-bbox-layout", pdf, "-"]));
  const bold = boldFromXml(poppler("pdftohtml", ["-xml", "-i", "-stdout", "-q", pdf]));
  return pages.map((p, i) => ({ ...p, bold: bold[i] ?? [] }));
}
