import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Locale } from "@chalk/content";
import { afterAll, describe, expect, it } from "vitest";
import { parse, stringify } from "yaml";
import { Edit, buildChapter, buildPage } from "./build";
import {
  NOT_PROOFREAD,
  answer,
  changedPieces,
  chapterIssues,
  checkExtract,
  pageIssues,
} from "./check";
import { feedback } from "./feedback";
import { sha256 } from "./files";
import { type DrawnObject, ObjectKind } from "./objects";
import { buildSource, writeDrafts } from "./pipeline";
import { type NumberedPage, numberPage, numberedPages } from "./read";
import {
  type Box,
  Cause,
  type Item,
  ItemKind,
  Maker,
  type PageBlock,
  bookSchema,
  itemsSchema,
  pageFileSchema,
} from "./schema";
import { rangeOf, wordSuggestions } from "./suggest";
import { TOOL_VERSIONS } from "./tools";

/** A page from lines of words: each line 20pt below the last, words 40pt apart. */
function words(lines: readonly string[]): NumberedPage {
  return numberPage({
    page: 1,
    width: 500,
    height: 700,
    words: lines.flatMap((line, row) =>
      line.split(" ").map((text, col) => ({
        text,
        x0: 50 + col * 40,
        x1: 80 + col * 40,
        y0: 100 + row * 20,
        y1: 110 + row * 20,
      })),
    ),
  });
}
const text = (ranges: string, more: Partial<PageBlock> = {}): PageBlock => ({
  kind: ItemKind.Text,
  words: ranges,
  ...more,
});
const built = (lines: readonly string[], blocks: PageBlock[], notes?: Record<string, string>) =>
  buildPage(
    { page: 1, proofread: true, blocks, ...(notes === undefined ? {} : { notes }) },
    words(lines),
  );

describe("the tools' suggestions", () => {
  it("rangeOf writes word ids as a range", () => {
    expect(rangeOf(["L5.2"])).toBe("L5.2");
    expect(rangeOf(["L5.2", "L5.3", "L5.4"])).toBe("L5.2-4");
    expect(rangeOf(["L5.9", "L6.1"])).toBe("L5.9-L6.1");
  });
  it("suggests only where Hindi isn't as the PDF gives it, or has no reading", () => {
    const list = wordSuggestions(words(["मेें घर word", "तत््व"]));
    expect(list.map((s) => [s.range, s.reading, s.left !== undefined])).toEqual([
      ["L1.1", "में", false],
      ["L2.1", undefined, true],
    ]);
  });
  it("makes nothing of English", () => {
    expect(wordSuggestions(words(["some plain words"]))).toEqual([]);
  });
});

describe("who made each piece", () => {
  it("a repair is the tool's, the rest the PDF's, and only the repair is listed", () => {
    const p = built(["यह मेें घर"], [text("L1")]);
    const { items } = buildChapter(Locale.Hi, [p], 1);
    expect(items[0]?.text).toBe("यह में घर");
    expect(items[0]?.made).toEqual([{ words: "L1.2", by: Maker.HindiRepair }]);
    expect(pageIssues(p)).toEqual([]);
  });
  it("what the PDF gives as it is lists nothing", () => {
    const { items } = buildChapter(Locale.En, [built(["plain words"], [text("L1")])], 1);
    expect(items[0]?.made).toBeUndefined();
  });
  it("a block across pages says which page a made word is on", () => {
    const first = buildPage({ page: 1, blocks: [text("L1", { continues: true })] }, words(["मेें"]));
    const second = buildPage(
      { page: 2, blocks: [text("L1", { continued: true })] },
      { ...words(["मेें"]), page: 2 },
    );
    expect(buildChapter(Locale.Hi, [first, second], 2).items[0]?.made).toEqual([
      { words: "L1.1", by: Maker.HindiRepair },
      { words: "L1.1", page: 2, by: Maker.HindiRepair },
    ]);
  });
  it("a number and a title are ranges: their text is what was decided for those words", () => {
    const p = built(
      ["चित्र मेें 2.1"],
      [text("L1", { kind: ItemKind.Box, number: "L1.3", title: "L1.1-2" })],
    );
    expect(p.blocks[0]).toMatchObject({ number: "2.1", title: "चित्र में" });
  });
});

