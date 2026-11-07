import { Locale } from "@chalk/content";
import { describe, expect, it } from "vitest";
import { checkAttached, checkMain, suggest } from "./concepts";
import { Cause, type Item, ItemKind, type MainConcepts } from "./schema";

const item = (id: string, kind: ItemKind, text: string, number?: string): Item => ({
  id,
  kind,
  page: 1,
  text,
  ...(number === undefined ? {} : { number }),
});

const en = {
  lang: Locale.En,
  dir: "",
  items: [
    item("1", ItemKind.Section, "5.1 Mixtures", "5.1"),
    item("1.1", ItemKind.Text, "A solution is a homogeneous mixture."),
    item("1.2", ItemKind.Figure, "Fig. 5.1: A solution of salt.", "Fig. 5.1"),
  ],
  terms: [{ term: "solution", item: "1.1" }],
};
const hi = {
  lang: Locale.Hi,
  dir: "",
  items: [
    item("1", ItemKind.Section, "5.1 मिश्रण", "5.1"),
    item("1.1", ItemKind.Text, "विलयन (solution) एक समांगी मिश्रण है।"),
    item("1.2", ItemKind.Figure, "चित्र 5.1: नमक का विलयन।", "चित्र 5.1"),
  ],
  terms: [{ term: "विलयन", item: "1.1", en: "solution" }],
};
const main: MainConcepts = {
  concepts: [
    {
      key: "solution-is-homogeneous",
      concept: "A solution is a homogeneous mixture.",
      terms: ["solution"],
      items: ["1.1", "1.2"],
    },
  ],
};

describe("the main book's concepts", () => {
  it("hold when each term is printed in its items and every set-apart term is placed", () => {
    expect(checkMain(main, en)).toEqual([]);
  });
  it("find a term not printed in its items, and a set-apart term in no concept", () => {
    const wrong: MainConcepts = {
      concepts: [{ key: "k", concept: "c", terms: ["suspension"], items: ["1.1"] }],
    };
    const problems = checkMain(wrong, en);
    expect(problems.some((p) => p.includes(`"suspension" isn't printed`))).toBe(true);
    expect(problems.some((p) => p.includes(`sets apart "solution"`))).toBe(true);
    expect(checkMain({ ...wrong, answers: { solution: "a word only" } }, en)).toHaveLength(1);
  });
});

describe("attaching a book to the main one", () => {
  const s = suggest(main, en, hi);
  it("suggests the paired numbered items, the paired section, and the term printed beside the main word", () => {
    expect(s).toEqual([
      { key: "solution-is-homogeneous", items: ["1.2"], sections: ["1"], terms: ["विलयन"] },
    ]);
  });
  it("holds when every main concept is attached in the book's own words", () => {
    const attached = {
      concepts: [
        {
          key: "solution-is-homogeneous",
          concept: "विलयन एक समांगी मिश्रण है।",
          terms: ["विलयन"],
          items: ["1.1", "1.2"],
        },
      ],
    };
    expect(checkAttached(attached, main, hi, s)).toEqual([]);
  });
  it("asks for a cause when a suggestion is left out, and for every main concept", () => {
    const leaves = {
      concepts: [
        { key: "solution-is-homogeneous", concept: "विलयन", terms: ["विलयन"], items: ["1.1"] },
      ],
    };
    expect(checkAttached(leaves, main, hi, s)).toEqual([
      "concept solution-is-homogeneous: leaves out what the tool suggested (1.2): give the cause",
    ]);
    const caused = {
      concepts: [{ ...leaves.concepts[0], cause: Cause.WrongPlace }],
    } as Parameters<typeof checkAttached>[0];
    expect(checkAttached(caused, main, hi, s)).toEqual([]);
    expect(checkAttached({ concepts: [] }, main, hi, s)[0]).toContain("not attached");
    const absent = { concepts: [{ key: "solution-is-homogeneous", absent: "not taught" }] };
    expect(checkAttached(absent, main, hi, s)).toEqual([
      `hi: the book sets apart "विलयन", in no concept: add it to one, or answer it under answers with why`,
    ]);
  });
});
