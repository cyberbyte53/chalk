import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { type Built, buildChapter, buildPage } from "./build";
import { buildExtract, pageToolsOf } from "./check";
import { draftBook, readStyles } from "./draft";
import { CACHE, chapterOf, extractPaths, extractsIn, readYaml } from "./files";
import { cachedObjects } from "./objects";
import { type Item, SourceFile, itemsSchema } from "./schema";

/**
 * `pnpm source measure` (platform/docs/plans/tool-fixes.md, "How each fix is proved"): each proofread
 * book built twice, once from the tools alone (the structure draft and every suggestion, no agent
 * decision) and once as decided (its items.yaml), compared block by block. A decided block is
 * reproduced when the tools' block that starts at its first word has its kind and text exactly.
 * Every decided block is written a line each, so a later run diffed against it says which blocks a
 * fix made right and which it made wrong.
 */

/** One decided block against the tools alone. */
export type BlockRow = {
  /** `class10-science/acids-bases-and-salts/en`. */
  extract: string;
  id: string;
  page: number;
  kind: string;
  isRight: boolean;
  decided: string;
  /** The tools' block at its first word, as `kind: text`; empty when the tools have none there. */
  tools: string;
};

type Side = Pick<Built, "items" | "parts">;

/** Each decided item's row, against the tools' item that holds its first word. */
export function compareBlocks(extract: string, decided: Side, tools: Side): BlockRow[] {
  const holder = new Map<string, Item>();
  tools.parts.forEach((parts, i) => {
    for (const b of parts)
      for (const id of b.ids) holder.set(`${b.page}:${id}`, tools.items[i] as Item);
  });
  return decided.items.map((item, i) => {
    const head = decided.parts[i]?.[0];
    const first = head?.ids[0];
    // A block with no words (a figure only a box) is matched by its page, kind and text.
    const theirs =
      head !== undefined && first !== undefined
        ? holder.get(`${head.page}:${first}`)
        : tools.items.find(
            (t) => t.page === item.page && t.kind === item.kind && t.text === item.text,
          );
    return {
      extract,
      id: item.id,
      page: item.page,
      kind: item.kind,
      isRight: theirs !== undefined && theirs.kind === item.kind && theirs.text === item.text,
      decided: item.text,
      tools: theirs === undefined ? "" : `${theirs.kind}: ${theirs.text}`,
    };
  });
}

const COLUMNS = ["extract", "id", "page", "kind", "right", "decided", "tools"];
const cell = (s: string) => s.replace(/[\t\r\n]+/g, " ");

/** The rows as the file a later run is diffed against: tab-separated, under its columns. */
export function rowsFile(rows: readonly BlockRow[]): string {
  return `${[
    COLUMNS.join("\t"),
    ...rows.map((r) =>
      [
        r.extract,
        r.id,
        r.page,
        r.kind,
        r.isRight ? "yes" : "no",
        cell(r.decided),
        cell(r.tools),
      ].join("\t"),
    ),
  ].join("\n")}\n`;
}

/** A rows file read back. */
export function readRowsFile(text: string): BlockRow[] {
  return text
    .split("\n")
    .slice(1)
    .filter((l) => l !== "")
    .map((l) => {
      const [extract = "", id = "", page = "0", kind = "", right = "", decided = "", tools = ""] =
        l.split("\t");
      return { extract, id, page: Number(page), kind, isRight: right === "yes", decided, tools };
    });
}

/** What changed since an earlier run: the blocks now right, now wrong, and those either run lacks. */
export function diffRows(was: readonly BlockRow[], now: readonly BlockRow[]) {
  const key = (r: BlockRow) => `${r.extract} ${r.id}`;
  const before = new Map(was.map((r) => [key(r), r]));
  const after = new Map(now.map((r) => [key(r), r]));
  const nowRight: BlockRow[] = [];
  const nowWrong: BlockRow[] = [];
  const otherWrong: BlockRow[] = [];
  for (const r of now) {
    const b = before.get(key(r));
    if (b === undefined) continue;
    if (r.isRight && !b.isRight) nowRight.push(r);
    else if (!r.isRight && b.isRight) nowWrong.push(r);
    // Still wrong, but the tools now give something else.
    else if (!r.isRight && b.tools !== cell(r.tools)) otherWrong.push(r);
  }
  const gone = was.filter((r) => !after.has(key(r)));
  const added = now.filter((r) => !before.has(key(r)));
  return { nowRight, nowWrong, otherWrong, gone, added };
}

