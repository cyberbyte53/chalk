import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { Locale } from "@chalk/content";
import { PNG } from "pngjs";
import {
  type Block,
  type Built,
  type BuiltPage,
  JoinSide,
  NO_CAUSE,
  type PageTools,
  asciiDigits,
  buildChapter,
  buildPage,
  digitsOf,
} from "./build";
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
 * The checks on one language's extract (platform/docs/plans/sources.md, "Checks"). Each raises
 * issues: an id, its page and a question (a mistake, or meant?). The agent fixes its page file or
 * answers the issue there with why; an answered issue passes and stays listed. Only what can't be meant is a problem outright: a file that doesn't
 * parse, a range not on the page, an answer to no issue.
 */

/** The runs of Hindi letters in a reading: what the word list judges. */
const HINDI_WORD = /[\u0900-\u0963\u0971-\u097F]+/gu;

/** The issue of a page the tools wrote and nobody has checked. Only `proofread: true` passes it. */
export const NOT_PROOFREAD = "not proofread";

/** Something to fix or answer: its id (`read L36.6`), its page, its question. */
export type Issue = { id: string; page: number; question: string; answer?: string };

/** Text compared by letters, marks and digits only. */
const lettersOnly = (s: string) =>
  asciiDigits(s.normalize("NFKC"))
    .replace(/[^\p{L}\p{M}\p{N}]/gu, "")
    .toLowerCase();

/**
 * Whether a reading holds to the PDF's letters; the question if it doesn't. Hindi: it must be one of
 * its span's candidates, so nothing can be invented. Anything else (maths): the same letters and
 * digits in order, its punctuation aside.
 */
export function readingQuestion(pdf: readonly string[], reading: string): string | undefined {
  const given = pdf.join(" ");
  const holds = hasHindi(given)
    ? isCandidate(pdf, reading)
    : lettersOnly(given) === lettersOnly(reading);
  return holds
    ? undefined
    : `"${reading}" hasn't the PDF's letters ("${given}"): a misreading, or is the PDF missing them?`;
}

/** A page's own issues: every word in one place, readings, numbers in their words, boxes, terms. */
export function pageIssues(p: BuiltPage): Issue[] {
  const issues: Issue[] = [];
  const raise = (id: string, question: string) => issues.push({ id, page: p.page, question });
  // The tools wrote it and nobody has looked: what's wrong with it can wait until someone does.
  if (p.file.proofread !== true) {
    raise(NOT_PROOFREAD, "not proofread yet: check it against the image, then set proofread: true");
    return issues;
  }
  for (const [id, w] of p.words.words) {
    const who = p.holders.get(id) ?? [];
    if (who.length === 0)
      raise(`unused ${id}`, `"${w.text}" is in no block and not furniture: missed, or meant?`);
    else if (who.length > 1)
      raise(`twice ${id}`, `"${w.text}" is in ${who.join(" and ")}: a mistake, or meant?`);
  }
  for (const { id, question } of p.raised) raise(id, question);
  for (const b of p.blocks) {
    for (const r of b.readings) {
      if (r.by !== Maker.Agent) continue;
      const q = readingQuestion(r.pdf, r.text);
      if (q !== undefined) raise(`read ${r.span}`, q);
    }
    if (b.numberIds?.every((id) => b.ids.includes(id)) === false)
      raise(
        `number ${b.handle}`,
        `its number "${b.number}" isn't in its words: a mistake, or meant?`,
      );
    if (CROPPED.includes(b.kind)) {
      const box = b.box;
      if (box === undefined) raise(`box ${b.handle}`, `a ${b.kind} with no box: where is it?`);
      else if (
        box[0] < 0 ||
        box[1] < 0 ||
        box[2] > p.words.width ||
        box[3] > p.words.height ||
        box[0] >= box[2] ||
        box[1] >= box[3]
      )
        raise(
          `box ${b.handle}`,
          `its box [${box.join(", ")}] isn't inside the page (${p.words.width} × ${p.words.height} points): a mistake?`,
        );
    }
  }
  for (const t of p.terms)
    if (t.ids.length > 0 && t.block === undefined)
      raise(`term ${t.span}`, `the term "${t.span}" isn't within one block's words: a mistake?`);
  return issues;
}

