import { buildExtract } from "./check";
import { extractsIn } from "./files";

/**
 * `pnpm source feedback [<book>/<chapter>]` (platform/docs/plans/sources.md, "Every override is
 * feedback"): every place the agent replaced a tool's work, across chapters, with its cause. A later
 * agent reads it to find where a tool keeps falling short; a fix is measured by the overrides it makes
 * unnecessary. Filling a gap a tool left isn't an override: the tool's own why is the record.
 */

/** What `feedback` prints of each override. */
const COLUMNS = [
  "chapter",
  "lang",
  "tool",
  "version",
  "page",
  "range",
  "edit",
  "suggested",
  "decided",
  "cause",
  "note",
];

/** Every override in the repo, or in one chapter: a line each, tab-separated, under its columns. */
export function feedback(root: string, chapter?: string): { lines: string[]; problems: string[] } {
  const rows: string[] = [];
  const notes: string[] = [];
  const extracts = extractsIn(root).filter((x) => {
    const where = x.rel.split("/").slice(2, 4).join("/");
    return chapter === undefined || where === chapter;
  });
  for (const x of extracts) {
    const where = x.rel.split("/").slice(2, 4).join("/");
    const b = buildExtract(x);
    if (b.built === undefined) {
      notes.push(`${x.rel}: ${b.notes.join("; ") || b.problems.join("; ")}`);
      continue;
    }
    for (const p of b.built.pages)
      for (const o of p.overrides)
        rows.push(
          [
            where,
            x.lang,
            o.tool,
            o.version,
            o.page,
            o.range,
            o.edit,
            o.suggested,
            o.decided,
            o.cause ?? "",
            o.cause === undefined ? "" : (p.file.notes?.[o.cause] ?? ""),
          ].join("\t"),
        );
  }
  return {
    lines: [
      COLUMNS.join("\t"),
      ...rows,
      `${rows.length} override${rows.length === 1 ? "" : "s"} in ${extracts.length} extract${extracts.length === 1 ? "" : "s"}`,
      ...notes.map((n) => `not counted: ${n}`),
    ],
    problems: [],
  };
}
