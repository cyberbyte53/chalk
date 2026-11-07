import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { type NumberedPage, numberPage } from "../read";
import { candidates, isCandidate, plain } from "./candidates";
import { hindiWords } from "./list";
import type { ProofReading, ProofWord } from "./make-proof-fixture";
import { Left, repair } from "./repair";
import { pageSpans } from "./spans";

describe("candidates", () => {
  it.each([
    [["स््थथूल"], "स्थूल"],
    [["मेें"], "में"],
    [["सूक्षष्मदर्शी"], "सूक्ष्मदर्शी"],
    [["अध््‍ययाय"], "अध्याय"],
    [["संरचनाओ", "ं"], "संरचनाओं"],
    [["घ", "ं", "ु", "डी"], "घुंडी"],
    [["के", "वल"], "केवल"],
    [["ॠतु"], "ऋतु"],
    [["काॅलेज"], "कॉलेज"],
    [["अामाप"], "आमाप"],
    [["क�म"], "कम"],
    [["पाश्‍वर्"], "पार्श्व"],
    [["िलिपड"], "लिपिड"],
  ])("%j can be read %s", (span, reading) => {
    expect(candidates(span)).toContain(reading);
    expect(isCandidate(span, reading)).toBe(true);
  });

  it("keeps each double or collapses it: real doubles exist", () => {
    expect(candidates(["अध्ययन"])).toEqual(expect.arrayContaining(["अध्ययन", "अध्यन"]));
    expect(candidates(["संतति"])).toEqual(expect.arrayContaining(["संतति", "संति"]));
  });

  it("keeps a space between pieces, or joins them", () => {
    expect(candidates(["कै", "मिलो"])).toEqual(["कै मिलो", "कैमिलो"]);
  });

  it("never makes what the letters don't allow", () => {
    expect(isCandidate(["इधन"], "ईंधन")).toBe(false);
    expect(isCandidate(["मेें"], "मैं")).toBe(false);
    expect(candidates(["सेे"])).toEqual(["से"]);
  });
});

describe("repair", () => {
  it("repairs a span when exactly one candidate is all real words", () => {
    expect(repair(["स््थथूल"])).toEqual({ reading: "स्थूल" });
    expect(repair(["घ", "ं", "ु", "डी"])).toEqual({ reading: "घुंडी" });
  });
  it("leaves it when several are, or none", () => {
    expect(repair(["तत््व"])).toEqual({ left: Left.Several, readings: ["तत्व", "त्व"] });
    expect(repair(["अल््पपरासारी"])).toMatchObject({ left: Left.None });
  });
  it("reads a span as one word: a space it keeps is the agent's to judge", () => {
    expect(repair(["कै", "मिलो"])).toMatchObject({ left: Left.None, nearest: "कैमिलो" });
  });
  it("takes a book's own words beside the list", () => {
    const words = hindiWords();
    const isWord = (w: string) => words.has(w) || w === "अल्पपरासारी";
    expect(repair(["अल््पपरासारी"], isWord)).toEqual({ reading: "अल्पपरासारी" });
  });
});

/** The proof chapter (Hindi science, chapter 5): its readings, the agent's, are the key. */
const fixture = parse(readFileSync(join(import.meta.dirname, "proof.fixture.yaml"), "utf8")) as {
  readings: ProofReading[];
  unread: ProofWord[];
};

const Outcome = {
  Right: "repaired right",
  Wrong: "repaired wrong",
  Several: "left, several real",
  None: "left, none real",
  Unreachable: "unreachable",
} as const;
type Outcome = (typeof Outcome)[keyof typeof Outcome];

const started = performance.now();
const outcomes = fixture.readings.map(([page, span, pdf, reading]) => {
  const key = plain(reading);
  const r = repair(pdf);
  const reachable = isCandidate(pdf, reading);
  const outcome: Outcome = !reachable
    ? Outcome.Unreachable
    : "reading" in r
      ? r.reading === key
        ? Outcome.Right
        : Outcome.Wrong
      : r.left === Left.Several
        ? Outcome.Several
        : Outcome.None;
  return { page, span, pdf, key, repair: r, outcome };
});
const perSpan = (performance.now() - started) / fixture.readings.length;
const count = (o: Outcome) => outcomes.filter((x) => x.outcome === o).length;
const unreachable = outcomes.filter((x) => x.outcome === Outcome.Unreachable);
const changed = fixture.unread
  .map(([page, id, pdf]) => ({ page, id, pdf, repair: repair([pdf]) }))
  .filter((x) => "reading" in x.repair && x.repair.reading !== plain(x.pdf));

console.log(
  [
    `Hindi repair on the proof chapter's ${fixture.readings.length} readings (${perSpan.toFixed(2)} ms a span, check included):`,
    ...Object.values(Outcome).map((o) => `  ${o}: ${count(o)}`),
    "  unreachable, the key not a candidate:",
    ...unreachable.map((x) => `    page ${x.page} ${x.span}: ${JSON.stringify(x.pdf)} → ${x.key}`),
    `Its ${fixture.unread.length} other Hindi words: ${changed.length} would change:`,
    ...[
      ...new Set(changed.map((x) => `${x.pdf} → ${"reading" in x.repair ? x.repair.reading : ""}`)),
    ].map((c) => `    ${c}`),
  ].join("\n"),
);