describe("a reading over the tools", () => {
  it("replaces the suggestions it touches, is the agent's, and needs a cause", () => {
    const p = built(
      ["यह मेें घर"],
      [text("L1", { read: { "L1.2": { text: "में", cause: Cause.WrongReading } } })],
    );
    expect(pageIssues(p).map((i) => i.id)).toEqual(["matches L1.2"]);

    const q = built(["यह सेे घर"], [text("L1", { read: { "L1.2": "सैे" } })]);
    expect(pageIssues(q).map((i) => i.id)).toContain("no cause L1.2");
    const byPage = buildPage(
      {
        page: 1,
        proofread: true,
        cause: Cause.WrongReading,
        blocks: [text("L1", { read: { "L1.2": "सैे" } })],
      },
      words(["यह सेे घर"]),
    );
    expect(pageIssues(byPage).map((i) => i.id)).not.toContain("no cause L1.2");
    expect(byPage.overrides[0]?.cause).toBe(Cause.WrongReading);
    const [noCause] = pageIssues(q).filter((i) => i.id === "no cause L1.2");
    answer(noCause === undefined ? [] : [noCause], new Map([[1, { "no cause L1.2": "because" }]]));
    expect(noCause?.answer).toBeUndefined();

    const lines = ["अध््ययन घर"];
    const r = built(
      lines,
      [text("L1", { read: { "L1.1": { text: "अध्यन", cause: Cause.WrongReading } } })],
      { [Cause.WrongReading]: "the page prints this" },
    );
    expect(r.problems).toEqual([]);
    expect(buildChapter(Locale.Hi, [r], 1).items[0]).toMatchObject({
      text: "अध्यन घर",
      made: [{ words: "L1.1", by: Maker.Agent }],
    });
  });
  it("needs no cause where it fills a gap the tool left", () => {
    const p = built(["तत््व घर"], [text("L1", { read: { "L1.1": "तत्व" } })]);
    expect(p.problems).toEqual([]);
    expect(p.overrides).toEqual([]);
    expect(pageIssues(p).map((i) => i.id)).toEqual([]);
  });
  it("a gap left unfilled is an issue, with the tool's why", () => {
    const p = built(["तत््व घर"], [text("L1")]);
    expect(p.blocks[0]?.text).toBe("तत््व घर");
    const [issue] = pageIssues(p);
    expect(issue?.id).toBe("left L1.1");
    expect(issue?.question).toMatch(/several real readings: तत्व, त्व/);
  });
  it("must cover a tool's span whole: a partial overlap is an issue", () => {
    const page: NumberedPage = numberPage({
      page: 1,
      width: 500,
      height: 700,
      words: [
        { text: "शोधकर््तताओ", x0: 50, x1: 90, y0: 100, y1: 110 },
        { text: "ं", x0: 90, x1: 91, y0: 100, y1: 110 },
      ],
    });
    const p = buildPage(
      {
        page: 1,
        proofread: true,
        blocks: [text("L1", { read: { "L1.1": { text: "शोधकर्ताओ", cause: Cause.WrongReading } } })],
      },
      page,
    );
    expect(pageIssues(p).map((i) => i.id)).toEqual(["partial L1.1"]);
  });
  it("where the tools flagged nothing is an addition, with a cause, on the reader", () => {
    const p = built(
      ["s 2 x"],
      [text("L1", { read: { "L1.1-2": { text: "s²", cause: Cause.Other } } })],
    );
    expect(p.overrides).toMatchObject([
      { tool: "reader", edit: Edit.Addition, suggested: "s 2", decided: "s²", cause: Cause.Other },
    ]);
    expect(pageIssues(p)).toEqual([]);
  });
  it("a note must belong to a cause given on the page", () => {
    const p = built(["plain"], [text("L1")], { [Cause.SideColumn]: "why" });
    expect(p.problems.join()).toMatch(/no override here gives/);
  });
  it("a word the list lacks is raised once for the book, on its first page", () => {
    const blocks = [
      text("L1", { read: { "L1.1": "अल्पपरासारी" } }),
      text("L2", { read: { "L2.1": "अल्पपरासारी" } }),
    ];
    const p = built(["अल््पपरासारी", "अल््पपरासारी"], blocks);
    expect(chapterIssues(buildChapter(Locale.Hi, [p], 1)).map((i) => i.id)).toEqual([
      "word अल्पपरासारी",
    ]);
  });
});

