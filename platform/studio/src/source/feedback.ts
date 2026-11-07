import { join } from "node:path";
import type { BuiltPage } from "./build";
import { buildExtract } from "./check";
import { draftPages, readStyles } from "./draft";
import { extractsIn } from "./files";
import { cachedObjects } from "./objects";
import { expand } from "./ranges";
import { type PageFile, SourceFile, Tool } from "./schema";
import { TOOL_VERSIONS } from "./tools";

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

/** How a decided block differs from the draft's: worked out from their words, never recorded by hand. */
export const StructureEdit = {
  Kind: "kind",
  Merge: "merge",
  Split: "split",
  Moved: "moved-words",
  Added: "added",
} as const;
export type StructureEdit = (typeof StructureEdit)[keyof typeof StructureEdit];

export type StructureRow = {
  edit: StructureEdit;
  range: string;
  suggested: string;
  decided: string;
};

/**
 * Where the agent's blocks differ from the structure draft. A block with the draft's words and kind
 * isn't an edit; one with its words and another kind is a kind edit; one made of whole draft blocks is
 * a merge; a part of one draft block, a split; any other overlap, words moved; no overlap, an addition.
 */
export function structureEdits(
  draft: PageFile,
  page: Pick<BuiltPage, "blocks" | "words">,
): StructureRow[] {
  const known = page.words.words;
  const drafted = draft.blocks.map((b) => ({ kind: b.kind, ids: new Set(expand(b.words, known)) }));
  return page.blocks.flatMap((d): StructureRow[] => {
    const ids = new Set(d.ids);
    const range = `${d.ids[0] ?? ""}…${d.ids.at(-1) ?? ""}`;
    const row = (edit: StructureEdit, suggested: string): StructureRow[] => [
      { edit, range, suggested, decided: `${d.kind} (${ids.size} words)` },
    ];
    const near = drafted.filter((b) => [...b.ids].some((id) => ids.has(id)));
    const inside = (a: Set<string>, b: Set<string>) => [...a].every((id) => b.has(id));
    const named = near.map((b) => `${b.kind} (${b.ids.size} words)`).join(" + ");
    const only = near[0];
    if (only === undefined) return row(StructureEdit.Added, "");
    if (near.length === 1 && only.ids.size === ids.size && inside(ids, only.ids))
      return only.kind === d.kind ? [] : row(StructureEdit.Kind, named);
    if (near.length === 1 && inside(ids, only.ids)) return row(StructureEdit.Split, named);
    if (near.length > 1 && near.every((b) => inside(b.ids, ids))) {
      const covered = near.reduce((n, b) => n + b.ids.size, 0);
      if (covered === ids.size) return row(StructureEdit.Merge, named);
    }
    return row(StructureEdit.Moved, named);
  });
}

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
    // The structure draft, made again from the PDF, against what was decided.
    const pdf = join(x.dir, SourceFile.Pdf);
    const cache = join(root, ".chalk-source-pages", ...where.split("/"), x.lang);
    const drafts = new Map(
      draftPages(
        b.built.pages.map((p) => p.words),
        cachedObjects(pdf, cache),
        readStyles(pdf),
      ).map((d) => [d.page, d]),
    );
    for (const p of b.built.pages) {
      const draft = drafts.get(p.page);
      if (draft === undefined || p.file.proofread !== true) continue;
      for (const e of structureEdits(draft, p))
        rows.push(
          [
            where,
            x.lang,
            Tool.StructureDraft,
            TOOL_VERSIONS[Tool.StructureDraft],
            p.page,
            e.range,
            e.edit,
            e.suggested,
            e.decided,
            p.file.cause ?? "",
            p.file.cause === undefined ? "" : (p.file.notes?.[p.file.cause] ?? ""),
          ].join("\t"),
        );
    }
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