describe(`the proof chapter's ${fixture.readings.length} Hindi readings`, () => {
  it(`repairs ${count(Outcome.Right)} right and ${count(Outcome.Wrong)} wrong`, () => {
    expect(outcomes.filter((x) => x.outcome === Outcome.Wrong)).toEqual([]);
    expect(count(Outcome.Right)).toBeGreaterThanOrEqual(2163);
  });
  it(`leaves ${count(Outcome.Several) + count(Outcome.None)} (${count(Outcome.Several)} several, ${count(Outcome.None)} none)`, () => {
    expect(count(Outcome.Several) + count(Outcome.None)).toBeLessThanOrEqual(179);
  });
  it(`can't reach ${unreachable.length}: the PDF lost letters or scrambled them`, () => {
    expect(unreachable.length).toBeLessThanOrEqual(14);
  });
  it(`takes ${perSpan.toFixed(2)} ms a span`, () => {
    expect(perSpan).toBeLessThan(10);
  });
  it(`changes ${changed.length} of the ${fixture.unread.length} unread words, each to what the page shows`, () => {
    // The running heads and footers no agent read (कोशिका— जीवन की निर्माण इकाई, अध्याय 5,
    // अन्वेषण | कक्षा 9), checked against the page images.
    const made = new Set(
      changed.map((x) => `${x.pdf} → ${"reading" in x.repair ? x.repair.reading : ""}`),
    );
    expect([...made].sort()).toEqual(
      [
        "अध््ययाय → अध्याय",
        "अध््‍ययाय → अध्याय",
        "निर््माण → निर्माण",
        "निर््ममाण → निर्माण",
        "अन््‍ववेषण → अन्वेषण",
      ].sort(),
    );
  });

  /** The keys of the wrong collapses, and what collapsing too much makes of them. */
  const overCollapsed: [string, string][] = [
    ["अध्ययन", "अध्यन"],
    ["प्ररूपी", "प्रूपी"],
    ["तत्व", "त्व"],
    ["अल्पपरासारी", "अल्परासारी"],
    ["पूर्वविद्यमान", "पूर्विद्यमान"],
    ["पूर्णशक्तता", "पूर्णशक्ता"],
  ];
  it.each(overCollapsed)("never repairs %s to %s", (word, wrong) => {
    const spans = [
      ...outcomes.filter((x) => x.key === word).map((x) => x.pdf),
      ...fixture.unread.filter(([, , pdf]) => pdf === word).map(([, , pdf]) => [pdf]),
    ];
    expect(spans.length).toBeGreaterThan(0);
    for (const span of spans) expect(repair(span)).not.toEqual({ reading: wrong });
  });

  it.each(["संतति", "प्रसंस्करण", "संबंधित", "घुंडी"])(
    "has %s among its span's candidates, wherever the page prints it",
    (word) => {
      const spans = outcomes.filter((x) => x.key === word);
      expect(spans.length).toBeGreaterThan(0);
      for (const x of spans) expect(isCandidate(x.pdf, word)).toBe(true);
    },
  );
});

describe("a page's spans, found from where its pieces sit", () => {
  /** A line of pieces, each `[text, x0, x1]`, all at one height. */
  const line = (...pieces: [string, number, number][]): NumberedPage =>
    numberPage({
      page: 1,
      width: 500,
      height: 700,
      words: pieces.map(([text, x0, x1]) => ({ text, x0, y0: 100, x1, y1: 112 })),
    });
  const read = (page: NumberedPage) =>
    pageSpans(page).map((s) => ("reading" in s.repair ? s.repair.reading : s.pdf.join(" ")));

  it("joins pieces that touch, a mark's point inside its word measured from the run's edge", () => {
    expect(read(line(["अन", 50, 60], ["भ", 60, 65], ["ु", 62, 62], ["व", 65.3, 70]))).toEqual([
      "अनुभव",
    ]);
    expect(read(line(["स", 50, 55], ["ग", 55, 60], ["ु", 57, 57], ["म", 60.2, 66]))).toEqual([
      "सुगम",
    ]);
    expect(read(line(["झ", 50, 56], ["ड", 56, 62], ["ं", 59, 59], ["े", 62, 64]))).toEqual(["झंडे"]);
  });
  it("never joins across a gap: the PDF's own words stay split", () => {
    const spans = pageSpans(line(["पर", 50, 60], ["बल", 62.4, 72]));
    expect(spans.map((s) => s.ids)).toEqual([["L1.1"], ["L1.2"]]);
    expect(read(line(["पर", 50, 60], ["बल", 62.4, 72]))).toEqual(["पर", "बल"]);
  });
  it("joins pieces the PDF numbered as two lines when they touch at one height", () => {
    const w = (text: string, x0: number, x1: number) => ({ text, x0, y0: 100, x1, y1: 112 });
    const lines = [
      [w("स", 50, 55), w("त", 55, 60)],
      [w("ं", 57, 57), w("लित", 60.2, 70), w("ु", 66, 66)],
    ];
    const page: NumberedPage = { page: 1, width: 500, height: 700, lines, words: new Map() };
    expect(read(page)).toEqual(["संतुलित"]);
    // The next line of a paragraph starts further left, below: never joined.
    const below = [[w("पर", 50, 60)], [{ ...w("बल", 20, 30), y0: 116, y1: 128 }]];
    expect(read({ ...page, lines: below })).toEqual(["पर", "बल"]);
  });
  it("leaves a word written twice over for the reader, never collapsed to half (प्लेटलेट)", () => {
    expect("left" in (pageSpans(line(["प्लेटलेट", 50, 80]))[0]?.repair ?? {})).toBe(true);
  });
  it("keeps a run without Hindi as the PDF gives it", () => {
    expect(pageSpans(line(["(10X,", 50, 70]))).toEqual([
      { ids: ["L1.1"], pdf: ["(10X,"], repair: { reading: "(10X," } },
    ]);
  });
});
