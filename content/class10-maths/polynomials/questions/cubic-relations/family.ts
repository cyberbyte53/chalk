import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, distinctOptions, parsePoly, settle } from "@chalk/content-source/patterns";
import { niceNumber, polyTex } from "@chalk/prop-polynomials";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const ASKED = {
  sum: { en: "the sum of its zeroes", hi: "इसके शून्यकों का योग" },
  pairs: {
    en: "the sum of the products of its zeroes taken two at a time",
    hi: "इसके शून्यकों के दो-दो के गुणनफलों का योग",
  },
  product: { en: "the product of its zeroes", hi: "इसके शून्यकों का गुणनफल" },
} as const;

/** −b/a, c/a and −d/a for a cubic (NCERT Example 5, Ex 2.4 Q1). */
export const cubicRelations = family({
  level: Level.Hard,
  tests: [Concept.CubicZeroes],
  params: z.object({ coefficients: z.string(), ask: z.enum(["sum", "pairs", "product"]) }).strict(),
  build: ({ coefficients, ask: which }, b) => {
    const [a = 1, bb = 0, c = 0, d = 0] = parsePoly(coefficients);
    const values = { sum: -bb / a, pairs: c / a, product: -d / a };
    const right = values[which];
    const m = (x: number) => `$${niceNumber(x).tex}$`;
    const opt = (x: number) => t(m(x), m(x));
    const others = (Object.keys(values) as (keyof typeof values)[]).filter((k) => k !== which);
    const ask = choiceQuestion(b, {
      prompt: t(
        `For $${polyTex([a, bb, c, d])}$, what is ${ASKED[which].en}?`,
        `$${polyTex([a, bb, c, d])}$ के लिए, ${ASKED[which].hi} क्या है?`,
      ),
      options: settle(
        distinctOptions({ id: "right", label: opt(right) }, [
          {
            id: "sign",
            label: opt(-right),
            feedback: t(
              "Check the sign: $-\\frac{b}{a}$, $\\frac{c}{a}$, $-\\frac{d}{a}$. The signs alternate.",
              "चिह्न जाँचो: $-\\frac{b}{a}$, $\\frac{c}{a}$, $-\\frac{d}{a}$। चिह्न बारी-बारी से बदलते हैं।",
            ),
          },
          ...others.map((k) => ({
            id: k,
            label: opt(values[k]),
            feedback: t(`That is ${ASKED[k].en}.`, `वह ${ASKED[k].hi} है।`),
          })),
        ]),
        a * 11 + bb * 5 + c * 3 + d + which.length,
      ),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
