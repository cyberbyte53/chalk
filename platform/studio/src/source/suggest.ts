import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { sha256 } from "./files";
import { Left } from "./hindi/repair";
import { hasHindi } from "./hindi/script";
import { pageSpans } from "./hindi/spans";
import { type PageObjects, readObjects, withoutRepeats } from "./objects";
import { rangeOf } from "./ranges";
import type { NumberedPage } from "./read";
import { Tool } from "./schema";
import { type TextPiece, scriptRuns } from "./scripts";
import type { Table } from "./snap";
import { TOOL_VERSIONS } from "./tools";

/**
 * What the tools suggest on a page, for every language (platform/docs/plans/sources.md, "Tools
 * suggest, the agent decides"). Made again at every build, never stored: the agent's page file holds
 * only where it differs. Every suggestion counts the same; the one thing set apart is a fact, where a
 * tool made none, with its why.
 */

/** A tool's suggestion for some words: a reading, or (`left`) why it made none. */
export type WordSuggestion = {
  /** Its words' ids (`L12.3`), and the range they make. */
  ids: string[];
  range: string;
  /** The PDF's words. */
  pdf: string[];
  by: typeof Tool.HindiRepair | typeof Tool.Scripts;
} & ({ reading: string; left?: undefined } | { left: string; reading?: undefined });

/**
 * A page's Hindi suggestions: `pageSpans` on the words, a span that has Hindi and that the repair
 * changes (its reading), or leaves (its why). What the PDF gives as it is suggests nothing.
 */
export function wordSuggestions(
  page: NumberedPage,
  texts: readonly TextPiece[] = [],
): WordSuggestion[] {
  const scripts = scriptRuns(page, texts).map(
    (r): WordSuggestion => ({
      ids: r.ids,
      range: rangeOf(r.ids),
      pdf: r.pdf,
      by: Tool.Scripts,
      reading: r.reading,
    }),
  );
  const taken = new Set(scripts.flatMap((s) => s.ids));
  const hindi = pageSpans(page).flatMap((span): WordSuggestion[] => {
    if (span.ids.some((id) => taken.has(id))) return [];
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
  return [...scripts, ...hindi];
}

/** A words file's closing part: every suggestion the same, and where a tool made none. */
export function suggestionLines(list: readonly WordSuggestion[]): string {
  const part = (title: string, lines: readonly string[]) =>
    lines.length === 0 ? "" : `# ${title}\n${lines.join("\n")}\n`;
  return [Tool.Scripts, Tool.HindiRepair]
    .map((tool) => {
      const mine = list.filter((s) => s.by === tool);
      const made = mine.flatMap((s) =>
        s.reading === undefined ? [] : [`${s.range} ${s.pdf.join(" ")} → ${s.reading}`],
      );
      const left = mine.flatMap((s) =>
        s.left === undefined ? [] : [`${s.range} ${s.pdf.join(" ")}: ${s.left}`],
      );
      return (
        part(`${tool} suggests (proofread each against the image):`, made) +
        part(`${tool} made no suggestion (read each from the image):`, left)
      );
    })
    .join("");
}