/** A square of ruled rows and columns: `rows` × `columns` cells, 40 points each, from (50, 100). */
function grid(rows: number, columns: number): DrawnObject[] {
  const [x1, y1] = [50 + columns * 40, 100 + rows * 20];
  const flat = Array.from({ length: rows + 1 }, (_, r): Box => {
    const y = 100 + r * 20;
    return [50, y, x1, y];
  });
  const upright = Array.from({ length: columns + 1 }, (_, c): Box => {
    const x = 50 + c * 40;
    return [x, 100, x, y1];
  });
  return [{ kind: ObjectKind.Path, box: [50, 100, x1, y1], rules: [...flat, ...upright] }];
}
const figure = (box: Box): DrawnObject => ({ kind: ObjectKind.Image, box, rules: [] });

describe("a figure's box", () => {
  const lines = ["Fig. 1", "other"];
  it("is snapped from the rough box to what the PDF drew, by figure-snap", () => {
    const p = buildPage(
      {
        page: 1,
        proofread: true,
        blocks: [
          { kind: ItemKind.Figure, words: "L1", number: "L1", box: [50, 60, 200, 125] },
          text("L2"),
        ],
      },
      words(lines),
      { objects: [figure([60, 70, 180, 95])] },
    );
    const { items } = buildChapter(Locale.En, [p], 1);
    expect(items[0]?.crop).toEqual([50, 70, 180, 110]);
    expect(items[0]?.made).toEqual([{ box: true, by: Maker.FigureSnap }]);
    expect(pageIssues(p)).toEqual([]);
  });
  it("raises an object crossing the rough box's edge", () => {
    const p = buildPage(
      {
        page: 1,
        proofread: true,
        blocks: [{ kind: ItemKind.Figure, words: "L1-L2", box: [50, 60, 120, 125] }],
      },
      words(lines),
      { objects: [figure([60, 70, 170, 95])] },
    );
    expect(pageIssues(p).map((i) => i.id)).toEqual(["crosses L1.1"]);
  });
  it("with no drawing, the rough box stands as the agent's: a question", () => {
    const p = buildPage(
      {
        page: 1,
        proofread: true,
        blocks: [{ kind: ItemKind.Figure, words: "L1-L2", box: [50, 60, 120, 125] }],
      },
      words(lines),
      { objects: [] },
    );
    expect(pageIssues(p).map((i) => i.id)).toEqual(["no drawing L1.1"]);
    expect(buildChapter(Locale.En, [p], 1).items[0]).toMatchObject({
      crop: [50, 60, 120, 125],
      made: [{ box: true, by: Maker.Agent }],
    });
  });
  it("the agent's box over it needs a cause, and is an issue if it now matches the tool", () => {
    const page = (crop: { box: Box; cause?: (typeof Cause)[keyof typeof Cause] }) =>
      buildPage(
        {
          page: 1,
          proofread: true,
          blocks: [{ kind: ItemKind.Figure, words: "L1-L2", box: [50, 60, 200, 125], crop }],
        },
        words(lines),
        { objects: [figure([60, 70, 180, 95])] },
      );
    expect(pageIssues(page({ box: [40, 60, 200, 130] })).map((i) => i.id)).toContain(
      "no cause box L1.1",
    );
    const moved = page({ box: [40, 60, 200, 130], cause: Cause.WrongBox });
    expect(moved.problems).toEqual([]);
    expect(moved.overrides).toMatchObject([{ tool: "figure-snap", edit: Edit.Box }]);
    expect(buildChapter(Locale.En, [moved], 1).items[0]?.made).toEqual([
      { box: true, by: Maker.Agent },
    ]);
    const same = page({ box: [50, 70, 180, 130], cause: Cause.WrongBox });
    expect(pageIssues(same).map((i) => i.id)).toEqual(["matches box L1.1"]);
  });
});

