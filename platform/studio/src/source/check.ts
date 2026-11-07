import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { Locale } from "@chalk/content";
import {
  type Block,
  type Built,
  type BuiltPage,
  JoinSide,
  asciiDigits,
  buildChapter,
  buildPage,
  digitsOf,
} from "./build";
import { type Extract, readYaml, sha256 } from "./files";
import { numberPage, readPages } from "./read";
import {
  type Book,
  CROPPED,
  type Item,
  ItemKind,
  type PageFile,
  SourceFile,
  type Term,
  bookSchema,
  itemsSchema,
  pageFileName,
  pageFileSchema,
  termsSchema,
} from "./schema";

/**
 * The checks on one language's extract (platform/docs/plans/sources.md, "Checks"). Each raises
 * issues: an id, its page and a question (a mistake, or meant?). The agent fixes its page file or
 * answers the issue there with why (a match issue: in book.yaml's `unmatched`); an answered issue
 * passes and stays listed. Only what can't be meant is a problem outright: a file that doesn't
 * parse, a range not on the page, an answer to no issue.
 */

/** Something to fix or answer: its id (`read L36.6`), its page (none: book.yaml's), its question. */
export type Issue = { id: string; page?: number; question: string; answer?: string };

/** Devanagari's signs and marks: vowel signs, ं, ँ, ः, ्, nukta. */
const MARK = /[\u0900-\u0903\u093A-\u094F\u0951-\u0957\u0962\u0963]/u;
/** The letters a span must keep: its base letters in order, and the set of its marks. */
export function lettersOf(s: string): { base: string; marks: string } {
  const t = s
    .normalize("NFKC")
    .replace(/\s|\u200C|\u200D|\uFFFD/g, "")
    .replace(/ॠ/g, "ऋ")
    .replace(/\u093E\u0945/g, "\u0949")
    .replace(/[\u2212\u2013-]/g, "-")
    .replace(/(.)\1+/gu, "$1");
  const chars = [...t];
  return {
    base: chars.filter((c) => !MARK.test(c)).join(""),
    marks: [...new Set(chars.filter((c) => MARK.test(c)))].sort().join(""),
  };
}

/** A reading that itself has a doubled sign (or U+FFFD): never what a page prints. */
const isDoubled = (s: string) => /््|([ा-ौँ-ः])\1|\uFFFD/.test(s);

/**
 * Whether a reading holds to the PDF's letters: the same consonants and full vowels in order and
 * the same marks as a set, after taking out spaces, joiners and U+FFFD, collapsing doubles, and
 * reading ॠ as ऋ; the question if it doesn't.
 */
export function readingQuestion(pdf: string, reading: string): string | undefined {
  if (isDoubled(reading)) return `"${reading}" has a doubled sign: a mistake, or meant?`;
  const a = lettersOf(pdf);
  const r = lettersOf(reading);
  return a.base === r.base && a.marks === r.marks
    ? undefined
    : `"${reading}" hasn't the PDF's letters ("${pdf}"): a misreading, or is the PDF missing them?`;
}

/** Text compared by letters, marks and digits only. */
const lettersOnly = (s: string) =>
  asciiDigits(s.normalize("NFKC"))
    .replace(/[^\p{L}\p{M}\p{N}]/gu, "")
    .toLowerCase();

