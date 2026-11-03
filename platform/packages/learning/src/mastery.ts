import { Level } from "@chalk/content";
import { z } from "zod";
import type { Attempt } from "./attempts";

/**
 * How well a learner understands each concept, from their attempts. Each model is one way of
 * working it out; its rows say which wrote them, so a new model can run beside the old. Whoever
 * reads mastery (the teacher view, the review scheduler, Jugnu) reads only these rows.
 *
 * Beta1: a Beta distribution per concept. Start: Beta(1, 1), nothing known (0.5, wide). Each first
 * try ever on a graded question adds to `right` or `wrong`, weighted by the question's level (a
 * hard question answered right says more than an easy one; an easy one answered wrong says more
 * than a hard one) and split across the concepts it tests. A first try is the cleanest evidence
 * (no retry, no Jugnu yet); later tries and help can come in as weaker evidence in a later model.
 */
export const MasteryModel = { Beta1: "beta-1" } as const;
export type MasteryModel = (typeof MasteryModel)[keyof typeof MasteryModel];

export const Band = { Strong: "strong", Unsure: "unsure", Weak: "weak" } as const;
export type Band = (typeof Band)[keyof typeof Band];

export const masterySchema = z.object({
  concept: z.string(),
  model: z.nativeEnum(MasteryModel),
  /** How likely they understand it, 0–1. */
  estimate: z.number(),
  /** How sure: an 80% interval around it. */
  low: z.number(),
  high: z.number(),
  /** Strong or weak only once the interval says so; else unsure. */
  band: z.nativeEnum(Band),
  /** Attempts that fed it. */
  tries: z.number().int(),
  /** The last of them, Unix ms. */
  lastAt: z.number(),
});
export type Mastery = z.infer<typeof masterySchema>;

/** How much one first try counts, by level. */
export const LEVEL_WEIGHT: Readonly<Record<Level, { right: number; wrong: number }>> = {
  [Level.Easy]: { right: 0.7, wrong: 1.3 },
  [Level.Medium]: { right: 1, wrong: 1 },
  [Level.Hard]: { right: 1.3, wrong: 0.7 },
};

/** The prior: one pseudo-try each way. */
const PRIOR = { right: 1, wrong: 1 } as const;
/** Strong once fairly sure it's above this; weak once fairly sure it's below that. */
const STRONG_ABOVE = 0.6;
const WEAK_BELOW = 0.5;
/** "Fairly sure": an 80% interval (z for the 10th/90th percentile). */
const Z80 = 1.2816;

/** Every concept with evidence, by one model; a concept without any has no row ("not yet"). */
export function masteryFrom(
  attempts: readonly Attempt[],
  model: MasteryModel = MasteryModel.Beta1,
): Mastery[] {
  switch (model) {
    case MasteryModel.Beta1:
      return beta1(attempts);
  }
}

function beta1(attempts: readonly Attempt[]): Mastery[] {
  const byConcept = new Map<
    string,
    { right: number; wrong: number; tries: number; lastAt: number }
  >();
  for (const a of attempts) {
    if (!a.isGraded || a.nth !== 1 || a.level === null || a.tests.length === 0) continue;
    const weight = LEVEL_WEIGHT[a.level];
    const share = 1 / a.tests.length;
    for (const concept of a.tests) {
      const c = byConcept.get(concept) ?? { ...PRIOR, tries: 0, lastAt: 0 };
      if (a.isRight) c.right += weight.right * share;
      else c.wrong += weight.wrong * share;
      c.tries += 1;
      c.lastAt = Math.max(c.lastAt, a.at);
      byConcept.set(concept, c);
    }
  }
  return [...byConcept].map(([concept, c]) => ({
    concept,
    model: MasteryModel.Beta1,
    ...betaOf(c.right, c.wrong),
    tries: c.tries,
    lastAt: c.lastAt,
  }));
}

/** A Beta's estimate, its 80% interval (normal approximation, clamped to 0–1) and its band. */
export function betaOf(
  right: number,
  wrong: number,
): Pick<Mastery, "estimate" | "low" | "high" | "band"> {
  const n = right + wrong;
  const estimate = right / n;
  const sd = Math.sqrt((right * wrong) / (n * n * (n + 1)));
  const low = Math.max(0, estimate - Z80 * sd);
  const high = Math.min(1, estimate + Z80 * sd);
  const band = low >= STRONG_ABOVE ? Band.Strong : high <= WEAK_BELOW ? Band.Weak : Band.Unsure;
  return { estimate, low, high, band };
}
