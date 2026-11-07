import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { Locale } from "@chalk/content";
import { parse as parseYaml } from "yaml";
import type { z } from "zod";
import {
  checkFigures,
  checkIds,
  checkMatch,
  checkNumbers,
  checkReading,
  checkTerms,
} from "./checks";
import { lettersOnly } from "./letters";
import {
  type Book,
  type Item,
  SourceFile,
  type Term,
  bookSchema,
  itemsSchema,
  termsSchema,
} from "./schema";
import { type PageText, TEXT_LAYER, pageText } from "./text-layer";

/** One language's extract of a chapter's book: its folder and what it holds. */
export type Extract = {
  /** `authoring/books/<book>/<chapter>/source/<lang>`, from the repo's root. */
  rel: string;
  dir: string;
  lang: Locale;
};

export const sha256 = (bytes: Buffer): string => createHash("sha256").update(bytes).digest("hex");

/** Every extract in the repo: each `source/<lang>/` with a book.yaml. */
export function extractsIn(root: string): Extract[] {
  const books = join(root, "authoring", "books");
  if (!existsSync(books)) return [];
  const dirs = (d: string) =>
    existsSync(d)
      ? readdirSync(d, { withFileTypes: true })
          .filter((x) => x.isDirectory())
          .map((x) => x.name)
      : [];
  const langs: readonly string[] = Object.values(Locale);
  return dirs(books).flatMap((book) =>
    dirs(join(books, book)).flatMap((chapter) =>
      dirs(join(books, book, chapter, "source"))
        .filter((lang) => langs.includes(lang))
        .map((lang) => join(books, book, chapter, "source", lang))
        .filter((dir) => existsSync(join(dir, SourceFile.Book)))
        .map((dir) => ({ dir, rel: relative(root, dir), lang: dir.split("/").at(-1) as Locale })),
    ),
  );
}

/** A YAML file read against its schema; the problem with it, if any. */
export function readYaml<T>(file: string, schema: z.ZodType<T>): { value?: T; problem?: string } {
  if (!existsSync(file)) return {};
  let raw: unknown;
  try {
    raw = parseYaml(readFileSync(file, "utf8"));
  } catch (error) {
    return { problem: `${file}: ${error instanceof Error ? error.message : String(error)}` };
  }
  const parsed = schema.safeParse(raw);
  return parsed.success
    ? { value: parsed.data }
    : {
        problem: `${file}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
      };
}

/** What a check of an extract found: its problems, and what it holds. */
export type ExtractReport = {
  problems: string[];
  book?: Book;
  items: Item[];
  terms: Term[];
  pages: PageText[];
};

/** Every check on one language's extract (checks.ts), the book's PDF read for its text layer. */
export function checkExtract(x: Extract): ExtractReport {
  const problems: string[] = [];
  const book = readYaml(join(x.dir, SourceFile.Book), bookSchema);
  const items = readYaml(join(x.dir, SourceFile.Items), itemsSchema);
  const terms = readYaml(join(x.dir, SourceFile.Terms), termsSchema);
  for (const r of [book, items, terms]) if (r.problem !== undefined) problems.push(r.problem);
  const report: ExtractReport = {
    problems,
    ...(book.value === undefined ? {} : { book: book.value }),
    items: items.value ?? [],
    terms: terms.value ?? [],
    pages: [],
  };
  const pdf = join(x.dir, SourceFile.Pdf);
  if (book.value === undefined || !existsSync(pdf)) {
    if (!existsSync(pdf)) problems.push(`no ${SourceFile.Pdf}`);
    return report;
  }
  if (sha256(readFileSync(pdf)) !== book.value.sha256)
    problems.push(`${SourceFile.Pdf} isn't the book book.yaml records (its sha256 differs)`);
  if (items.value === undefined) {
    if (items.problem === undefined) problems.push(`no ${SourceFile.Items} yet`);
    return report;
  }
  report.pages = TEXT_LAYER[x.lang](pdf);
  if (report.pages.length !== book.value.pages)
    problems.push(`book.yaml says ${book.value.pages} pages; the PDF has ${report.pages.length}`);
  const first = report.pages[0];
  if (first !== undefined && !lettersOnly(pageText(first)).includes(lettersOnly(book.value.title)))
    problems.push(`book.yaml's title "${book.value.title}" isn't on page 1`);
  if (terms.value === undefined && terms.problem === undefined)
    problems.push(`no ${SourceFile.Terms} yet`);
  const list = items.value;
  problems.push(
    ...checkIds(list),
    ...checkReading(list, report.pages),
    ...checkNumbers(x.lang, list, report.pages),
    ...checkTerms(terms.value ?? [], list),
    ...checkFigures(list, (id) => existsSync(join(x.dir, SourceFile.Figures, `${id}.png`))),
  );
  // Another language: matched to the English book by its numbers.
  if (x.lang !== Locale.En) {
    const english = readYaml(join(x.dir, "..", Locale.En, SourceFile.Items), itemsSchema);
    if (english.value === undefined) problems.push("no English items.yaml to match against");
    else problems.push(...checkMatch(x.lang, list, english.value, book.value.unmatched ?? {}));
  }
  return report;
}
