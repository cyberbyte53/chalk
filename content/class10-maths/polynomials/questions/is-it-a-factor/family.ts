import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, parsePoly, settle } from "@chalk/patterns";
import {
  divisionSteps,
  longDivisionDef,
  polyTex,
  termsOf,
  termsTex,
} from "@chalk/prop-polynomials";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** Is g(x) a factor of p(x)? Divide and look at the remainder (NCERT Ex 2.3 Q2). */
export const isItAFactor = family({
  level: Level.Medium,
  tests: [Concept.DividingPolynomials, Concept.FindingOtherZeroes],
  params: z
    .object({ divisor: z.string(), dividend: z.string(), variable: z.string().regex(/^[a-z]$/) })
    .strict(),
  build: ({ divisor, dividend, variable: v }, b) => {
    const g = parsePoly(divisor);
    const p = parsePoly(dividend);
    const last = divisionSteps(p, g).at(-1);
    const remainder = last?.remaining ?? termsOf(p);
    const isFactor = remainder.length === 0;
    const r = termsTex(remainder, v);
    const ask = choiceQuestion(b, {
      prompt: t(
        `Is $${polyTex(g, v)}$ a factor of $${polyTex(p, v)}$? Divide to find out.`,
        `क्या $${polyTex(g, v)}$, $${polyTex(p, v)}$ का गुणनखंड है? भाग देकर पता करो।`,
      ),
      options: settle(
        [
          {
            id: "yes",
            label: t("Yes: the remainder is 0", "हाँ: शेषफल 0 है"),
            ...(isFactor
              ? {}
              : {
                  feedback: t(
                    `Finish the division: the remainder is $${r}$, not 0.`,
                    `भाग पूरा करो: शेषफल $${r}$ है, 0 नहीं।`,
                  ),
                }),
          },
          {
            id: "no",
            label: t("No: the remainder isn't 0", "नहीं: शेषफल 0 नहीं है"),
            ...(isFactor
              ? {
                  feedback: t(
                    "Divide all the way: what's left at the end is 0, so it divides exactly.",
                    "पूरा भाग दो: अंत में बचा हुआ 0 है, इसलिए यह पूरा-पूरा विभाजित करता है।",
                  ),
                }
              : {}),
          },
        ],
        p.length * 3 + g.length,
      ),
      answer: isFactor ? "yes" : "no",
    });
    return column([
      ask,
      b.prop(longDivisionDef, "division", { divisor: g, dividend: p, variable: v }),
      space(),
    ]);
  },
});
