import { type ConceptProgress, isConceptDone } from "@chalk/api";
import type { CourseConcept } from "./course";

/** How a concept went, as one square. */
export const ConceptMark = {
  Strong: "strong",
  Shaky: "shaky",
  Weak: "weak",
  Started: "started",
  None: "none",
} as const;
export type ConceptMark = (typeof ConceptMark)[keyof typeof ConceptMark];

/** Practice right share at or above which a concept is strong, and below which it is weak. */
const STRONG = 0.7;
const WEAK = 0.4;

export function conceptMark(
  concept: CourseConcept,
  progress: ConceptProgress | undefined,
): ConceptMark {
  if (progress === undefined) return ConceptMark.None;
  if (!isConceptDone(progress, concept.hasPractice)) return ConceptMark.Started;
  const practice = progress.practice;
  if (practice === null || practice.of === 0) return ConceptMark.Strong;
  const share = practice.right / practice.of;
  return share >= STRONG
    ? ConceptMark.Strong
    : share >= WEAK
      ? ConceptMark.Shaky
      : ConceptMark.Weak;
}
