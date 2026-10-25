import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { StickMeasureAction, stickMeasureDef } from "@chalk/prop-primes";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { euclidAsk } from "../euclid-hcf/family";

/**
 * HCF by Euclid's algorithm, with the lesson's ribbons beside it: the student may work it on paper
 * or lay and keep ribbons of the two lengths until nothing is left over. Jugnu may show a step; he
 * can't run them all (that shows the answer).
 */
export const euclidHcfRibbons = family({
  level: Level.Medium,
  tests: [Concept.EuclidAlgorithm],
  params: z.object({ a: z.number().int().min(2), b: z.number().int().min(2) }).strict(),
  build: ({ a, b: d }, b) => {
    const ask = euclidAsk(b, a, d);
    const ribbons = b.prop(stickMeasureDef, "ribbons", { stickA: a, stickB: d });
    b.standsFor(
      ribbons,
      `ribbons of ${a} and ${d}, for working Euclid's method if the student wants`,
    );
    b.witness(
      ribbons.learner(StickMeasureAction.Lay),
      ribbons.learner(StickMeasureAction.Keep),
      ribbons.learner(StickMeasureAction.Lay),
    );
    return [ask, ribbons];
  },
});
