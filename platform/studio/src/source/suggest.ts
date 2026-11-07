import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { sha256 } from "./files";
import { Left } from "./hindi/repair";
import { pageSpans } from "./hindi/spans";
import { type PageObjects, readObjects, withoutRepeats } from "./objects";
import type { NumberedPage } from "./read";
import { Tool } from "./schema";
import type { Table } from "./snap";
import { TOOL_VERSIONS } from "./tools";

/**
 * What the tools suggest on a page, for every language (platform/docs/plans/sources.md, "Tools
 * suggest, the agent decides"). Made again at every build, never stored: the agent's page file holds
 * only where it differs. Every suggestion counts the same; the one thing set apart is a fact, where a
 * tool made none, with its why.
 */

const STUDIO = join(import.meta.dirname, "../..");
const TSX = join(STUDIO, "node_modules/.bin/tsx");
const TSCONFIG = join(STUDIO, "../../tsconfig.base.json");

/** A Hindi span's suggestion: a reading, or (`left`) why the tool made none. */
export type WordSuggestion = {
  /** Its words' ids (`L12.3`), and the range they make. */
  ids: string[];
  range: string;
  /** The PDF's words. */
  pdf: string[];
  by: typeof Tool.HindiRepair;
} & ({ reading: string; left?: undefined } | { left: string; reading?: undefined });

const DEVANAGARI = /[ऀ-ॿ]/u;
export const hasHindi = (text: string): boolean => DEVANAGARI.test(text);

/** Word ids in a row as their range: `L5.2`, `L5.2-4`, `L5.2-L6.3`. */
export function rangeOf(ids: readonly string[]): string {
  const [first, last] = [ids[0] ?? "", ids.at(-1) ?? ""];
  if (first === last) return first;
  const [l1] = first.split(".");
  const [l2, w2] = last.split(".");
  return l1 === l2 ? `${first}-${w2}` : `${first}-${last}`;
}

/**
 * A page's Hindi suggestions: `pageSpans` on the words, a span that has Hindi and that the repair
 * changes (its reading), or leaves (its why). What the PDF gives as it is suggests nothing.
 */
export function wordSuggestions(page: NumberedPage): WordSuggestion[] {
  return pageSpans(page).flatMap((span): WordSuggestion[] => {
    if (!span.pdf.some((p) => hasHindi(p))) return [];
    const common = { ids: span.ids, range: rangeOf(span.ids), pdf: span.pdf, by: Tool.HindiRepair };
    const r = span.repair;
    if ("reading" in r)
      return r.reading === span.pdf.join(" ") ? [] : [{ ...common, reading: r.reading }];
    if (r.left === Left.Several)
      return [{ ...common, left: `several real readings: ${r.readings.join(", ")}` }];
    return [
      {
        ...common,
        left:
          r.nearest === undefined
            ? "no well-formed reading of its letters: lost, or not Unicode"
            : `no reading is all real words; nearest ${r.nearest}, which the list lacks ${r.unknown.join(", ")}`,
      },
    ];
  });
}

/** A words file's closing part: every suggestion the same, and where a tool made none. */
export function suggestionLines(list: readonly WordSuggestion[]): string {
  const made = list.flatMap((s) =>
    s.reading === undefined ? [] : [`${s.range} ${s.pdf.join(" ")} → ${s.reading}`],
  );
  const left = list.flatMap((s) =>
    s.left === undefined ? [] : [`${s.range} ${s.pdf.join(" ")}: ${s.left}`],
  );
  const part = (title: string, lines: readonly string[]) =>
    lines.length === 0 ? "" : `# ${title}\n${lines.join("\n")}\n`;
  return (
    part(`${Tool.HindiRepair} suggests (proofread each against the image):`, made) +
    part(`${Tool.HindiRepair} made no suggestion (read each from the image):`, left)
  );
}

/** A table's rows as text: a merged cell at its first place, empty in the others. */
export function rowsOf(table: Table): string[][] {
  const rows = Array.from({ length: table.rows }, () =>
    Array.from({ length: table.columns }, () => ""),
  );
  for (const c of table.cells) {
    const row = rows[c.row];
    if (row !== undefined) row[c.column] = c.text;
  }
  return rows;
}

const OBJECTS_FILE = "objects.json";
const objectsKey = (pdf: string) =>
  `${sha256(readFileSync(pdf))} ${TOOL_VERSIONS[Tool.FigureSnap]}`;

/** Reads a PDF's objects (what repeats across its pages left out) into its pages' cache. */
export async function writeObjects(pdf: string, cache: string): Promise<void> {
  const pages = withoutRepeats(await readObjects(pdf));
  mkdirSync(cache, { recursive: true });
  writeFileSync(join(cache, OBJECTS_FILE), JSON.stringify({ key: objectsKey(pdf), pages }));
}

/**
 * A PDF's drawn objects, read once per PDF and kept in the pages' cache: pdf.js takes seconds, and
 * only asynchronously, while the checks that build an extract run in step. So a PDF not read yet is
 * read by a short process of its own, waited for.
 */
export function cachedObjects(pdf: string, cache: string): PageObjects[] {
  const file = join(cache, OBJECTS_FILE);
  const kept = () =>
    existsSync(file)
      ? (JSON.parse(readFileSync(file, "utf8")) as { key: string; pages: PageObjects[] })
      : undefined;
  const key = objectsKey(pdf);
  const have = kept();
  if (have?.key === key) return have.pages;
  execFileSync(
    TSX,
    ["--tsconfig", TSCONFIG, join(import.meta.dirname, "objects-cli.ts"), pdf, cache],
    { stdio: ["ignore", "ignore", "inherit"] },
  );
  const read = kept();
  if (read?.key !== key) throw new Error(`${pdf}: its drawn objects weren't read`);
  return read.pages;
}
