import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import type { Locale } from "@chalk/content";
import { Document, Scalar, isScalar, isSeq, stringify, visit } from "yaml";
import { type ExtractReport, buildExtract, checkExtract, citedChanges, issueLine } from "./check";
import { cropFigures } from "./crop";
import { extractsIn, readYaml, sha256, sourcePaths, takeIn } from "./files";
import {
  type NumberedPage,
  numberPage,
  readPages,
  readerFor,
  renderPages,
  wordsFile,
} from "./read";
import { type Book, type Item, bookSchema, itemsSchema } from "./schema";

/**
 * A chapter's book, one language, in its stages (platform/docs/plans/sources.md, "The stages"):
 * 1. prepare: the PDF taken in and recorded in book.yaml, each page's image and numbered words
 *    written for the agents (not in git);
 * 2. read: the agents write pages/page-NN.yaml (the skill .agents/skills/extract-chapter/);
 * 3. build and check: items.yaml, terms.yaml and figures/ built from the page files and the PDF,
 *    and the issues raised.
 * `pnpm source` runs them through here; the rest of Chalk only reads the files written.
 */

export type SourceRun = {
  root: string;
  book: string;
  chapter: string;
  lang: Locale;
  /** The PDF, a file or an address; absent, the one already there. */
  input?: string;
  answers?: string;
  address?: string;
  title?: string;
  edition?: string;
  isNewEdition?: boolean;
};

/** What a run says (each line for the console) and whether it holds. */
export type SourceResult = { lines: string[]; problems: string[] };

const SKILL = ".agents/skills/extract-chapter/SKILL.md";
/** Page images are what the agents see: the PDF's pages at 144 dpi. */
const PAGE_PREFIX = "page";
const ANSWERS_PREFIX = "answers";

/** Each stage the extract is ready for: prepared always, built once there are page files. */
export async function runSource(run: SourceRun): Promise<SourceResult> {
  const at = sourcePaths(run.root, run.book, run.chapter, run.lang);
  const lines = await prepare(run);
  if (!existsSync(at.pages)) return { lines, problems: [] };
  const built = buildSource(run);
  return { lines: [...lines, ...built.lines], problems: built.problems };
}