describe("a table's cells", () => {
  const lines = ["a b", "c d"];
  const page = (more: Partial<PageBlock>, objects: DrawnObject[]) =>
    buildPage(
      {
        page: 1,
        proofread: true,
        blocks: [{ kind: ItemKind.Table, words: "L1-L2", box: [45, 95, 140, 145], ...more }],
      },
      words(lines),
      { objects },
    );
  it("come from its rules, by table-cells", () => {
    const { items } = buildChapter(Locale.En, [page({}, grid(2, 2))], 1);
    expect(items[0]?.rows).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
    expect(items[0]?.made).toEqual([
      { box: true, by: Maker.FigureSnap },
      { cells: true, by: Maker.TableCells },
    ]);
  });
  it("without rules are the agent's to mark, by word ranges, with no cause: filling a gap", () => {
    const p = page({ cells: { rows: [["L1.1", "L1.2"], ["L2"]] } }, []);
    expect(p.problems).toEqual([]);
    expect(p.overrides).toEqual([]);
    const { items } = buildChapter(Locale.En, [p], 1);
    expect(items[0]?.rows).toEqual([["a", "b"], ["c d"]]);
    expect(items[0]?.made).toContainEqual({ cells: true, by: Maker.Agent });
    expect(pageIssues(page({}, [])).map((i) => i.id)).toContain("no rules L1.1");
  });
  it("the agent's over the tool's need a cause; the same rows are an issue", () => {
    const moved = page({ cells: { rows: [["L1"], ["L2"]], cause: Cause.WrongCells } }, grid(2, 2));
    expect(moved.problems).toEqual([]);
    expect(moved.overrides).toMatchObject([{ tool: "table-cells", edit: Edit.Cells }]);
    expect(
      pageIssues(page({ cells: { rows: [["L1"], ["L2"]] } }, grid(2, 2))).map((i) => i.id),
    ).toContain("no cause cells L1.1");
    const same = page(
      {
        cells: {
          rows: [
            ["L1.1", "L1.2"],
            ["L2.1", "L2.2"],
          ],
        },
      },
      grid(2, 2),
    );
    expect(pageIssues(same).map((i) => i.id)).toContain("matches cells L1.1");
  });
});

describe("a page must be marked proofread", () => {
  const unread = (more: object) =>
    buildPage({ page: 1, blocks: [text("L1")], ...more }, words(["तत््व घर"]));
  it("says only that until it is, whether false or absent", () => {
    for (const file of [unread({}), unread({ proofread: false })])
      expect(pageIssues(file).map((i) => i.id)).toEqual([NOT_PROOFREAD]);
    expect(pageIssues(unread({ proofread: true })).map((i) => i.id)).toEqual(["left L1.1"]);
  });
  it("can't be answered: only proofread: true passes it", () => {
    const issues = pageIssues(unread({}));
    answer(issues, new Map([[1, { [NOT_PROOFREAD]: "looks fine" }]]));
    expect(issues[0]?.answer).toBeUndefined();
  });
});

