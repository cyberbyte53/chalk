import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { Locale } from "@chalk/content";
import { PNG } from "pngjs";
import { type Block, type BuiltPage, NO_CAUSE, type PageTools, buildPage } from "./build";
import { type Built, JoinSide, asciiDigits, buildChapter, digitsOf } from "./chapter";
import {
  type Issue,
  NOT_PROOFREAD,
  type Numbered,
  answer,
  chapterIssues,
  issueLine,
  numbered,
  pageIssues,
  readingQuestion,
} from "./check";
import { CHANGED, spans } from "./check";
import { citedChanges } from "./cited";
import { showsOn } from "./crop";
import { type Extract, PAGE_PREFIX, chapterOf, extractPaths, readYaml, sha256 } from "./files";
import { isCandidate } from "./hindi/candidates";
import { isKnownWord } from "./hindi/list";
import { hasHindi } from "./hindi/script";
import { cachedObjects } from "./objects";
import { PAGE_SCALE, numberedPages, renderPages } from "./read";
import {
  type Book,
  CROPPED,
  type Item,
  ItemKind,
  Maker,
  type PageFile,
  SourceFile,
  type Term,
  type Tool,
  bookSchema,
  itemsSchema,
  pageFileName,
  pageFileSchema,
  termsSchema,
} from "./schema";
import { TOOL_VERSIONS } from "./tools";

/**
 * One language's extract as a whole: built from its page files and PDF, its issues raised and
 * answered, and checked against what is on disk (what `pnpm check` and `pnpm source` run).
 */

/** One language's extract built from its page files and PDF, with every issue and problem. */
export type ExtractBuild = {
  book?: Book;
  /** Absent: the extract has no pages/ yet (not read by this pipeline). */
  built?: Built;
  issues: Issue[];
  problems: string[];
  notes: string[];
};

/** The tools whose version isn't the one the chapter was built with: `reader 1 → 2`. */
export function changedTools(book: Book): string[] {
  return (Object.entries(TOOL_VERSIONS) as [Tool, number][]).flatMap(([tool, now]) => {
    const was = book.tools?.[tool];
    return was === now ? [] : [`${tool} ${was ?? "none"} → ${now}`];
  });
}

/** What a piece says, spacing aside (a tab the PDF put between words is a space). */
const contentOf = (i: Item) => ({
  text: i.text.replace(/\s+/g, " "),
  crop: i.crop,
  rows: i.rows?.map((r) => r.map((c) => c.replace(/\s+/g, " "))),
});

const short = (i: Item | undefined) =>
  i === undefined
    ? "(nothing)"
    : `"${i.text.slice(0, 50)}"${i.crop === undefined ? "" : ` [${i.crop.join(", ")}]`}`;

/**
 * Every piece a tool's change altered, whether the agent had overridden it or accepted it: an issue
 * on its page, so output the agent never saw is never kept silently.
 */
export function changedPieces(
  was: readonly Item[],
  now: readonly Item[],
  tools: readonly string[],
): Issue[] {
  const before = new Map(was.map((i) => [i.id, i]));
  const after = new Map(now.map((i) => [i.id, i]));
  return [...new Set([...before.keys(), ...after.keys()])].flatMap((id) => {
    const [a, b] = [before.get(id), after.get(id)];
    if (a !== undefined && b !== undefined && isDeepStrictEqual(contentOf(a), contentOf(b)))
      return [];
    return [
      {
        id: `${CHANGED}${id}`,
        page: (b ?? a)?.page ?? 1,
        question: `with ${tools.join(", ")}, this piece was ${short(a)}, and is now ${short(b)}: right, against the image?`,
      },
    ];
  });
}

/** The page's tools, from its PDF: its drawn objects, and its image for what an object shows. */
export function pageToolsOf(pdf: string, cache: string) {
  const objects = cachedObjects(pdf, cache);
  const images = renderPages(pdf, cache, PAGE_PREFIX).images;
  const loaded = new Map<number, PNG>();
  return (page: number): PageTools => ({
    objects: objects[page - 1]?.objects ?? [],
    texts: objects[page - 1]?.texts ?? [],
    shows: (others) => (part) => {
      const png = loaded.get(page) ?? PNG.sync.read(readFileSync(images[page - 1] as string));
      loaded.set(page, png);
      return showsOn(png, PAGE_SCALE, others)(part);
    },
  });
}

