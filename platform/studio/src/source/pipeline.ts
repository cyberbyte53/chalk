import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import type { Locale } from "@chalk/content";
import { Document, Scalar, isMap, isScalar, isSeq, stringify, visit } from "yaml";
import type { Built, BuiltPage } from "./build";
import {
  type ExtractReport,
  buildExtract,
  changedTools,
  checkExtract,
  citedChanges,
  issueLine,
} from "./check";
import { cropFigures } from "./crop";
import { type PageStyles, draftPages, readStyles } from "./draft";
import {
  PAGE_PREFIX,
  type SourcePaths,
  extractsIn,
  readYaml,
  sha256,
  sourcePaths,
  takeIn,
} from "./files";
import type { PageObjects } from "./objects";
import { type NumberedPage, numberedPages, readerFor, renderPages, wordsFile } from "./read";
import {
  type Book,
  type Item,
  type Made,
  type PageFile,
  Maker as WhoMade,
  bookSchema,
  itemsSchema,
  pageFileName,
  pageFileSchema,
} from "./schema";
import type { TextPiece } from "./scripts";
import { type BuiltBlock, Maker as SheetMaker, SheetMode, renderSheets, sheetHtml } from "./sheet";
import { cachedObjects, suggestionLines, wordSuggestions } from "./suggest";
import { tidiedLine, tidy } from "./tidy";
import { TOOL_VERSIONS } from "./tools";

/**
 * A chapter's book, one language, in its stages (platform/docs/plans/sources.md, "The stages"):
 * 1. prepare: the PDF taken in and recorded in book.yaml, each page's draft page file written where
 *    none is there, and its image, numbered words and sheet of suggestions for the agents (not in git);
 * 2. proofread: the agents correct pages/page-NN.yaml (the skill .agents/skills/extract-chapter/);
 * 3. build and check: items.yaml, terms.yaml and figures/ built from the page files and the PDF,
 *    the issues raised, and each proofread page's sheet of decisions drawn.
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
  /** Before building, remove what the tools' improvements left in the page files (tidy.ts). */
  isTidy?: boolean;
};

/** What a run says (each line for the console) and whether it holds. */
export type SourceResult = { lines: string[]; problems: string[] };

const SKILL = ".agents/skills/extract-chapter/SKILL.md";
const ANSWERS_PREFIX = "answers";

/** Each stage the extract is ready for: prepared always, built once a page has been proofread. */
export async function runSource(run: SourceRun): Promise<SourceResult> {
  const at = sourcePaths(run.root, run.book, run.chapter, run.lang);
  const lines = await prepare(run);
  if (!isAnyProofread(at.pages)) return { lines, problems: [] };
  if (run.isTidy === true) {
    const x = { rel: at.rel, dir: at.dir, lang: run.lang };
    lines.push(tidiedLine(run.root, x, tidy(x)));
  }
  const { built, ...result } = buildSource(run);
  if (built !== undefined) await writeDecisionSheets(at, built.pages);
  return { lines: [...lines, ...result.lines], problems: result.problems };
}

/**
 * Whether anyone has looked at a page yet. Until then there is nothing to build: the drafts are the
 * tools' alone. A page file that doesn't parse counts, so that the build says what is wrong with it.
 */
function isAnyProofread(pages: string): boolean {
  if (!existsSync(pages)) return false;
  return readdirSync(pages)
    .filter((f) => f.endsWith(".yaml"))
    .some((f) => {
      const { value, problem } = readYaml(join(pages, f), pageFileSchema);
      return problem !== undefined || value?.proofread === true;
    });
}

/** A page's sheet by the name and mode it has: `page-03.sheet.png`, `page-03.decisions.png`. */
const sheetFile = (at: SourcePaths, page: number, name: string, extension: string) =>
  join(at.cache, `${PAGE_PREFIX}-${String(page).padStart(2, "0")}.${name}.${extension}`);

/** Photographs the sheets whose page changed: Chrome is slow, and most pages haven't. */
async function photograph(
  list: readonly { html: string; png: string; htmlFile: string }[],
): Promise<void> {
  const changed = list.filter(
    (s) =>
      !existsSync(s.png) || !existsSync(s.htmlFile) || readFileSync(s.htmlFile, "utf8") !== s.html,
  );
  if (changed.length === 0) return;
  await renderSheets(changed.map((s) => ({ html: s.html, out: s.png })));
  for (const s of changed) writeFileSync(s.htmlFile, s.html);
}

/**
 * Each page without a page file gets the structure draft's, marked not proofread. A page file already
 * there is the agent's: it is never written over. The pages drafted.
 */