/** A numbered item's key: its kind and digits (`figure 7.4`), a question's within its exercise. */
export type Numbered = { key: string; kind: ItemKind; digits: number[]; index: number; item: Item };

/** A chapter's numbered items, keyed (a question by its number and which exercise it is in, counted in order). */
export function numbered(items: readonly Item[]): Numbered[] {
  let exercises = 0;
  return items.flatMap((item, index) => {
    if (item.kind === ItemKind.Exercise) exercises += 1;
    const digits = item.number === undefined ? undefined : digitsOf(item.number);
    if (digits === undefined) return [];
    const key =
      item.kind === ItemKind.Question
        ? `question ${digits} of exercise ${exercises}`
        : `${item.kind} ${digits}`;
    return [{ key, kind: item.kind, digits: digits.split(".").map(Number), index, item }];
  });
}

const isAfter = (a: readonly number[], b: readonly number[]): boolean => {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const x = a[i] ?? -1;
    const y = b[i] ?? -1;
    if (x !== y) return x > y;
  }
  return false;
};

/** Each word of the agent's Hindi readings not known (the list, or answered as real in any book), once for the whole book. */
function unknownWords(built: Built): Issue[] {
  const seen = new Set<string>();
  const issues: Issue[] = [];
  for (const p of built.pages)
    for (const b of p.blocks)
      for (const r of b.readings) {
        if (r.by !== Maker.Agent) continue;
        for (const word of r.text.match(HINDI_WORD) ?? []) {
          if (seen.has(word) || isKnownWord(word)) continue;
          seen.add(word);
          issues.push({
            id: `word ${word}`,
            page: p.page,
            question: `"${word}" (in the reading of ${r.span}) isn't in the Hindi word list: a misreading, or a real word as printed?`,
          });
        }
      }
  return issues;
}

/** The chapter's issues: pages that don't join, numbers of a kind out of order or twice, unknown words. */
export function chapterIssues(built: Built): Issue[] {
  const issues: Issue[] = unknownWords(built);
  for (const u of built.unpaired)
    issues.push({
      id: `${u.side} ${u.block.handle}`,
      page: u.block.page,
      question:
        u.side === JoinSide.Continues
          ? `this ${u.block.kind} continues, but the next page has no continued block for it: a mistake?`
          : `this ${u.block.kind} is continued, but the page before has no block that continues: a mistake?`,
    });
  const seen = new Map<string, Numbered>();
  const last = new Map<string, Numbered>();
  const handleOf = (n: Numbered) => (built.parts[n.index]?.[0] as Block).handle;
  for (const n of numbered(built.items)) {
    const at = { page: n.item.page };
    const before = seen.get(n.key);
    // Questions are in order within their exercise; other kinds through the chapter.
    const series =
      n.kind === ItemKind.Question ? n.key.replace(/^question \S+/, "question") : n.kind;
    const previous = last.get(series);
    if (before !== undefined)
      issues.push({
        id: `again ${handleOf(n)}`,
        ...at,
        question: `"${n.item.number}" again (also on page ${before.item.page}): a mistake, or meant?`,
      });
    else if (previous !== undefined && !isAfter(n.digits, previous.digits))
      issues.push({
        id: `order ${handleOf(n)}`,
        ...at,
        question: `"${n.item.number}" comes after "${previous.item.number}" (page ${previous.item.page}): out of order, or meant?`,
      });
    seen.set(n.key, n);
    last.set(series, n);
  }
  return issues;
}

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

/** How a tool's change is asked about. Its answers stay as the record once the change is taken in. */
const CHANGED = "changed ";

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

/** A word issue's id: `word अपररूप`. */
const WORD = "word ";

