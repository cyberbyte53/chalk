import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PNG } from "pngjs";
import { afterAll, describe, expect, it } from "vitest";
import { parse } from "yaml";
import { showsOn } from "./crop";
import { type PageObjects, area, intersect, readObjects, withoutRepeats } from "./objects";
import { expand } from "./ranges";
import {
  type NumberedPage,
  PAGE_SCALE,
  type Word,
  numberPage,
  readPages,
  readerFor,
  renderPages,
} from "./read";
import type { Box } from "./schema";
import { SnapIssue, type Table, snap, tableCells } from "./snap";

/**
 * The proof of objects.ts and snap.ts on two chapters' books, both languages, against boxes checked
 * by hand: the science chapter's page files (`box:`, drawn by eye, the final ones; three fixed by eye
 * in English: Figs 2.1, 2.4, 2.12) and the maths chapter's items (`crop:`). Each figure and table is
 * snapped from its hand box and from the hand box shrunk by a tenth on each side (a rough box that
 * cuts the figure off); every table's rows and columns are compared with what its page shows. The
 * numbers are printed.
 */

const root = join(import.meta.dirname, "../../../..");
const books = join(root, "authoring/books");

type Case = { page: number; kind: string; number?: string; hand: Box; words?: string };
type Extract = { dir: string; cases: Case[] };

/** The figures and tables of an extract: from its page files if it has them, else its items. */
function casesOf(dir: string): Case[] {
  const pages = join(dir, "pages");
  if (existsSync(pages))
    return readdirSync(pages)
      .filter((f) => f.endsWith(".yaml"))
      .sort()
      .flatMap((f) => {
        const pf = parse(readFileSync(join(pages, f), "utf8")) as {
          page: number;
          blocks: { kind: string; number?: string; box?: Box; words: string }[];
        };
        return pf.blocks.flatMap((b) =>
          b.box === undefined
            ? []
            : [{ page: pf.page, kind: b.kind, number: b.number, hand: b.box, words: b.words }],
        );
      });
  const items = parse(readFileSync(join(dir, "items.yaml"), "utf8")) as {
    page: number;
    kind: string;
    number?: string;
    crop?: Box;
  }[];
  return items.flatMap((i) =>
    i.crop === undefined ? [] : [{ page: i.page, kind: i.kind, number: i.number, hand: i.crop }],
  );
}

const EXTRACTS: Extract[] = [
  "class9-science/cell-the-building-block-of-life/source/en",
  "class9-science/cell-the-building-block-of-life/source/hi",
  "class9-maths/coordinate-geometry/source/en",
  "class9-maths/coordinate-geometry/source/hi",
]
  .map((d) => join(books, d))
  .filter((d) => existsSync(join(d, "book.pdf")))
  .map((dir) => ({ dir, cases: casesOf(dir) }));

/**
 * Each table's rows and columns and some of its cells, as its page shows them (looked at on the page
 * images): by extract and page, in the page's order.
 */
const TABLES: Record<string, { rows: number; columns: number; cells: Record<string, string> }[]> = {
  "cell-the-building-block-of-life/source/en p8": [
    {
      rows: 7,
      columns: 5,
      cells: {
        "0,2": "Bacterial cell",
        "4,1": "Well-defined nucleus (genetic material enclosed by a membrane)",
        "6,0": "6.",
      },
    },
    {
      rows: 6,
      columns: 3,
      cells: { "3,2": "Can be unicellular or multicellular", "2,1": "1 to 10 µm" },
    },
  ],
  "cell-the-building-block-of-life/source/en p18": [
    { rows: 5, columns: 3, cells: { "0,0": "Option", "4,2": "Endoplasmic reticulum" } },
  ],
  "cell-the-building-block-of-life/source/en p19": [
    {
      rows: 6,
      columns: 3,
      cells: { "0,0": "Structures in a cell", "5,0": "Chromoplasts", "5,2": "" },
    },
  ],
  "cell-the-building-block-of-life/source/hi p8": [
    { rows: 7, columns: 5, cells: {} },
    { rows: 6, columns: 3, cells: {} },
  ],
  "cell-the-building-block-of-life/source/hi p18": [{ rows: 5, columns: 3, cells: {} }],
  "cell-the-building-block-of-life/source/hi p19": [{ rows: 6, columns: 3, cells: {} }],
  "coordinate-geometry/source/en p13": [
    { rows: 2, columns: 6, cells: { "0,0": "x", "1,2": "–3.5", "1,5": "– 3" } },
  ],
  "coordinate-geometry/source/en p15": [
    { rows: 2, columns: 6, cells: { "1,0": "y", "1,3": "– 1.25", "0,5": "3" } },
  ],
  "coordinate-geometry/source/hi p16": [{ rows: 2, columns: 6, cells: {} }],
  "coordinate-geometry/source/hi p17": [{ rows: 2, columns: 6, cells: {} }],
};

const iou = (a: Box, b: Box) => {
  const i = area(intersect(a, b));
  return i / (area(a) + area(b) - i);
};
const shrink = (b: Box, f: number): Box => {
  const [w, h] = [b[2] - b[0], b[3] - b[1]];
  return [b[0] + w * f, b[1] + h * f, b[2] - w * f, b[3] - h * f];
};
const inside = (b: Box, w: Word) => {
  const [x, y] = [(w.x0 + w.x1) / 2, (w.y0 + w.y1) / 2];
  return x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3];
};
const short = (dir: string) => dir.split("/").slice(-3).join("/");