/** Builds an extract and raises its issues; the files on disk are not compared (checkExtract does). */
export function buildExtract(x: Extract): ExtractBuild {
  const problems: string[] = [];
  const notes: string[] = [];
  const pagesDir = join(x.dir, SourceFile.Pages);
  if (!existsSync(pagesDir)) {
    notes.push("not yet read page by page (no pages/): its items.yaml is as it was written");
    return { issues: [], problems, notes };
  }
  const book = readYaml(join(x.dir, SourceFile.Book), bookSchema);
  if (book.problem !== undefined) problems.push(book.problem);
  const pdf = join(x.dir, SourceFile.Pdf);
  if (book.value === undefined || !existsSync(pdf)) {
    if (book.value === undefined && book.problem === undefined) problems.push("no book.yaml");
    if (!existsSync(pdf)) problems.push(`no ${SourceFile.Pdf}`);
    return { issues: [], problems, notes };
  }
  if (sha256(readFileSync(pdf)) !== book.value.sha256)
    problems.push(`${SourceFile.Pdf} isn't the book book.yaml records (its sha256 differs)`);
  if (book.value.tools === undefined) {
    notes.push(
      "from the first build (book.yaml records no tools' versions): to be read again, its items.yaml is as it was written",
    );
    return { issues: [], problems: [], notes };
  }
  for (const flag of ["title", "edition"] as const)
    if (book.value[flag] === undefined)
      problems.push(
        `no ${flag} in book.yaml: read it on page 1, and run again with --${flag} <as printed>`,
      );
  const words = numberedPages(pdf, book.value.reader);
  if (words.length !== book.value.pages)
    problems.push(`book.yaml says ${book.value.pages} pages; the PDF has ${words.length}`);

  // Each page file read against its page's words.
  const files = new Map<number, PageFile>();
  const names = readdirSync(pagesDir).filter((f) => f.endsWith(".yaml"));
  for (const name of names.sort()) {
    const n = Number(/^page-(\d+)\.yaml$/.exec(name)?.[1]);
    const rel = `${SourceFile.Pages}/${name}`;
    if (!Number.isInteger(n) || n < 1 || n > words.length) {
      problems.push(
        `${rel}: not a page of the PDF (page-01.yaml to ${pageFileName(words.length)})`,
      );
      continue;
    }
    const read = readYaml(join(pagesDir, name), pageFileSchema);
    if (read.problem !== undefined) problems.push(read.problem.replace(pagesDir, SourceFile.Pages));
    else if (read.value !== undefined && read.value.page !== n)
      problems.push(`${rel}: says page ${read.value.page}`);
    else if (read.value !== undefined) files.set(n, read.value);
  }
  const unread = words
    .map((w) => w.page)
    .filter((n) => !files.has(n) && !names.includes(pageFileName(n)));
  if (unread.length > 0)
    problems.push(`pages not read yet (no ${SourceFile.Pages}/page-NN.yaml): ${spans(unread)}`);
  const root = x.dir.slice(0, -x.rel.length - 1);
  const { cache } = extractPaths(root, x.dir, x.lang);
  const toolsOf = pageToolsOf(pdf, cache);
  const pages = [...files]
    .sort((a, b) => a[0] - b[0])
    .map(([n, file]) => buildPage(file, words[n - 1] as (typeof words)[number], toolsOf(n)));
  for (const p of pages)
    problems.push(...p.problems.map((x) => `${SourceFile.Pages}/${pageFileName(p.page)}: ${x}`));
  const built = buildChapter(x.lang, pages, words.length);

  // The issues, and their answers.
  // A page not proofread says only that: its other questions wait until someone has looked.
  const read = new Set(pages.filter((p) => p.file.proofread === true).map((p) => p.page));
  const issues = [
    ...pages.flatMap(pageIssues),
    ...chapterIssues(built).filter((i) => read.has(i.page)),
  ];
  const changed = changedTools(book.value);
  const was = readYaml(join(x.dir, SourceFile.Items), itemsSchema).value;
  if (changed.length > 0 && was !== undefined)
    issues.push(...changedPieces(was, built.items, changed));
  problems.push(...answer(issues, new Map([...files].map(([n, f]) => [n, f.answers ?? {}]))));
  return { book: book.value, built, issues, problems, notes };
}

/** What a check of an extract found: its problems (unanswered issues among them), and what it holds. */
export type ExtractReport = {
  problems: string[];
  notes: string[];
  issues: Issue[];
  book?: Book;
  items: Item[];
  terms: Term[];
};

/**
 * Every check on one language's extract: it is built again from its page files and the PDF, its
 * issues raised, and its items.yaml and terms.yaml must be what that builds (the page files are the
 * record). An unanswered issue is a problem. An extract without pages/, or from before tools were
 * recorded, is not checked: a note.
 */
export function checkExtract(x: Extract): ExtractReport {
  const items = readYaml(join(x.dir, SourceFile.Items), itemsSchema);
  const terms = readYaml(join(x.dir, SourceFile.Terms), termsSchema);
  const b = buildExtract(x);
  const problems = [...b.problems];
  for (const r of [items, terms]) if (r.problem !== undefined) problems.push(r.problem);
  const report: ExtractReport = {
    problems,
    notes: b.notes,
    issues: b.issues,
    ...(b.book === undefined ? {} : { book: b.book }),
    items: items.value ?? [],
    terms: terms.value ?? [],
  };
  if (b.built === undefined) return report;
  problems.push(...b.issues.filter((i) => i.answer === undefined).map(issueLine));
  const rerun = `run pnpm source ${chapterOf(x)} ${x.lang}`;
  if (b.book !== undefined && changedTools(b.book).length > 0)
    problems.push(`built with other tools (${changedTools(b.book).join(", ")}): ${rerun}`);
  if (!isDeepStrictEqual(items.value, b.built.items)) {
    problems.push(`${SourceFile.Items} isn't what the page files build: ${rerun}`);
    problems.push(...citedChanges(x, items.value ?? [], b.built.items));
  }
  if (!isDeepStrictEqual(terms.value ?? [], b.built.terms))
    problems.push(`${SourceFile.Terms} isn't what the page files build: ${rerun}`);
  for (const c of b.built.crops)
    if (!existsSync(join(x.dir, SourceFile.Figures, `${c.id}.png`)))
      problems.push(`no ${SourceFile.Figures}/${c.id}.png: ${rerun}`);
  return report;
}