describe("the drafts", () => {
  it("are written only where no page file is, each not proofread", () => {
    const dir = mkdtempSync(join(tmpdir(), "chalk-drafts-"));
    const pages = [words(["some words"]), { ...words(["more words"]), page: 2 }];
    writeFileSync(join(dir, "page-01.yaml"), "page: 1\nproofread: true\nblocks: []\n");
    expect(writeDrafts(dir, pages)).toEqual([2]);
    expect(readFileSync(join(dir, "page-01.yaml"), "utf8")).toContain("proofread: true");
    const draft = pageFileSchema.parse(parse(readFileSync(join(dir, "page-02.yaml"), "utf8")));
    expect(draft.proofread).toBe(false);
    expect(draft.blocks.length).toBeGreaterThan(0);
    expect(writeDrafts(dir, pages)).toEqual([]);
    rmSync(dir, { recursive: true, force: true });
  });
});

describe("a piece whose content a tool changed", () => {
  const a: Item = { id: "1.1", kind: ItemKind.Text, page: 4, text: "was" };
  it("is an issue on its page, each way", () => {
    expect(changedPieces([a], [a], ["reader 1 → 2"])).toEqual([]);
    const issues = changedPieces(
      [a],
      [
        { ...a, text: "now" },
        { ...a, id: "1.2", page: 5 },
      ],
      ["reader 1 → 2"],
    );
    expect(issues.map((i) => [i.id, i.page])).toEqual([
      ["changed 1.1", 4],
      ["changed 1.2", 5],
    ]);
    expect(issues[0]?.question).toMatch(/with reader 1 → 2/);
  });
});