/** Each issue given its answer from its page file, if any. An answer to no issue can't be meant: a problem. */
export function answer(
  issues: Issue[],
  pages: ReadonlyMap<number, Readonly<Record<string, string>>>,
): string[] {
  for (const issue of issues) {
    const given = pages.get(issue.page)?.[issue.id];
    const canBeAnswered = issue.id !== NOT_PROOFREAD && !issue.id.startsWith(NO_CAUSE);
    if (given !== undefined && canBeAnswered) issue.answer = given;
  }
  const problems: string[] = [];
  // A word answered as real is knowledge (the repair learns it, hindi/list.ts), kept when its
  // issue is gone because the repair now reads the word itself.
  for (const [n, answers] of pages)
    for (const id of Object.keys(answers))
      if (
        !id.startsWith(CHANGED) &&
        !id.startsWith(WORD) &&
        !issues.some((i) => i.page === n && i.id === id)
      )
        problems.push(
          `${SourceFile.Pages}/${pageFileName(n)}: an answer to "${id}", which isn't an issue`,
        );
  return problems;
}

/** `1, 2, 4-20`. */
function spans(ns: readonly number[]): string {
  const out: string[] = [];
  for (let i = 0; i < ns.length; ) {
    let j = i;
    while (j + 1 < ns.length && ns[j + 1] === (ns[j] as number) + 1) j += 1;
    out.push(i === j ? `${ns[i]}` : `${ns[i]}-${ns[j]}`);
    i = j + 1;
  }
  return out.join(", ");
}

/** An issue as a line: where, its id, its question, and its answer if any. */
export const issueLine = (i: Issue): string =>
  `${pageFileName(i.page)} "${i.id}": ${i.question}${i.answer === undefined ? "" : ` (answered: ${i.answer})`}`;

/** The ids boards.md cites: a list item's bold id, and each line's last bracketed group. */
export function citedIn(markdown: string): Set<string> {
  const out = new Set<string>();
  for (const line of markdown.split("\n")) {
    const bold = /^\s*-\s+\*\*([\d.]+)\*\*/.exec(line)?.[1];
    if (bold !== undefined) out.add(bold);
    const last = [...line.matchAll(/\(([^()]*)\)/g)].at(-1)?.[1];
    for (const x of (last ?? "").split(/[,;]/).map((s) => s.trim()))
      if (/^\d+(\.\d+)*$/.test(x)) out.add(x);
  }
  return out;
}

/**
 * Whether an id still names the block it named: the same kind, and at least half its words. A
 * reading fixed keeps the block; a block moved into the id doesn't.
 */
export function isSameBlock(was: Item, now: Item | undefined): boolean {
  if (now === undefined || was.kind !== now.kind) return false;
  const words = (t: string) =>
    new Set(
      t
        .split(/\s+/)
        .map(lettersOnly)
        .filter((w) => w !== ""),
    );
  const a = words(was.text);
  const b = words(now.text);
  const shared = [...a].filter((w) => b.has(w)).length;
  return Math.max(a.size, b.size) === 0 || shared / Math.max(a.size, b.size) >= 0.5;
}

/** The cited ids (in the chapter's boards.md) that the build would move: each a problem. */
export function citedChanges(x: Extract, was: readonly Item[], now: readonly Item[]): string[] {
  if (x.lang !== Locale.En) return [];
  const boards = join(x.dir, "..", "..", "..", "boards.md");
  if (!existsSync(boards)) return [];
  const byId = new Map(now.map((i) => [i.id, i]));
  const cited = citedIn(readFileSync(boards, "utf8"));
  return was
    .filter((i) => cited.has(i.id) && !isSameBlock(i, byId.get(i.id)))
    .map(
      (i) =>
        `${i.id} is cited in boards.md and would change: it was "${i.text.slice(0, 50)}", the page files build "${byId.get(i.id)?.text.slice(0, 50) ?? "(nothing)"}"`,
    );
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