const work = mkdtempSync(join(tmpdir(), "chalk-snap-"));
afterAll(() => rmSync(work, { recursive: true, force: true }));

/** Below this overlap with the hand box a snapped box is wrong. */
const GOOD = 0.8;

describe.each(EXTRACTS)("$dir", ({ dir, cases }) => {
  const name = short(dir);
  let pages: NumberedPage[] = [];
  let objects: PageObjects[] = [];
  let images: string[] = [];
  const png = new Map<number, PNG>();
  const imageOf = (page: number) => {
    const have = png.get(page);
    if (have !== undefined) return have;
    const made = PNG.sync.read(readFileSync(images[page - 1] ?? ""));
    png.set(page, made);
    return made;
  };
  const wordsOf = (c: Case) => {
    const p = pages[c.page - 1];
    if (p === undefined) throw new Error(`no page ${c.page}`);
    return c.words === undefined
      ? [...p.words.values()]
      : expand(c.words, p.words).flatMap((id) => p.words.get(id) ?? []);
  };

  it("reads its pages' objects", { timeout: 300_000 }, async () => {
    const pdf = join(dir, "book.pdf");
    pages = readPages(pdf, readerFor(pdf)).map(numberPage);
    const all = await readObjects(pdf);
    objects = withoutRepeats(all);
    images = renderPages(pdf, join(work, name.replaceAll("/", "-")), "page").images;
    const count = (ps: PageObjects[]) => ps.reduce((n, p) => n + p.objects.length, 0);
    console.log(
      `${name}: ${all.length} pages, ${count(all)} objects, ${count(all) - count(objects)} at the same place on many pages left out`,
    );
    expect(objects.length).toBe(pages.length);
    // The frames agree: the pages' widths are poppler's.
    for (const [i, p] of objects.entries()) expect(p.width).toBeCloseTo(pages[i]?.width ?? 0, 1);
  });

  it("snaps every figure and table to its objects", () => {
    const rows: string[] = [];
    const wrong: string[] = [];
    let crossings = 0;
    let caught = 0;
    for (const c of cases) {
      const o = objects[c.page - 1]?.objects ?? [];
      const words = wordsOf(c);
      // Other blocks' words: those not the figure's (the page files say which), else those outside its box.
      const own = new Set(words);
      const blank = [...(pages[c.page - 1]?.words.values() ?? [])].filter((w) =>
        c.words === undefined ? !inside(c.hand, w) : !own.has(w),
      );
      const shows = showsOn(imageOf(c.page), PAGE_SCALE, blank);
      const s = snap(c.hand, o, words, { shows, others: blank });
      const cut = snap(shrink(c.hand, 0.1), o, words, { shows, others: blank });
      const cross = s.issues.filter((i) => i.kind === SnapIssue.Crosses);
      const cutCross = cut.issues.filter((i) => i.kind === SnapIssue.Crosses);
      const [overlap, cutOverlap] = [iou(s.box, c.hand), iou(cut.box, c.hand)];
      crossings += cross.length > 0 ? 1 : 0;
      caught += cutCross.length > 0 ? 1 : 0;
      const label = `p${c.page} ${c.number ?? c.kind}`;
      rows.push(
        `  ${label.padEnd(18)} objects ${String(s.objects.length).padStart(3)}  overlap ${overlap.toFixed(2)}  crossing ${cross.length}  | shrunk: overlap ${cutOverlap.toFixed(2)} crossing ${cutCross.length}`,
      );
      for (const i of [...s.issues]) rows.push(`      ${i.kind}: ${i.question}`);
      if (overlap < GOOD) wrong.push(`${label} overlap ${overlap.toFixed(2)}`);
    }
    console.log(
      `${name}: ${cases.length} figures and tables; overlap ≥ ${GOOD} for ${cases.length - wrong.length}; crossing issues on the hand boxes ${crossings}; on the shrunk boxes ${caught} of ${cases.length}\n${rows.join("\n")}`,
    );
    expect(wrong).toEqual([]);
  });

  it("reads every table's cells from its rules", () => {
    const tables = cases.filter((c) => c.kind === "table");
    const got: string[] = [];
    for (const page of new Set(tables.map((t) => t.page))) {
      const want = TABLES[`${dir.split("/").slice(-3).join("/")} p${page}`];
      const read = tables
        .filter((t) => t.page === page)
        .map((t): Table => tableCells(t.hand, objects[page - 1]?.objects ?? [], wordsOf(t)));
      for (const t of read)
        got.push(
          `  p${page} ${t.rows}×${t.columns}: ${t.cells.map((c) => `[${c.row},${c.column}${c.rows > 1 || c.columns > 1 ? ` ${c.rows}×${c.columns}` : ""}] ${c.text}`).join(" | ")}`,
        );
      expect(read.map((t) => [t.rows, t.columns])).toEqual(want?.map((w) => [w.rows, w.columns]));
      for (const [i, t] of read.entries()) {
        expect(t.cells.length).toBe(t.rows * t.columns);
        for (const [rc, text] of Object.entries(want?.[i]?.cells ?? {}))
          expect(t.cells.find((c) => `${c.row},${c.column}` === rc)?.text).toBe(text);
      }
    }
    console.log(`${name}: ${tables.length} tables\n${got.join("\n")}`);
  });
});
