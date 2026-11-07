import { Locale } from "@chalk/content";
import { describe, expect, it } from "vitest";
import { place } from "./boxes";
import {
  checkFigures,
  checkIds,
  checkMatch,
  checkNumbers,
  checkReading,
  checkTerms,
} from "./checks";
import { positionalIds } from "./ids";
import { lettersOnly } from "./letters";
import { parseNumber, scanNumbers } from "./numbers";
import { type Item, ItemKind } from "./schema";
import { type PageText, type Word, pagesFromBbox, withoutStackedFractions } from "./text-layer";

/** A page from lines of words: each line 12pt below the last, words 30pt apart. */
function page(n: number, lines: readonly string[], at: { x?: number; y?: number } = {}): PageText {
  const words: Word[] = lines.flatMap((line, row) =>
    line.split(" ").map((text, col) => {
      const x0 = (at.x ?? 50) + col * 30;
      const y0 = (at.y ?? 100) + row * 12;
      return { text, x0, y0, x1: x0 + 25, y1: y0 + 10 };
    }),
  );
  return { page: n, width: 500, height: 700, words, head: [], foot: [], bold: [] };
}

const item = (id: string, kind: Item["kind"], text: string, more: Partial<Item> = {}): Item => ({
  id,
  kind,
  page: 1,
  text,
  ...more,
});

