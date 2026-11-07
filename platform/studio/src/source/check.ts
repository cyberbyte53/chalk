import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { Locale } from "@chalk/content";
import { PNG } from "pngjs";
import { type Block, type BuiltPage, NO_CAUSE, type PageTools, buildPage } from "./build";
import { type Built, JoinSide, asciiDigits, buildChapter, digitsOf } from "./chapter";
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
export const lettersOnly = (s: string) =>
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

export const CHANGED = "changed ";

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
export function spans(ns: readonly number[]): string {
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
