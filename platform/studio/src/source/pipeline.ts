import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import type { Locale } from "@chalk/content";
import { stringify } from "yaml";
import { type ExtractReport, checkExtract } from "./check";
import { cropFigures } from "./check/crop";
import { extractsIn, moveTerms, numberItems, readYaml, sha256, sourcePaths, takeIn } from "./files";
import { positionalIds } from "./ids";
import {
  PAGE_SCALE,
  type PageText,
  editionOf,
  pageText,
  printedPages,
  readPages,
  readerFor,
  renderPages,
} from "./read";
import { type Book, type Item, bookSchema, draftItemsSchema } from "./schema";

/**
 * A chapter's book, one language, extracted in four stages (platform/docs/plans/sources.md):
 * 1. read: the PDF → its pages' words and images, by the reader its kind of book needs (read/);
 * 2. draft: the words → items.yaml, once;
 * 3. structure: the model's, told here what to fix;
 * 4. check: ids numbered, figures cropped, the items checked against the book (check/).
 * Both commands call only this; the rest of Chalk only reads the files it writes (files.ts).
 */

export type SourceRun = {
  root: string;
  book: string;
  chapter: string;
  lang: Locale;
  /** The PDF, a file or an address; absent, the one already there. */
  input?: string | undefined;
  address?: string | undefined;
  title?: string | undefined;
  isNewEdition: boolean;
};

/** What a run says (each line for the console) and whether its checks hold. */
export type SourceResult = { lines: string[]; problems: string[]; isWaitingOnModel: boolean };

export async function runSource(run: SourceRun): Promise<SourceResult> {
  const at = sourcePaths(run.root, run.book, run.chapter, run.lang);
  const rel = (p: string) => relative(run.root, p);
  const lines: string[] = [];
  mkdirSync(at.dir, { recursive: true });

  // 1. Read.
  const recorded = readYaml(at.book, bookSchema);
  if (recorded.problem !== undefined && run.input === undefined) throw new Error(recorded.problem);
  const old = recorded.value;
  await takeIn(run.input, at.pdf, old, run.isNewEdition);
  const reader = readerFor(at.pdf);
  const pages = readPages(at.pdf, reader);
  const fromAddress =
    run.input !== undefined && /^https?:\/\//.test(run.input) ? run.input : undefined;
  const book: Book = {
    title: run.title ?? old?.title ?? firstLine(pages[0]),
    reader,
    edition: editionOf(pages),
    address: run.address ?? fromAddress ?? old?.address ?? run.input ?? "",
    sha256: sha256(readFileSync(at.pdf)),
    pages: pages.length,
    printed: printedPages(pages),
    ...(old?.unmatched === undefined ? {} : { unmatched: old.unmatched }),
  };
  if (book.address === "") throw new Error("where did the PDF come from? give --address <url>");
  bookSchema.parse(book);
  writeFileSync(at.book, stringify(book, { lineWidth: 0 }));
  const { images, changed } = renderPages(at.pdf, at.cache, "page");
  pages.forEach((p, i) =>
    writeFileSync(
      join(at.cache, `page-${String(i + 1).padStart(2, "0")}.txt`),
      `${pageText(p)}\n\nbold: ${p.bold.join(" | ")}\n`,
    ),
  );
  lines.push(
    `${rel(at.book)}: ${book.title}, ${book.edition}, ${book.pages} pages (the book's ${book.printed[0]}–${book.printed.at(-1)}), read as ${reader}`,
    `page images: ${rel(at.cache)}/ (${changed.length} changed${changed.length > 0 ? `: pages ${changed.join(", ")}` : ""})`,
  );

  // 2. Draft, and 3. the model's structure.
  if (!existsSync(at.items)) {
    lines.push(modelStep(images, at, rel));
    return { lines, problems: [], isWaitingOnModel: true };
  }

  // 4. Check: number, crop, check.
  const moved = numberItems(at.items);
  moveTerms(at.terms, moved);
  if (moved.size > 0)
    lines.push(
      `${moved.size} items numbered again (terms moved with them): cites of the old ids are to move too`,
    );
  const drafts = readYaml(at.items, draftItemsSchema).value ?? [];
  const ids = positionalIds(drafts);
  const items: Item[] = drafts.map((d, i) => ({ ...d, id: ids[i] as string }));
  const made = cropFigures(at.pdf, items, pages, at.figures, at.cache, changed);
  if (made.length > 0)
    lines.push(`cropped (look at each):\n${made.map((f) => `  ${rel(f)}`).join("\n")}`);
  if (changed.length > 0)
    lines.push(`pages ${changed.join(", ")} changed: read them again against ${rel(at.items)}`);
  const report = checkExtract({ dir: at.dir, rel: at.rel, lang: run.lang });
  lines.push(summary(report));
  return { lines, problems: report.problems, isWaitingOnModel: false };
}

/** Every extract in the repo checked (`pnpm check`'s sources step). */
export function checkSources(root: string): { rel: string; report: ExtractReport }[] {
  return extractsIn(root).map((x) => ({ rel: x.rel, report: checkExtract(x) }));
}

const firstLine = (p: PageText | undefined) =>
  (p?.words ?? [])
    .filter((w) => Math.abs(w.y0 - (p?.words[0]?.y0 ?? 0)) < 3)
    .map((w) => w.text)
    .join(" ");

function summary(report: ExtractReport): string {
  const counts = new Map<string, number>();
  for (const i of report.items) counts.set(i.kind, (counts.get(i.kind) ?? 0) + 1);
  return `${report.items.length} items (${[...counts].map(([k, n]) => `${n} ${k}`).join(", ")}), ${report.terms.length} terms`;
}

const ITEMS_SHAPE = `- kind: section          # section | text | figure | table | example | activity | exercise | question
  page: 1                # the PDF's page it starts on
  number: "3.1"          # the book's own number, as printed: "Fig. 3.1", "Example 2", "EXERCISE 3.1", a question's "Q1"
  text: Introduction     # the book's exact words; maths as the lessons write it: (x, y), −3, 2/3
- kind: figure
  page: 1
  number: Fig. 3.1
  text: ""               # its caption and the labels set as text (not its number)
  crop: [300, 430, 440, 600]   # its box in points from the page's top left: the image's pixels ÷ ${PAGE_SCALE}
- kind: question
  page: 3
  number: Q1
  text: How will you describe …`;

/** Stage 3, the model's: what to read and write. */
function modelStep(
  images: readonly string[],
  at: ReturnType<typeof sourcePaths>,
  rel: (p: string) => string,
): string {
  return `
Next, the model's part. Read each page image, in order:
${images.map((f) => `  ${rel(f)}`).join("\n")}
(each page's text layer and its bold runs are beside it, page-NN.txt). Write ${rel(at.items)}: every
block of the book in reading order, its exact words, no ids (the machine numbers them):

${ITEMS_SHAPE}

A section inside a section has level: 2. An exercise's questions follow it. A figure's parts (a), (b),
(c) are one figure. Then run this again: it numbers the items and crops each figure and table into
${rel(at.figures)}/. Look at every crop and fix its box if it's wrong. Then write ${rel(at.terms)}:
what the book defines (in bold, in a sentence that defines it), each by the item it is defined in:

- term: origin
  item: "2.3"

and run this again until its checks pass.`;
}
