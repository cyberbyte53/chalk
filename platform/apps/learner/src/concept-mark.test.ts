import { Band, type Mastery, MasteryModel } from "@chalk/learning";
import { describe, expect, it } from "vitest";
import { ConceptMark, conceptMark } from "./concept-mark";
import type { CourseConcept } from "./course";

const concept = (hasPractice: boolean): CourseConcept => ({
  id: "c",
  version: "v",
  hasPractice,
  title: { en: "C", hi: "C" },
  art: null,
  glyph: null,
  prereqs: [],
});
const mastery = (band: Band): Mastery => ({
  concept: "c",
  model: MasteryModel.Beta1,
  estimate: 0.5,
  low: 0.3,
  high: 0.7,
  band,
  tries: 3,
  lastAt: 1,
});

describe("conceptMark", () => {
  it("is the learner model's band whenever there is evidence", () => {
    expect(conceptMark(concept(true), undefined, mastery(Band.Strong))).toBe(ConceptMark.Strong);
    expect(conceptMark(concept(true), undefined, mastery(Band.Unsure))).toBe(ConceptMark.Unsure);
    expect(conceptMark(concept(true), undefined, mastery(Band.Weak))).toBe(ConceptMark.Weak);
  });

  it("without evidence, says only how far", () => {
    expect(conceptMark(concept(true), undefined, undefined)).toBe(ConceptMark.None);
    const pagesOnly = { isLearnt: true, practice: null };
    expect(conceptMark(concept(true), pagesOnly, undefined)).toBe(ConceptMark.Started);
    expect(conceptMark(concept(false), pagesOnly, undefined)).toBe(ConceptMark.Done);
  });
});
