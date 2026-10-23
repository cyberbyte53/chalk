import { Mark } from "@chalk/api";
import { describe, expect, it } from "vitest";
import { ConceptMark, conceptMark } from "./concept-mark";
import type { CourseConcept } from "./course";

const concept = (hasPractice: boolean): CourseConcept => ({
  id: "c",
  hasPractice,
  title: { en: "C", hi: "C" },
  art: null,
  glyph: null,
  prereqs: [],
});
const practice = (right: number, of: number) => ({
  right,
  of,
  marks: Array.from({ length: of }, (_, i) => (i < right ? Mark.Right : Mark.Wrong)),
  at: 1,
});

describe("conceptMark", () => {
  it("shows how a concept went, from its practice", () => {
    expect(conceptMark(concept(true), undefined)).toBe(ConceptMark.None);
    expect(conceptMark(concept(true), { isLearnt: true, practice: null })).toBe(
      ConceptMark.Started,
    );
    expect(conceptMark(concept(false), { isLearnt: true, practice: null })).toBe(
      ConceptMark.Strong,
    );
    expect(conceptMark(concept(true), { isLearnt: true, practice: practice(8, 10) })).toBe(
      ConceptMark.Strong,
    );
    expect(conceptMark(concept(true), { isLearnt: true, practice: practice(5, 10) })).toBe(
      ConceptMark.Shaky,
    );
    expect(conceptMark(concept(true), { isLearnt: true, practice: practice(2, 10) })).toBe(
      ConceptMark.Weak,
    );
  });
});