describe("ids are positions", () => {
  it("numbers sections, their blocks, subsections and an exercise's questions", () => {
    const kinds = [
      { kind: ItemKind.Text },
      { kind: ItemKind.Section },
      { kind: ItemKind.Text },
      { kind: ItemKind.Exercise },
      { kind: ItemKind.Question },
      { kind: ItemKind.Question },
      { kind: ItemKind.Table },
      { kind: ItemKind.Section },
      { kind: ItemKind.Section, level: 2 },
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
  it("passes ids that are positions and fails one that isn't", () => {
    const items = [item("1", ItemKind.Section, "A"), item("1.1", ItemKind.Text, "b")];
    expect(checkIds(items)).toEqual([]);
    expect(checkIds([items[0] as Item, item("1.2", ItemKind.Text, "b")])[0]).toMatch(/1\.2.*1\.1/);
  });
});

describe("letters only", () => {
  it("ignores spaces, dashes, minus signs, primes, brackets and fractions", () => {
    expect(lettersOnly("(– 6, – 2) X′X x - axis ⅔")).toBe(lettersOnly("(−6, −2) X'X x-axis"));
    expect(lettersOnly("E are (2/3, 0)")).toBe("Eare0");
  });
  it("keeps letters and digits apart from each other", () => {
    expect(lettersOnly("(4, 3)")).not.toBe(lettersOnly("(3, 4)"));
  });
});

describe("a stacked fraction's digits", () => {
  it("are left out of the text layer; a column of numbers isn't", () => {
    const words: Word[] = [
      { text: "2", x0: 207, y0: 317, x1: 213, y1: 327 },
      { text: "are", x0: 150, y0: 327, x1: 170, y1: 337 },
      { text: ",", x0: 214, y0: 323, x1: 217, y1: 333 },
      { text: "3", x0: 207, y0: 332, x1: 213, y1: 342 },
      { text: "7", x0: 300, y0: 400, x1: 306, y1: 410 },
      { text: "8", x0: 300, y0: 427, x1: 306, y1: 437 },
    ];
    expect(withoutStackedFractions(words).map((w) => w.text)).toEqual(["are", ",", "7", "8"]);
  });
});

describe("the text layer's running head and footer", () => {
  it("are kept apart from the page's words", () => {
    const w = (text: string, y: number) =>
      `<word xMin="66" yMin="${y}" xMax="80" yMax="${y + 9}">${text}</word>`;
    const [p] = pagesFromBbox(
      `<page width="504" height="720">${w("52", 91)}${w("Body", 200)}${w("2020-21", 690)}</page>`,
    );
    expect(p?.head.map((x) => x.text)).toEqual(["52"]);
    expect(p?.words.map((x) => x.text)).toEqual(["Body"]);
    expect(p?.foot.map((x) => x.text)).toEqual(["2020-21"]);
  });
});

describe("the reading agrees with the book", () => {
  const pages = [
    page(1, ["The point where X′X and", "Y′Y cross is the origin."]),
    page(2, ["Plot the points (–3, 5)", "and (2, – 4)."]),
  ];
  it("finds each block on its page, or running over to the next", () => {
    const items = [
      item("1.1", ItemKind.Text, "The point where X′X and Y′Y cross is the origin."),
      item("1.2", ItemKind.Text, "is the origin. Plot the points (−3, 5)"),
    ];
    expect(checkReading(items, pages)).toEqual([]);
  });
  it("fails a misread word, and says where", () => {
    const problems = checkReading(
      [item("1.1", ItemKind.Text, "The point where X′X and Y′Y meet is the origin.")],
      pages,
    );
    expect(problems[0]).toMatch(/1\.1: not found on page 1.*meet/);
  });
  it("fails a number not on its page", () => {
    const problems = checkReading(
      [item("1", ItemKind.Section, "origin", { number: "3.9" })],
      pages,
    );
    expect(problems[0]).toMatch(/"3\.9" isn't on page 1/);
  });
});

describe("a figure on its page", () => {
  // A paragraph beside a figure, its caption below; the box takes in the paragraph's end.
  const p = page(1, ["You see that the dots", "lie on a line Fig. 3.4"]);
  const caption = p.words.slice(-2);
  for (const w of caption) {
    w.y0 = 200;
    w.y1 = 210;
  }
  const para = item("1.1", ItemKind.Text, "You see that the dots lie on a line");
  it("snaps to its caption and finds the text it sits beside", () => {
    const fig = item("1.2", ItemKind.Figure, "A, B", {
      number: "Fig. 3.4",
      crop: [140, 95, 300, 190],
    });
    const placed = place(fig, p, [para, fig]);
    expect(placed?.caption.map((w) => w.text)).toEqual(["Fig.", "3.4"]);
    expect(placed?.box[3]).toBeGreaterThanOrEqual(210);
    expect(placed?.running.map((w) => w.text)).toContain("dots");
    expect(checkReading([para, fig], [p])).toEqual([]);
  });
  it("fails text in its box that nothing reads", () => {
    const fig = item("1.2", ItemKind.Figure, "A, B", {
      number: "Fig. 3.4",
      crop: [140, 95, 300, 190],
    });
    const problems = checkReading([item("1.1", ItemKind.Text, "You see"), fig], [p]);
    expect(problems.some((x) => /1\.2: the text layer has/.test(x))).toBe(true);
  });
  it("fails a figure with no caption near its box", () => {
    const fig = item("1.2", ItemKind.Figure, "", {
      number: "Fig. 3.4",
      crop: [400, 400, 450, 450],
    });
    expect(checkReading([para, fig], [p]).some((x) => /no caption/.test(x))).toBe(true);
  });
});

describe("nothing numbered is missed", () => {
  const pages = [page(1, ["See Fig. 3.1 and Fig.3.2 then Example 1"])];
  const numbered = [
    item("1", ItemKind.Section, "x", { number: "3.1" }),
    item("1.1", ItemKind.Figure, "", { number: "Fig. 3.1" }),
    item("1.2", ItemKind.Figure, "", { number: "Fig. 3.2" }),
    item("1.3", ItemKind.Example, "x", { number: "Example 1" }),
  ];
  it("passes when every printed number is an item's", () => {
    expect(checkNumbers(Locale.En, numbered, pages)).toEqual([]);
  });
  it("fails a printed number no item has", () => {
    expect(checkNumbers(Locale.En, numbered.slice(0, 2), pages)).toEqual([
      "page 1 prints figure 3.2; no item has it as its number",
      "page 1 prints example 1; no item has it as its number",
    ]);
  });
  it("fails numbers out of order, twice, or on the wrong kind", () => {
    const wrong = [
      item("1.1", ItemKind.Figure, "", { number: "Fig. 3.2" }),
      item("1.2", ItemKind.Figure, "", { number: "Fig. 3.1" }),
      item("1.3", ItemKind.Table, "", { number: "Fig. 3.1" }),
    ];
    const problems = checkNumbers(Locale.En, wrong, []);
    expect(problems.some((x) => /comes after/.test(x))).toBe(true);
    expect(problems.some((x) => /again/.test(x))).toBe(true);
    expect(problems.some((x) => /a table numbered as a figure/.test(x))).toBe(true);
  });
  it("reads each language's own words", () => {
    expect(parseNumber(Locale.Hi, "आकृति ३.११")).toEqual({ kind: ItemKind.Figure, digits: "3.11" });
    expect(scanNumbers(Locale.Hi, "देखिए आकृति 3.2 और उदाहरण 4")).toEqual([
      { kind: ItemKind.Figure, digits: "3.2" },
      { kind: ItemKind.Example, digits: "4" },
    ]);
    expect(parseNumber(Locale.En, "Q2")).toEqual({ kind: ItemKind.Question, digits: "2" });
    expect(scanNumbers(Locale.En, "Figures 3 and EXERCISE 3.1")).toEqual([
      { kind: ItemKind.Exercise, digits: "3.1" },
    ]);
  });
});

describe("terms are real", () => {
  const items = [item("2.7", ItemKind.Text, "is called the origin, and is denoted by O.")];
  it("passes a term in its item's words", () => {
    expect(checkTerms([{ term: "origin", item: "2.7" }], items)).toEqual([]);
  });
  it("fails a term not in its item, or an item there isn't", () => {
    expect(checkTerms([{ term: "abscissa", item: "2.7" }], items)).toEqual([
      `term "abscissa": not in 2.7's words`,
    ]);
    expect(checkTerms([{ term: "origin", item: "9.9" }], items)).toEqual([
      `term "origin": no item 9.9`,
    ]);
  });
});

describe("figures exist", () => {
  const fig = item("1.3", ItemKind.Figure, "", { crop: [0, 0, 10, 10] });
  it("passes a figure with its box and picture", () => {
    expect(checkFigures([fig], () => true)).toEqual([]);
  });
  it("fails a figure with no picture, or no box", () => {
    expect(checkFigures([fig], () => false)[0]).toMatch(/no figures\/1\.3\.png/);
    expect(checkFigures([item("1.4", ItemKind.Table, "")], () => true)[0]).toMatch(/no crop box/);
  });
});

describe("checkMatch", () => {
  const english = [
    item("1", ItemKind.Section, "Introduction", { number: "3.1" }),
    item("1.1", ItemKind.Figure, "", { number: "Fig. 3.1" }),
    item("1.2", ItemKind.Exercise, "", { number: "EXERCISE 3.1" }),
    item("1.2.1", ItemKind.Question, "Q", { number: "Q1" }),
  ];
  const hindi = [
    item("1", ItemKind.Section, "भूमिका", { number: "3.1" }),
    item("1.1", ItemKind.Figure, "", { number: "आकृति 3.1" }),
    item("1.2", ItemKind.Exercise, "", { number: "प्रश्नावली 3.1" }),
    item("1.2.1", ItemKind.Question, "प्र", { number: "Q1" }),
  ];
  it("matches by kind and digits, not words", () => {
    expect(checkMatch(Locale.Hi, hindi, english, {})).toEqual([]);
  });
  it("finds what one book numbers and the other doesn't, unless listed with why", () => {
    const less = hindi.filter((i) => i.id !== "1.1");
    expect(checkMatch(Locale.Hi, less, english, {})).toHaveLength(1);
    expect(checkMatch(Locale.Hi, less, english, { "figure 3.1": "drawn in the text" })).toEqual([]);
  });
  it("refuses an unmatched entry both books have", () => {
    expect(checkMatch(Locale.Hi, hindi, english, { "figure 3.1": "?" })).toHaveLength(1);
  });
});
