import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Locale } from "@chalk/content";
import { describe, expect, it } from "vitest";
import { type BuiltPage, buildChapter, buildPage, expand, positionalIds } from "./build";
import {
  answer,
  chapterIssues,
  checkExtract,
  citedIn,
  isSameBlock,
  matchIssues,
  pageIssues,
  readingQuestion,
} from "./check";
import { type NumberedPage, type Word, numberPage, wordsFile } from "./read";
import { type Item, ItemKind, type PageBlock, type PageFile } from "./schema";

/** A page from lines of words: each line 20pt below the last, words 30pt apart. */
function words(n: number, lines: readonly string[]): NumberedPage {
  const all: Word[] = lines.flatMap((line, row) =>
    line.split(" ").map((text, col) => {
      const x0 = 50 + col * 30;
      const y0 = 100 + row * 20;
      return { text, x0, y0, x1: x0 + 25, y1: y0 + 10 };
    }),
  );
  return numberPage({ page: n, width: 500, height: 700, words: all });
}

const block = (kind: PageBlock["kind"], ranges: string, more: Partial<PageBlock> = {}) => ({
  kind,
  words: ranges,
  ...more,
});

function page(
  n: number,
  lines: readonly string[],
  blocks: PageBlock[],
  more: Partial<PageFile> = {},
): BuiltPage {
  return buildPage({ page: n, blocks, ...more }, words(n, lines));
}

const ids = (p: BuiltPage) => pageIssues(p).map((i) => i.id);

