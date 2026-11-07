import { existsSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { Locale } from "@chalk/content";
import { stringify } from "yaml";
import { numbered } from "./check";
import { chapterSource, extractsIn, readYaml } from "./files";
import {
  type Item,
  MATCH_FILE,
  type MatchFile,
  SourceFile,
  itemsSchema,
  matchSchema,
} from "./schema";

/**
 * Matching a chapter's two books, its own step once both are extracted
 * (platform/docs/plans/sources.md, "The stages": Match): numbered things paired by kind and digits, a
 * question by its number and which exercise it is in, counted in order. What one book has and the
 * other doesn't is an issue, answered with why in `source/match.yaml`. Extracting a book never looks
 * at the other language's.
 */

/** A difference between the books: its id (`only en figure 3.6`), its question. */
export type MatchIssue = { id: string; question: string; answer?: string };

/** The pairs of two books' items, and what only one has. */
export function matchItems(
  en: readonly Item[],
  hi: readonly Item[],
): { pairs: MatchFile["pairs"]; issues: MatchIssue[] } {
  const hindi = new Map(numbered(hi).map((n) => [n.key, n.item]));
  const english = new Map(numbered(en).map((n) => [n.key, n.item]));
  const pairs: MatchFile["pairs"] = [];
  const issues: MatchIssue[] = [];
  for (const [key, item] of english) {
    const other = hindi.get(key);
    if (other === undefined)
      issues.push({
        id: `only en ${key}`,
        question: `the English book has ${key} (page ${item.page}, "${item.text.slice(0, 40)}") and the Hindi one doesn't: missed, or not in that book?`,
      });
    else pairs.push({ key, en: item.id, hi: other.id });
  }
  for (const [key, item] of hindi)
    if (!english.has(key))
      issues.push({
        id: `only hi ${key}`,
        question: `the Hindi book has ${key} (page ${item.page}, "${item.text.slice(0, 40)}") and the English one doesn't: a mistake, or only in that book?`,
      });
  return { pairs, issues };
}

/** The issues given their answers; an answer to no issue can't be meant: each a problem. */
function answered(issues: MatchIssue[], answers: Readonly<Record<string, string>>): string[] {
  for (const i of issues) {
    const given = answers[i.id];
    if (given !== undefined) i.answer = given;
  }
  return Object.keys(answers)
    .filter((id) => !issues.some((i) => i.id === id))
    .map((id) => `${MATCH_FILE} answers "${id}", which isn't an issue`);
}

const line = (i: MatchIssue) =>
  `"${i.id}": ${i.question}${i.answer === undefined ? "" : ` (answered: ${i.answer})`}`;

/** Both books' items; the problem if either isn't there yet. */
function bothBooks(source: string): { en?: Item[]; hi?: Item[]; problems: string[] } {
  const problems: string[] = [];
  const read = (lang: Locale) => {
    const r = readYaml(join(source, lang, SourceFile.Items), itemsSchema);
    if (r.problem !== undefined) problems.push(r.problem);
    else if (r.value === undefined)
      problems.push(`no ${lang}/${SourceFile.Items}: extract it first`);
    return r.value;
  };
  const en = read(Locale.En);
  const hi = read(Locale.Hi);
  return { ...(en === undefined ? {} : { en }), ...(hi === undefined ? {} : { hi }), problems };
}

/** `pnpm source match <book>/<chapter>`: match.yaml written (its answers kept), and its issues. */
export function matchChapter(
  root: string,
  book: string,
  chapter: string,
): { lines: string[]; problems: string[] } {
  const source = chapterSource(root, book, chapter);
  const { en, hi, problems } = bothBooks(source);
  if (en === undefined || hi === undefined) return { lines: [], problems };
  const file = join(source, MATCH_FILE);
  const was = readYaml(file, matchSchema);
  if (was.problem !== undefined) return { lines: [], problems: [was.problem] };
  const { pairs, issues } = matchItems(en, hi);
  const answers = was.value?.answers;
  writeFileSync(file, stringify({ pairs, ...(answers === undefined ? {} : { answers }) }));
  problems.push(...answered(issues, answers ?? {}));
  const open = issues.filter((i) => i.answer === undefined);
  const done = issues.filter((i) => i.answer !== undefined);
  return {
    lines: [
      `${relative(root, file)}: ${pairs.length} pairs, ${issues.length} that one book has and the other doesn't`,
      ...(done.length > 0
        ? ["answered (read each answer):", ...done.map((i) => `  ${line(i)}`)]
        : []),
      ...(open.length > 0 ? [`issues (answer each in ${MATCH_FILE}'s answers, with why):`] : []),
    ],
    problems: [...problems, ...open.map(line)],
  };
}

/** What a check of a chapter's match found. */
export type MatchReport = { rel: string; pairs: number; answered: number; problems: string[] };

/** Every match.yaml in the repo checked: its pairs are what the items build, every issue answered. */
export function checkMatches(root: string): MatchReport[] {
  const sources = new Set(extractsIn(root).map((x) => dirname(x.dir)));
  return [...sources]
    .filter((source) => existsSync(join(source, MATCH_FILE)))
    .map((source) => {
      const rel = relative(root, join(source, MATCH_FILE));
      const parsed = readYaml(join(source, MATCH_FILE), matchSchema);
      const { en, hi, problems } = bothBooks(source);
      if (parsed.problem !== undefined) problems.push(parsed.problem);
      if (en === undefined || hi === undefined || parsed.value === undefined)
        return { rel, pairs: 0, answered: 0, problems };
      const { pairs, issues } = matchItems(en, hi);
      problems.push(...answered(issues, parsed.value.answers ?? {}));
      if (!isDeepStrictEqual(pairs, parsed.value.pairs))
        problems.push("its pairs aren't what the items build: run pnpm source match");
      problems.push(...issues.filter((i) => i.answer === undefined).map(line));
      return {
        rel,
        pairs: pairs.length,
        answered: issues.filter((i) => i.answer !== undefined).length,
        problems,
      };
    });
}
