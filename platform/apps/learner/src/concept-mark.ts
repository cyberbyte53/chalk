import { Band, type ConceptProgress, type Mastery, isConceptDone } from "@chalk/learning";
import type { CourseConcept } from "./course";

/** How a concept stands for a learner, as one square. */
export const ConceptMark = {
  /** The learner model's band, once there is evidence. */
  Strong: "strong",
  Unsure: "unsure",
  Weak: "weak",
  /** Done, with nothing to measure it by (no graded question tests it). */
  Done: "done",
  Started: "started",
  None: "none",
} as const;
export type ConceptMark = (typeof ConceptMark)[keyof typeof ConceptMark];

const markOfBand: Readonly<Record<Band, ConceptMark>> = {
  [Band.Strong]: ConceptMark.Strong,
  [Band.Unsure]: ConceptMark.Unsure,
  [Band.Weak]: ConceptMark.Weak,
};

/** How well comes only from mastery; progress says only how far. */
export function conceptMark(
  concept: CourseConcept,
  progress: ConceptProgress | undefined,
  mastery: Mastery | undefined,
): ConceptMark {
  if (mastery !== undefined) return markOfBand[mastery.band];
  if (progress === undefined) return ConceptMark.None;
  return isConceptDone(progress, concept.hasPractice) ? ConceptMark.Done : ConceptMark.Started;
}