const percent = (n: number, of: number) => (of === 0 ? "-" : `${((100 * n) / of).toFixed(1)}%`);
const tallyLine = (what: string, rows: readonly BlockRow[]) => {
  const right = rows.filter((r) => r.isRight).length;
  return `${what}: ${right} of ${rows.length} blocks (${percent(right, rows.length)})`;
};

/** The default file a run's rows are written to (not in git). */
const MEASURE_FILE = join(CACHE, "measure.tsv");

export type MeasureRun = {
  root: string;
  /** `<book>/<chapter>`; absent, every proofread extract. */
  chapter?: string;
  /** Where the rows go, from the root. */
  save?: string;
  /** An earlier run's rows, from the root, to diff against. */
  against?: string;
};

/** Every proofread extract (or one chapter's) measured, its rows written, and the diff if asked. */
export function measure(run: MeasureRun): { lines: string[]; problems: string[] } {
  const lines: string[] = [];
  const problems: string[] = [];
  const rows: BlockRow[] = [];
  const extracts = extractsIn(run.root).filter(
    (x) => run.chapter === undefined || chapterOf(x) === run.chapter,
  );
  for (const x of extracts) {
    const name = `${chapterOf(x)}/${x.lang}`;
    const b = buildExtract(x);
    if (b.built === undefined) {
      lines.push(`not measured: ${name}: ${[...b.notes, ...b.problems].join("; ")}`);
      continue;
    }
    if (!b.built.pages.every((p) => p.file.proofread === true)) {
      lines.push(`not measured: ${name}: not every page is proofread`);
      continue;
    }
    const written = readYaml(join(x.dir, SourceFile.Items), itemsSchema).value;
    if (!isDeepStrictEqual(written, b.built.items))
      problems.push(
        `${name}: ${SourceFile.Items} isn't what its page files build, so it isn't the decision measured`,
      );
    const pdf = join(x.dir, SourceFile.Pdf);
    const { cache } = extractPaths(run.root, x.dir, x.lang);
    const words = b.built.pages.map((p) => p.words);
    const toolsOf = pageToolsOf(pdf, cache);
    const drafts = draftBook(pdf, cache, words);
    const toolPages = drafts.map((d, i) =>
      buildPage(d, words[i] as (typeof words)[number], toolsOf(d.page)),
    );
    const tools = buildChapter(x.lang, toolPages, words.length);
    const mine = compareBlocks(name, b.built, tools);
    rows.push(...mine);
    lines.push(tallyLine(name, mine));
  }
  const books = [...new Set(rows.map((r) => r.extract.split("/")[0] as string))];
  for (const book of books)
    lines.push(
      tallyLine(
        book,
        rows.filter((r) => r.extract.startsWith(`${book}/`)),
      ),
    );
  lines.push(tallyLine("all", rows));
  const save = join(run.root, run.save ?? MEASURE_FILE);
  mkdirSync(dirname(save), { recursive: true });
  writeFileSync(save, rowsFile(rows));
  lines.push(`each block in ${run.save ?? MEASURE_FILE}`);
  if (run.against !== undefined) {
    const file = join(run.root, run.against);
    if (!existsSync(file)) problems.push(`no ${run.against} to diff against`);
    else {
      const d = diffRows(readRowsFile(readFileSync(file, "utf8")), rows);
      const show = (r: BlockRow) =>
        `  ${r.extract} ${r.id} (page ${r.page}, ${r.kind}): ${r.tools.slice(0, 120)}`;
      lines.push(
        `against ${run.against}: ${d.nowRight.length} now right, ${d.nowWrong.length} now wrong`,
      );
      if (d.nowWrong.length > 0)
        lines.push("now wrong (look at each against its page image):", ...d.nowWrong.map(show));
      if (d.nowRight.length > 0) lines.push("now right:", ...d.nowRight.map(show));
      if (d.otherWrong.length > 0)
        lines.push("still wrong, the tools now give:", ...d.otherWrong.map(show));
      if (d.gone.length + d.added.length > 0)
        lines.push(
          `decided blocks not in both runs (a page file changed): ${d.gone.length} gone, ${d.added.length} new`,
        );
    }
  }
  return { lines, problems };
}