/** Stage 1: the PDF in and recorded; each page's image and words file written for the agents. */
export async function prepare(run: SourceRun): Promise<string[]> {
  const at = sourcePaths(run.root, run.book, run.chapter, run.lang);
  const rel = (p: string) => relative(run.root, p);
  mkdirSync(at.dir, { recursive: true });
  const recorded = readYaml(at.book, bookSchema);
  if (recorded.problem !== undefined && run.input === undefined) throw new Error(recorded.problem);
  const old = recorded.value;
  await takeIn(run.input, at.pdf, old, run.isNewEdition ?? false);
  if (run.answers !== undefined)
    await takeIn(run.answers, at.answers, old?.answers, run.isNewEdition ?? false);
  const reader = old?.reader ?? readerFor(at.pdf);
  const pages = readPages(at.pdf, reader).map(numberPage);
  const isAnswers = existsSync(at.answers);
  const answerPages = isAnswers ? readPages(at.answers, reader).map(numberPage) : [];
  const address = (from: string | undefined, before: string | undefined) =>
    run.address ?? (from !== undefined && /^https?:\/\//.test(from) ? from : before) ?? from;
  const edition = run.edition ?? old?.edition ?? editionOf(pages);
  const book: Book = {
    title: run.title ?? old?.title ?? titleOf(pages[0]),
    reader,
    edition: edition ?? "unknown",
    address: address(run.input, old?.address) ?? "",
    sha256: sha256(readFileSync(at.pdf)),
    pages: pages.length,
    ...(isAnswers
      ? {
          answers: {
            address: address(run.answers, old?.answers?.address) ?? "",
            sha256: sha256(readFileSync(at.answers)),
            pages: answerPages.length,
          },
        }
      : {}),
    ...(old?.unmatched === undefined ? {} : { unmatched: old.unmatched }),
  };
  if (book.address === "") throw new Error("where did the PDF come from? give --address <url>");
  bookSchema.parse(book);
  writeFileSync(at.book, stringify(book, { lineWidth: 0 }));
  const images = renderPages(at.pdf, at.cache, PAGE_PREFIX).images;
  const answerImages = isAnswers ? renderPages(at.answers, at.cache, ANSWERS_PREFIX).images : [];
  const writeWords = (list: readonly NumberedPage[], prefix: string, pdf: string) =>
    list.map((p) => {
      const file = join(at.cache, `${prefix}-${String(p.page).padStart(2, "0")}.words.txt`);
      writeFileSync(file, wordsFile(p, `${basename(pdf)} page ${p.page}, read as ${reader}`));
      return file;
    });
  const words = writeWords(pages, PAGE_PREFIX, at.pdf);
  const answerWords = writeWords(answerPages, ANSWERS_PREFIX, at.answers);
  const pairs = (imgs: readonly string[], txts: readonly string[]) =>
    imgs.map((f, i) => `  ${rel(f)}  ${basename(txts[i] ?? "")}`).join("\n");
  return [
    `${rel(at.book)}: "${book.title}", edition ${book.edition}, ${book.pages} pages, read as ${reader}${edition === undefined ? " (no edition found on the pages: set it in book.yaml, as printed)" : ""}`,
    "check the title and edition against page 1",
    `the agents read the pages by ${SKILL}, each page from its image and its numbered words, writing ${rel(at.pages)}/page-NN.yaml:`,
    pairs(images, words),
    ...(isAnswers ? ["and the answers pages:", pairs(answerImages, answerWords)] : []),
  ];
}

/**
 * The edition the pages print: a year span (`2020-21`) on at least half the pages, the most common;
 * none, when the book prints none.
 */
function editionOf(pages: readonly NumberedPage[]): string | undefined {
  const counts = new Map<string, number>();
  for (const p of pages)
    for (const year of new Set(
      [...p.words.values()].map((w) => w.text).filter((t) => /^\d{4}-\d{2}$/.test(t)),
    ))
      counts.set(year, (counts.get(year) ?? 0) + 1);
  const [best] = [...counts].sort((a, b) => b[1] - a[1]);
  return best !== undefined && best[1] * 2 >= pages.length ? best[0] : undefined;
}

/** The chapter's title, a guess to check: page 1's line in the largest type. */
function titleOf(page: NumberedPage | undefined): string {
  const height = (l: NumberedPage["lines"][number]) =>
    Math.max(...l.map((w) => w.y1 - w.y0)) * Math.min(1, l.length / 2);
  const [line] = [...(page?.lines ?? [])].sort((a, b) => height(b) - height(a));
  return (line ?? []).map((w) => w.text).join(" ") || "untitled";
}

/** Stage 3: build items.yaml, terms.yaml and figures/ from the page files, and check. */
export function buildSource(run: SourceRun): SourceResult {
  const at = sourcePaths(run.root, run.book, run.chapter, run.lang);
  const rel = (p: string) => relative(run.root, p);
  const x = { dir: at.dir, rel: at.rel, lang: run.lang };
  const b = buildExtract(x);
  const lines: string[] = [];
  if (b.built === undefined) return { lines: b.notes, problems: b.problems };
  const was = readYaml(at.items, itemsSchema).value ?? [];
  const moved = citedChanges(x, was, b.built.items);
  if (moved.length > 0)
    return {
      lines: [`${rel(at.items)} not written: an id that boards.md cites would change`],
      problems: moved,
    };
  writeFileSync(at.items, header(ITEMS_HEADER) + yaml(b.built.items));
  writeFileSync(at.terms, header(TERMS_HEADER) + yaml(b.built.terms));
  const made = cropFigures(at.pdf, b.built.crops, at.figures, at.cache);
  lines.push(`${rel(at.items)}: ${summary(b.built.items)}; ${b.built.terms.length} terms`);
  if (made.length > 0)
    lines.push(`cropped (look at each):\n${made.map((f) => `  ${rel(f)}`).join("\n")}`);
  const answered = b.issues.filter((i) => i.answer !== undefined);
  const open = b.issues.filter((i) => i.answer === undefined);
  if (answered.length > 0)
    lines.push(
      `answered (read each answer):\n${answered.map((i) => `  ${issueLine(i)}`).join("\n")}`,
    );
  if (open.length > 0)
    lines.push(
      `issues (fix the page file, or answer each in its answers with why):\n${open.map((i) => `  ${issueLine(i)}`).join("\n")}`,
    );
  lines.push(...b.notes);
  return { lines, problems: [...b.problems, ...open.map(issueLine)] };
}

const ITEMS_HEADER =
  "Built by pnpm source from pages/ and book.pdf (platform/docs/plans/sources.md): don't edit, edit the page files.";
const TERMS_HEADER = ITEMS_HEADER;
const header = (text: string) => `# ${text}\n`;
/** Items or terms as YAML: ids always quoted (`1.13` unquoted reads back as a number), boxes on one line. */
function yaml(value: unknown): string {
  const doc = new Document(value);
  visit(doc, {
    Pair(_, pair) {
      const key = isScalar(pair.key) ? pair.key.value : undefined;
      if ((key === "id" || key === "item") && isScalar(pair.value))
        pair.value.type = Scalar.QUOTE_DOUBLE;
      if (key === "crop" && isSeq(pair.value)) pair.value.flow = true;
    },
  });
  return doc.toString({ lineWidth: 100, flowCollectionPadding: false });
}

function summary(items: readonly Item[]): string {
  const counts = new Map<string, number>();
  for (const i of items) counts.set(i.kind, (counts.get(i.kind) ?? 0) + 1);
  return `${items.length} items (${[...counts].map(([k, n]) => `${n} ${k}`).join(", ")})`;
}

/** Every extract in the repo checked (`pnpm check`'s sources step). */
export function checkSources(root: string): { rel: string; report: ExtractReport }[] {
  return extractsIn(root).map((x) => ({ rel: x.rel, report: checkExtract(x) }));
}