export function writeDrafts(
  pagesDir: string,
  pages: readonly NumberedPage[],
  objects?: readonly PageObjects[],
  styles?: readonly PageStyles[],
): number[] {
  mkdirSync(pagesDir, { recursive: true });
  const missing = (n: number) => !existsSync(join(pagesDir, pageFileName(n)));
  if (!pages.some((p) => missing(p.page))) return [];
  return draftPages(pages, objects, styles)
    .filter((f) => missing(f.page))
    .map((f) => {
      // `page` and `proofread` first: what the agent looks for.
      const { page, ...rest } = f;
      const file: PageFile = { page, proofread: false, ...rest };
      writeFileSync(join(pagesDir, pageFileName(f.page)), stringify(file, { lineWidth: 0 }));
      return f.page;
    });
}

/** Each page's sheet of the tools' suggestions, from its page file as it stands. */
async function writeSuggestionSheets(
  at: SourcePaths,
  pages: readonly NumberedPage[],
  objects: readonly PageObjects[],
  images: readonly string[],
): Promise<string[]> {
  const list = pages.flatMap((page) => {
    const { value: file } = readYaml(join(at.pages, pageFileName(page.page)), pageFileSchema);
    if (file === undefined) return [];
    const html = sheetHtml({
      mode: SheetMode.Suggestions,
      page,
      file,
      image: images[page.page - 1] as string,
      suggestions: wordSuggestions(page, objects[page.page - 1]?.texts),
      objects: objects[page.page - 1]?.objects ?? [],
    });
    return [
      {
        html,
        png: sheetFile(at, page.page, "sheet", "png"),
        htmlFile: sheetFile(at, page.page, "sheet", "html"),
      },
    ];
  });
  await photograph(list);
  return list.map((s) => s.png);
}

/** What the build made of each block, by its place in the page file, for the sheet. */
function builtBlocks(page: BuiltPage): Map<number, BuiltBlock> {
  const byWhom = (by: Made["by"]) => (by === WhoMade.Agent ? SheetMaker.Agent : SheetMaker.Tool);
  return new Map(
    page.blocks.map((b, i) => {
      const box = b.made.find((m) => "box" in m);
      const cells = b.made.find((m) => "cells" in m);
      return [
        i,
        {
          ...(b.box === undefined ? {} : { box: b.box }),
          ...(box === undefined ? {} : { boxBy: byWhom(box.by) }),
          ...(b.rows === undefined ? {} : { rows: b.rows }),
          ...(cells === undefined ? {} : { rowsBy: byWhom(cells.by) }),
        },
      ];
    }),
  );
}