describe("numbered words", () => {
  it("are the PDF's lines, each word numbered, a broken one marked", () => {
    const p = words(3, ["कार्य का", "मेें x"]);
    expect([...p.words.keys()]).toEqual(["L1.1", "L1.2", "L2.1", "L2.2"]);
    expect(wordsFile(p, "book.pdf page 3")).toContain("L2 [50,120,105,130] 1:*मेें 2:x");
  });
  it("expands ranges of lines and words, in the order written", () => {
    const p = words(1, ["a b c", "d e", "f g h"]);
    expect(expand("L1.2-L2, L3.3, L3.1-2", p.words)).toEqual([
      "L1.2",
      "L1.3",
      "L2.1",
      "L2.2",
      "L3.3",
      "L3.1",
      "L3.2",
    ]);
    expect(() => expand("L4", p.words)).toThrow(/isn't on the page/);
    expect(() => expand("L2.2-L1", p.words)).toThrow(/isn't on the page/);
  });
});

describe("readings hold to the PDF's letters", () => {
  it.each([
    ["श न् ू ्य", "शून्य"],
    ["स त ं लित ु", "संतुलित"],
    ["च ँकि ू", "चूँकि"],
    ["विस््थथापन", "विस्थापन"],
    ["ॠणात््मक", "ऋणात्मक"],
    ["s –2", "s⁻²"],
  ])("%s reads as %s", (pdf, reading) => {
    expect(readingQuestion(pdf, reading)).toBeUndefined();
  });
  it("raises a reading with letters the PDF hasn't, or a doubled sign", () => {
    expect(readingQuestion("इधन", "ईंधन")).toMatch(/hasn't the PDF's letters/);
    expect(readingQuestion("मेें", "मेें")).toMatch(/doubled sign/);
    expect(readingQuestion("वस््ततु", "वस्तू")).toMatch(/hasn't the PDF's letters/);
  });
  it("puts the reading in the block's text, a span across a line as one word", () => {
    const p = page(
      1,
      ["उसके भार को स त", "ं लित ु कर इधन"],
      [block(ItemKind.Text, "L1-L2", { read: { "L1.4-L2.3": "संतुलित", "L2.5": "ईंधन" } })],
      { answers: { "read L2.5": "the PDF lacks ई and ं; the image shows ईंधन" } },
    );
    expect(p.blocks[0]?.text).toBe("उसके भार को संतुलित कर ईंधन");
    const issues = pageIssues(p);
    expect(issues.map((i) => i.id)).toEqual(["read L2.5"]);
    expect(answer(issues, new Map([[1, p.file.answers ?? {}]]), {})).toEqual([]);
    expect(issues[0]?.answer).toMatch(/lacks/);
  });
  it("can't read outside its block: a problem, not an issue", () => {
    const p = page(
      1,
      ["a b", "c d"],
      [block(ItemKind.Text, "L1", { read: { "L2.1": "x" } }), block(ItemKind.Text, "L2")],
    );
    expect(p.problems[0]).toMatch(/not in the block's words/);
  });
});

describe("every word is used once", () => {
  it("raises a word in nothing and a word in two places", () => {
    const p = page(
      1,
      ["7 Work", "a b c"],
      [block(ItemKind.Text, "L2"), block(ItemKind.Text, "L2.3")],
      {
        furniture: "L1.1",
      },
    );
    expect(ids(p)).toEqual(["unused L1.2", "twice L2.3"]);
  });
  it("a range not on the page is a problem", () => {
    expect(page(1, ["a"], [block(ItemKind.Text, "L2")]).problems[0]).toMatch(/isn't on the page/);
  });
  it("an answer to no issue is a problem", () => {
    expect(answer([], new Map([[4, { "unused L1.1": "why" }]]), {})).toEqual([
      'pages/page-04.yaml: an answer to "unused L1.1", which isn\'t an issue',
    ]);
  });
});

describe("numbers, boxes and terms", () => {
  it("raises a number not in its block's words", () => {
    const p = page(
      1,
      ["Fig. 7.4 A graph"],
      [block(ItemKind.Figure, "L1", { number: "Fig. 7.5", box: [10, 10, 200, 200] })],
    );
    expect(ids(p)).toEqual(["number L1.1"]);
  });
  it("raises a figure without a box, or with one outside the page", () => {
    const p = page(
      1,
      ["Fig. 1", "Fig. 2"],
      [
        block(ItemKind.Figure, "L1", { number: "Fig. 1" }),
        block(ItemKind.Table, "L2", { number: "Fig. 2", box: [10, 10, 600, 200] }),
      ],
    );
    expect(ids(p)).toEqual(["box L1.1", "box L2.1"]);
  });
  it("raises a term not within one block; takes a term's English from its brackets", () => {
    const p = page(
      1,
      ["इसे मूल-बिन्दु (origin) कहते हैं", "अगला"],
      [block(ItemKind.Text, "L1"), block(ItemKind.Text, "L2")],
      { terms: ["L1.2", "L1.5-L2.1"] },
    );
    expect(ids(p)).toEqual(["term L1.5-L2.1"]);
    expect(buildChapter(Locale.Hi, [p], 1).terms).toEqual([
      { term: "मूल-बिन्दु", item: "0.1", en: "origin" },
    ]);
  });
  it("raises numbers of a kind out of order or twice, by their digits", () => {
    const p = page(
      1,
      ["Fig. 7.2", "Fig. 7.1", "Fig. 7.1", "चित्र 7.3"],
      [
        block(ItemKind.Figure, "L1", { number: "Fig. 7.2", box: [1, 1, 9, 9] }),
        block(ItemKind.Figure, "L2", { number: "Fig. 7.1", box: [1, 1, 9, 9] }),
        block(ItemKind.Figure, "L3", { number: "Fig. 7.1", box: [1, 1, 9, 9] }),
        block(ItemKind.Figure, "L4", { number: "चित्र 7.3", box: [1, 1, 9, 9] }),
      ],
    );
    expect(chapterIssues(buildChapter(Locale.En, [p], 1)).map((i) => i.id)).toEqual([
      "order L2.1",
      "again L3.1",
    ]);
  });
  it("counts questions within their exercise", () => {
    const p = page(
      1,
      ["EXERCISE 3.1", "1. a", "2. b", "Exercises", "1. c"],
      [
        block(ItemKind.Exercise, "L1", { number: "EXERCISE 3.1" }),
        block(ItemKind.Question, "L2", { number: "1." }),
        block(ItemKind.Question, "L3", { number: "2." }),
        block(ItemKind.Exercise, "L4", { title: "Exercises" }),
        block(ItemKind.Question, "L5", { number: "1." }),
      ],
    );
    expect(chapterIssues(buildChapter(Locale.En, [p], 1))).toEqual([]);
  });
});

describe("pages join", () => {
  const first = page(
    3,
    ["Work is done", "when"],
    [
      block(ItemKind.Section, "L1", { number: "7.1" }),
      block(ItemKind.Text, "L2", { continues: true }),
    ],
  );
  it("joins a block that continues with the next page's continued one, numbered where it starts", () => {
    const second = page(
      4,
      ["a force moves it.", "2. Find"],
      [
        block(ItemKind.Text, "L1", { continued: true }),
        block(ItemKind.Question, "L2", { number: "2." }),
      ],
    );
    const built = buildChapter(Locale.En, [first, second], 10);
    expect(built.items.map((i) => [i.id, i.page, i.text])).toEqual([
      ["1", 3, "Work is done"],
      ["1.1", 3, "when a force moves it."],
      ["1.2", 4, "2. Find"],
    ]);
    expect(built.unpaired).toEqual([]);
  });
  it("raises joins that don't pair, unless a page between isn't read yet", () => {
    const lone = page(4, ["a force"], [block(ItemKind.Text, "L1")]);
    expect(chapterIssues(buildChapter(Locale.En, [first, lone], 10)).map((i) => i.id)).toEqual([
      "continues L2.1",
    ]);
    const later = page(6, ["it."], [block(ItemKind.Text, "L1", { continued: true })]);
    expect(chapterIssues(buildChapter(Locale.En, [first, later], 10))).toEqual([]);
    const opening = page(1, ["it."], [block(ItemKind.Text, "L1", { continued: true })]);
    expect(chapterIssues(buildChapter(Locale.En, [opening], 10)).map((i) => i.id)).toEqual([
      "continued L1.1",
    ]);
  });
});

describe("ids are positions", () => {
  it("numbers sections, their blocks, subsections (by their number) and an exercise's questions", () => {
    const kinds = [
      { kind: ItemKind.Text },
      { kind: ItemKind.Section, number: "7.1" },
      { kind: ItemKind.Text },
      { kind: ItemKind.Exercise },
      { kind: ItemKind.Question },
      { kind: ItemKind.Question },
      { kind: ItemKind.Table },
      { kind: ItemKind.Section, number: "7.2" },
      { kind: ItemKind.Section, number: "7.2.1" },
      { kind: ItemKind.Text },
    ];
    expect(positionalIds(kinds)).toEqual([
      "0.1",
      "1",
      "1.1",
      "1.2",
      "1.2.1",
      "1.2.2",
      "1.3",
      "2",
      "2.1",
      "2.1.1",
    ]);
  });
  it("finds the ids boards.md cites, and whether an id still names its block", () => {
    const cited = citedIn(
      "### street (o1, o2; 1, 1.1, 1.2)\n- **2.3** a line\nprose and more. (3.4)",
    );
    expect([...cited].sort()).toEqual(["1", "1.1", "1.2", "2.3", "3.4"]);
    const was: Item = {
      id: "1.1",
      kind: ItemKind.Text,
      page: 1,
      text: "The point where the axes cross",
    };
    expect(isSameBlock(was, { ...was, text: "The point where the axes meet" })).toBe(true);
    expect(isSameBlock(was, { ...was, text: "Plot the points on a sheet" })).toBe(false);
    expect(isSameBlock(was, { ...was, kind: ItemKind.Figure })).toBe(false);
  });
});

describe("languages match by kind and digits", () => {
  const english: Item[] = [
    { id: "1", kind: ItemKind.Section, page: 1, number: "7.1", text: "7.1 Work" },
    { id: "1.1", kind: ItemKind.Figure, page: 1, number: "Fig. 7.1", text: "Fig. 7.1" },
    { id: "1.2", kind: ItemKind.Exercise, page: 2, title: "Exercises", text: "Exercises" },
    { id: "1.2.1", kind: ItemKind.Question, page: 2, number: "1.", text: "1. Why?" },
  ];
  const hindi = page(
    1,
    ["7.1 कार्य", "चित्र 7.1", "अभ्यास", "1. क्यों?"],
    [
      block(ItemKind.Section, "L1", { number: "7.1" }),
      block(ItemKind.Figure, "L2", { number: "चित्र 7.1", box: [1, 1, 9, 9] }),
      block(ItemKind.Exercise, "L3", { title: "अभ्यास" }),
      block(ItemKind.Question, "L4", { number: "1." }),
    ],
  );
  it("matches, not by words", () => {
    expect(matchIssues(buildChapter(Locale.Hi, [hindi], 1), english)).toEqual([]);
  });
  it("raises what one book has and the other doesn't, answered in book.yaml", () => {
    const fewer = english.filter((i) => i.kind !== ItemKind.Figure);
    const issues = matchIssues(buildChapter(Locale.Hi, [hindi], 1), [
      ...fewer,
      { id: "1.2.2", kind: ItemKind.Question, page: 2, number: "2.", text: "2. How?" },
    ]);
    expect(issues.map((i) => i.id)).toEqual(["match question 2 of exercise 1", "match figure 7.1"]);
    expect(answer(issues, new Map(), { "match figure 7.1": "drawn in the text" })).toEqual([]);
    expect(issues.filter((i) => i.answer === undefined)).toHaveLength(1);
  });
});

describe("an extract not read by the new pipeline", () => {
  it("is a note, its items.yaml as written", () => {
    const dir = mkdtempSync(join(tmpdir(), "chalk-source-"));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "items.yaml"), '- { id: "1", kind: section, page: 1, text: Intro }\n');
    const report = checkExtract({ dir, rel: "authoring/books/b/c/source/en", lang: Locale.En });
    expect(report.problems).toEqual([]);
    expect(report.notes[0]).toMatch(/not yet read by the new pipeline/);
    expect(report.items).toHaveLength(1);
  });
});