describe("an extract, from the real PDF, through build, check and feedback", () => {
  const root = mkdtempSync(join(tmpdir(), "chalk-source-extract-"));
  afterAll(() => rmSync(root, { recursive: true, force: true }));
  const dir = join(root, "authoring/books/b/c/source/en");
  const bookFile = join(dir, "book.yaml");
  const repo = join(import.meta.dirname, "../../../..");
  const source = join(repo, "authoring/books/class9-maths/coordinate-geometry/source/en/book.pdf");
  const x = { dir, rel: "authoring/books/b/c/source/en", lang: Locale.En };
  const run = { root, book: "b", chapter: "c", lang: Locale.En };

  it(
    "builds, snaps, lays out cells, and holds; then reports a tool's change on its piece",
    { timeout: 120_000 },
    () => {
      mkdirSync(join(dir, "pages"), { recursive: true });
      copyFileSync(source, join(dir, "book.pdf"));
      const pages = numberedPages(source, "text");
      const page = pages[12] as NumberedPage;
      const all = [...page.words.keys()];
      const table = page.lines.findIndex((l) => l[0]?.text === "x" && l.length >= 5);
      expect(table).toBeGreaterThan(0);
      const rows = [table + 1, table + 2];
      const inTable = new Set(rows.flatMap((n) => all.filter((id) => id.startsWith(`L${n}.`))));
      const rest = all.filter((id) => !inTable.has(id));
      const ys = rows.flatMap((n) => page.lines[n - 1] ?? []).flatMap((w) => [w.y0, w.y1]);
      const rough: Box = [
        50,
        Math.floor(Math.min(...ys)) - 14,
        420,
        Math.ceil(Math.max(...ys)) + 14,
      ];
      const list = (ids: readonly string[]) => ids.join(", ");
      const block = { kind: ItemKind.Table, words: `L${rows[0]}-L${rows[1]}`, box: rough };
      const pagefile = { page: 13, proofread: true, furniture: list(rest), blocks: [block] };
      const others = pages
        .map((p) => p.page)
        .filter((n) => n !== 13)
        .map((n) => ({
          page: n,
          proofread: true,
          furniture: list([...(pages[n - 1] as NumberedPage).words.keys()]),
          blocks: [],
        }));
      for (const f of [pagefile, ...others])
        writeFileSync(
          join(dir, "pages", `page-${String(f.page).padStart(2, "0")}.yaml`),
          stringify(f),
        );
      const book = bookSchema.parse({
        title: "Coordinate Geometry",
        edition: "2021-22",
        reader: "text",
        address: "x",
        sha256: sha256(readFileSync(source)),
        pages: pages.length,
        tools: TOOL_VERSIONS,
      });
      writeFileSync(bookFile, stringify(book));

      const made = buildSource(run);
      expect(made.problems).toEqual([]);
      const items = itemsSchema.parse(parse(readFileSync(join(dir, "items.yaml"), "utf8")));
      expect(items[0]?.rows?.length).toBe(2);
      expect(items[0]?.rows?.[0]?.length).toBe(6);
      expect(items[0]?.made).toEqual([
        { box: true, by: Maker.FigureSnap },
        { cells: true, by: Maker.TableCells },
      ]);
      expect(checkExtract(x).problems).toEqual([]);

      // A later version of a tool: the check fails, and the build won't take it in unseen.
      const older = { ...book, tools: { ...TOOL_VERSIONS, "figure-snap": 0 } };
      writeFileSync(bookFile, stringify(older));
      const stored = items[0] as Item;
      writeFileSync(join(dir, "items.yaml"), stringify([{ ...stored, rows: [["old"]] }]));
      const report = checkExtract(x);
      expect(report.problems.join("\n")).toMatch(/built with other tools \(figure-snap 0 → 1\)/);
      const seen = buildSource(run);
      expect(seen.problems.join("\n")).toMatch(/"changed /);
      expect(seen.lines.join()).toMatch(/not written/);

      const pageFile = join(dir, "pages", "page-13.yaml");
      writeFileSync(
        pageFile,
        stringify({ ...pagefile, answers: { [`changed ${stored.id}`]: "looked: right" } }),
      );
      expect(buildSource(run).problems).toEqual([]);
      expect(
        (bookSchema.parse(parse(readFileSync(bookFile, "utf8"))) as { tools?: unknown }).tools,
      ).toEqual(TOOL_VERSIONS);
      // The answer stays as the record once the change is taken in.
      expect(checkExtract(x).problems).toEqual([]);

      // No tool's content was overridden yet (this page file's blocks differ from the draft's: those
      // are structure edits, tested in feedback.test.ts).
      expect(
        feedback(root, "b/c").lines.filter((l) =>
          /\t(hindi-repair|figure-snap|table-cells)\t/.test(l),
        ),
      ).toEqual([]);

      // An override, with its cause and note, comes out with everything about it.
      const word = stored.rows?.[0]?.[0] === undefined ? "" : `L${rows[0]}.1`;
      writeFileSync(
        pageFile,
        stringify({
          ...pagefile,
          blocks: [{ ...block, read: { [word]: { text: "X", cause: Cause.Other } } }],
          notes: { [Cause.Other]: "a capital, as printed" },
        }),
      );
      const { lines } = feedback(root);
      expect(lines[1]).toBe(
        `b/c\ten\treader\t${TOOL_VERSIONS.reader}\t13\t${word}\taddition\tx\tX\tother\ta capital, as printed`,
      );
      // The structure edit (this page file's table against the draft's two text blocks) comes after it.
      expect(lines[2]).toMatch(/structure-draft.*merge/);
      expect(lines.at(-1)).toMatch(/2 overrides in 1 extract/);
    },
  );
});

describe("a number the PDF glued to its next word with a tab", () => {
  const w = (text: string, x0: number) => ({ text, x0, y0: 10, x1: x0 + 20, y1: 20 });
  const page = numberPage({
    page: 1,
    width: 500,
    height: 700,
    words: [w("2.4\tलवण", 10), w("का", 40), w("pH", 70)],
  });
  it.each([
    ["as the PDF gives it", {}],
    ["read with a space, as the repair gives it", { read: { "L1.1": "2.4 लवण" } }],
  ])("is the number before the tab, the title after it (%s)", (_, extra) => {
    const built = buildPage(
      {
        page: 1,
        proofread: true,
        blocks: [{ kind: "section", words: "L1", number: "L1.1", title: "L1.1-3", ...extra }],
      } as never,
      page,
    );
    const b = built.blocks[0];
    expect([b?.number, b?.title, b?.text]).toEqual(["2.4", "लवण का pH", "2.4 लवण का pH"]);
  });
});