/** Each proofread page's sheet of what was decided, each piece coloured by who made it. */
async function writeDecisionSheets(at: SourcePaths, pages: readonly BuiltPage[]): Promise<void> {
  const objects = cachedObjects(at.pdf, at.cache);
  const images = renderPages(at.pdf, at.cache, PAGE_PREFIX).images;
  const read = pages.filter((p) => p.file.proofread === true && p.problems.length === 0);
  await photograph(
    read.map((p) => ({
      html: sheetHtml({
        mode: SheetMode.Decisions,
        page: p.words,
        file: p.file,
        image: images[p.page - 1] as string,
        suggestions: wordSuggestions(p.words, objects[p.page - 1]?.texts),
        objects: objects[p.page - 1]?.objects ?? [],
        built: builtBlocks(p),
      }),
      png: sheetFile(at, p.page, "decisions", "png"),
      htmlFile: sheetFile(at, p.page, "decisions", "html"),
    })),
  );
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
  const pages = numberedPages(at.pdf, reader);
  const isAnswers = existsSync(at.answers);
  const answerPages = isAnswers ? numberedPages(at.answers, reader) : [];
  const address = (from: string | undefined, before: string | undefined) =>
    run.address ?? (from !== undefined && /^https?:\/\//.test(from) ? from : before) ?? from;
  const title = run.title ?? old?.title;
  const edition = run.edition ?? old?.edition;
  const book: Book = {
    ...(title === undefined ? {} : { title }),
    reader,
    ...(edition === undefined ? {} : { edition }),
    address: address(run.input, old?.address) ?? "",
    sha256: sha256(readFileSync(at.pdf)),
    pages: pages.length,
    tools: old?.tools ?? TOOL_VERSIONS,
    ...(isAnswers
      ? {
          answers: {
            address: address(run.answers, old?.answers?.address) ?? "",
            sha256: sha256(readFileSync(at.answers)),
            pages: answerPages.length,
          },
        }
      : {}),
  };
  if (book.address === "") throw new Error("where did the PDF come from? give --address <url>");
  bookSchema.parse(book);
  writeFileSync(at.book, stringify(book, { lineWidth: 0 }));
  const images = renderPages(at.pdf, at.cache, PAGE_PREFIX).images;
  const answerImages = isAnswers ? renderPages(at.answers, at.cache, ANSWERS_PREFIX).images : [];
  const objects = cachedObjects(at.pdf, at.cache);
  const writeWords = (
    list: readonly NumberedPage[],
    prefix: string,
    pdf: string,
    texts: (page: number) => readonly TextPiece[] = () => [],
  ) =>
    list.map((p) => {
      const file = join(at.cache, `${prefix}-${String(p.page).padStart(2, "0")}.words.txt`);
      writeFileSync(
        file,
        wordsFile(p, `${basename(pdf)} page ${p.page}, read as ${reader}`) +
          suggestionLines(wordSuggestions(p, texts(p.page))),
      );
      return file;
    });
  const drafted = writeDrafts(at.pages, pages, objects, readStyles(at.pdf));
  const sheets = await writeSuggestionSheets(at, pages, objects, images);
  const words = writeWords(pages, PAGE_PREFIX, at.pdf, (n) => objects[n - 1]?.texts ?? []);
  const answerWords = writeWords(answerPages, ANSWERS_PREFIX, at.answers);
  const pairs = (imgs: readonly string[], txts: readonly string[]) =>
    imgs.map((f, i) => `  ${rel(f)}  ${basename(txts[i] ?? "")}`).join("\n");
  return [
    `${rel(at.book)}: ${book.pages} pages, read as ${reader}, title ${title === undefined ? "not set" : `"${title}"`}, edition ${edition ?? "not set"}`,
    ...(title === undefined || edition === undefined
      ? [
          "read them on page 1, and run again with --title <as printed> --edition <as printed, or none>",
        ]
      : []),
    `${drafted.length} page files drafted in ${rel(at.pages)}, each not proofread until someone has checked it (${SKILL}), by its sheet, image and numbered words:`,
    ...sheets.map((f) => `  ${rel(f)}`),
    pairs(images, words),
    ...(isAnswers ? ["and the answers pages:", pairs(answerImages, answerWords)] : []),
  ];
}

/** Stage 3: build items.yaml, terms.yaml and figures/ from the page files, and check. */
export function buildSource(run: SourceRun): SourceResult & { built?: Built } {
  const at = sourcePaths(run.root, run.book, run.chapter, run.lang);
  const rel = (p: string) => relative(run.root, p);
  const x = { dir: at.dir, rel: at.rel, lang: run.lang };
  const b = buildExtract(x);
  const lines: string[] = [];
  if (b.built === undefined) return { lines: b.notes, problems: b.problems };
  // A tool changed: nothing is taken in until each piece it altered has been looked at.
  const unseen = b.issues.filter((i) => i.id.startsWith("changed ") && i.answer === undefined);
  if (unseen.length > 0)
    return {
      lines: [
        `${rel(at.items)} not written: a tool changed, and these pieces with it (look at each, then answer it)`,
      ],
      problems: unseen.map(issueLine),
    };
  const was = readYaml(at.items, itemsSchema).value ?? [];
  const moved = citedChanges(x, was, b.built.items);
  if (moved.length > 0)
    return {
      lines: [`${rel(at.items)} not written: an id that boards.md cites would change`],
      problems: moved,
    };
  writeFileSync(at.items, header(ITEMS_HEADER) + yaml(b.built.items));
  writeFileSync(at.terms, header(TERMS_HEADER) + yaml(b.built.terms));
  if (b.book !== undefined && changedTools(b.book).length > 0)
    writeFileSync(at.book, stringify({ ...b.book, tools: TOOL_VERSIONS }, { lineWidth: 0 }));
  const made = cropFigures(at.pdf, b.built.crops, at.figures, at.cache);
  lines.push(`${rel(at.items)}: ${summary(b.built.items)}; ${b.built.terms.length} terms`);
  lines.push(`made: ${tally(b.built.items)}`);
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
  return { lines, problems: [...b.problems, ...open.map(issueLine)], built: b.built };
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
      // A table's rows and an item's makers read best a line each.
      if ((key === "rows" || key === "made") && isSeq(pair.value))
        for (const entry of pair.value.items) if (isSeq(entry) || isMap(entry)) entry.flow = true;
    },
  });
  return doc.toString({ lineWidth: 100, flowCollectionPadding: false });
}

/** Who made what isn't the PDF's as it is: `3 words by agent, 400 words by hindi-repair, 2 boxes by figure-snap`. */
function tally(items: readonly Item[]): string {
  const counts = new Map<string, number>();
  for (const i of items)
    for (const m of i.made ?? []) {
      const what = "words" in m ? "readings" : "box" in m ? "boxes" : "tables";
      const key = `${what} by ${m.by}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  return counts.size === 0
    ? "all of it the PDF's as it is"
    : [...counts].map(([k, n]) => `${n} ${k}`).join(", ");
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