/** A page's own issues: every word in one place, readings, numbers in their words, boxes, terms. */
export function pageIssues(p: BuiltPage): Issue[] {
  const issues: Issue[] = [];
  const raise = (id: string, question: string) => issues.push({ id, page: p.page, question });
  for (const [id, w] of p.words.words) {
    const who = p.holders.get(id) ?? [];
    if (who.length === 0)
      raise(`unused ${id}`, `"${w.text}" is in no block and not furniture: missed, or meant?`);
    else if (who.length > 1)
      raise(`twice ${id}`, `"${w.text}" is in ${who.join(" and ")}: a mistake, or meant?`);
  }
  for (const b of p.blocks) {
    for (const r of b.readings) {
      const q = readingQuestion(r.pdf, r.text);
      if (q !== undefined) raise(`read ${r.span}`, q);
    }
    if (
      b.number !== undefined &&
      !b.continued &&
      !lettersOnly(b.text).includes(lettersOnly(b.number))
    )
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

/** A numbered block's key: its kind and digits (`figure 7.4`), a question's within its exercise. */
export type Numbered = { key: string; kind: ItemKind; digits: number[]; head: Block; item: Item };

/** The chapter's numbered items, keyed (a question by its number and which exercise it is in, counted in order). */
export function numbered(built: Built): Numbered[] {
  let exercises = 0;
  return built.items.flatMap((item, i) => {
    if (item.kind === ItemKind.Exercise) exercises += 1;
    const digits = item.number === undefined ? undefined : digitsOf(item.number);
    if (digits === undefined) return [];
    const key =
      item.kind === ItemKind.Question
        ? `question ${digits} of exercise ${exercises}`
        : `${item.kind} ${digits}`;
    const head = built.parts[i]?.[0] as Block;
    return [{ key, kind: item.kind, digits: digits.split(".").map(Number), head, item }];
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

/** The chapter's issues: pages that don't join, numbers of a kind out of order or twice. */
export function chapterIssues(built: Built): Issue[] {
  const issues: Issue[] = [];
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
  for (const n of numbered(built)) {
    const at = { page: n.head.page };
    const before = seen.get(n.key);
    // Questions are in order within their exercise; other kinds through the chapter.
    const series =
      n.kind === ItemKind.Question ? n.key.replace(/^question \S+/, "question") : n.kind;
    const previous = last.get(series);
    if (before !== undefined)
      issues.push({
        id: `again ${n.head.handle}`,
        ...at,
        question: `"${n.item.number}" again (also on page ${before.head.page}): a mistake, or meant?`,
      });
    else if (previous !== undefined && !isAfter(n.digits, previous.digits))
      issues.push({
        id: `order ${n.head.handle}`,
        ...at,
        question: `"${n.item.number}" comes after "${previous.item.number}" (page ${previous.head.page}): out of order, or meant?`,
      });
    seen.set(n.key, n);
    last.set(series, n);
  }
  return issues;
}

/**
 * Another language matched to the English book, by kind and digits: what one has and the other
 * doesn't, each an issue answered in book.yaml's `unmatched`.
 */
export function matchIssues(built: Built, english: readonly Item[]): Issue[] {
  const ours = new Map(numbered(built).map((n) => [n.key, n]));
  const theirs = new Map(
    numbered({
      items: [...english],
      parts: english.map(() => []),
      unpaired: [],
      terms: [],
      crops: [],
    }).map((n) => [n.key, n.item]),
  );
  const issues: Issue[] = [];
  for (const [key, item] of theirs)
    if (!ours.has(key))
      issues.push({
        id: `match ${key}`,
        question: `the English book has ${key} ("${item.text.slice(0, 40)}") and this one doesn't: missed, or not in this book?`,
      });
  for (const [key, n] of ours)
    if (!theirs.has(key))
      issues.push({
        id: `match ${key}`,
        question: `this book has ${key} (page ${n.head.page}) and the English one doesn't: a mistake, or only in this book?`,
      });
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

/** Builds an extract and raises its issues; the files on disk are not compared (checkExtract does). */
export function buildExtract(x: Extract): ExtractBuild {
  const problems: string[] = [];
  const notes: string[] = [];
  const pagesDir = join(x.dir, SourceFile.Pages);
  if (!existsSync(pagesDir)) {
    notes.push("not yet read by the new pipeline (no pages/): its items.yaml is as it was written");
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
  const words = readPages(pdf, book.value.reader).map(numberPage);
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
  const pages = [...files]
    .sort((a, b) => a[0] - b[0])
    .map(([n, file]) => buildPage(file, words[n - 1] as (typeof words)[number]));
  for (const p of pages)
    problems.push(...p.problems.map((x) => `${SourceFile.Pages}/${pageFileName(p.page)}: ${x}`));
  const built = buildChapter(x.lang, pages, words.length);

  // The issues, and their answers.
  const issues = [...pages.flatMap(pageIssues), ...chapterIssues(built)];
  if (x.lang !== Locale.En) {
    const english = readYaml(join(x.dir, "..", Locale.En, SourceFile.Items), itemsSchema);
    if (english.value === undefined) notes.push("not matched: no English items.yaml yet");
    else issues.push(...matchIssues(built, english.value));
  }
  problems.push(
    ...answer(
      issues,
      new Map([...files].map(([n, f]) => [n, f.answers ?? {}])),
      book.value.unmatched ?? {},
    ),
  );
  return { book: book.value, built, issues, problems, notes };
}

/**
 * Each issue given its answer, if any: a page's from its page file, a match's from book.yaml's
 * `unmatched`. An answer to no issue can't be meant: each is a problem.
 */
export function answer(
  issues: Issue[],
  pages: ReadonlyMap<number, Readonly<Record<string, string>>>,
  unmatched: Readonly<Record<string, string>>,
): string[] {
  for (const issue of issues) {
    const given = (issue.page === undefined ? unmatched : pages.get(issue.page))?.[issue.id];
    if (given !== undefined) issue.answer = given;
  }
  const problems: string[] = [];
  for (const [n, answers] of pages)
    for (const id of Object.keys(answers))
      if (!issues.some((i) => i.page === n && i.id === id))
        problems.push(
          `${SourceFile.Pages}/${pageFileName(n)}: an answer to "${id}", which isn't an issue`,
        );
  for (const id of Object.keys(unmatched))
    if (!issues.some((i) => i.page === undefined && i.id === id))
      problems.push(`book.yaml's unmatched answers "${id}", which isn't an issue`);
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
  `${i.page === undefined ? "book.yaml" : pageFileName(i.page)} "${i.id}": ${i.question}${i.answer === undefined ? "" : ` (answered: ${i.answer})`}`;

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
 * record). An unanswered issue is a problem. An extract without pages/ is not checked: a note.
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
  const rerun = `run pnpm source ${x.rel.split("/").slice(2, 4).join("/")} ${x.lang}`;
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
