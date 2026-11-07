import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Locale } from "@chalk/content";
import { type Extract, readYaml, sha256 } from "../files";
import { type PageText, pageText, readPages } from "../read";
import {
  type Book,
  type Item,
  SourceFile,
  type Term,
  bookSchema,
  itemsSchema,
  termsSchema,
} from "../schema";
import {
  checkFigures,
  checkIds,
  checkMatch,
  checkNumbers,
  checkReading,
  checkTerms,
} from "./checks";
import { lettersOnly } from "./letters";

/** Stage 4, checking (platform/docs/plans/sources.md): one language's extract against its book. */

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
  report.pages = readPages(pdf, book.value.reader);
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
