import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, distinctOptions, parsePoly, settle } from "@chalk/patterns";
import { niceNumber } from "@chalk/prop-polynomials";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** The sum or the product of a quadratic's zeroes from its coefficients: −b/a and c/a. */
export const sumAndProduct = family({
  level: Level.Medium,
  tests: [Concept.ZeroesAndCoefficients],
  params: z
    .object({
      coefficients: z.string(),
      /** As the book prints it, in LaTeX (maybe not in standard form). */
      written: z.string(),
      ask: z.enum(["sum", "product"]),
    })
    .strict(),
  build: ({ coefficients, written, ask: which }, b) => {
    const [a = 1, bb = 0, c = 0] = parsePoly(coefficients);
    const m = (x: number) => `$${niceNumber(x).tex}$`;
    const opt = (x: number) => t(m(x), m(x));
    const sum = -bb / a;
    const product = c / a;
    const isSum = which === "sum";
    const right = isSum ? sum : product;
    const ask = choiceQuestion(b, {
      prompt: isSum
        ? t(`What is the sum of the zeroes of $${written}$?`, `$${written}$ के शून्यकों का योग क्या है?`)
        : t(
            `What is the product of the zeroes of $${written}$?`,
            `$${written}$ के शून्यकों का गुणनफल क्या है?`,
          ),
      options: settle(
        distinctOptions({ id: "right", label: opt(right) }, [
          {
            id: "sign",
            label: opt(-right),
            feedback: isSum
              ? t(
                  `The sum is $-\\frac{b}{a}$: with $b = ${bb}$ and $a = ${a}$ that is ${m(sum)}. Read $b$ with its sign, from the standard form.`,
                  `योग $-\\frac{b}{a}$ है: $b = ${bb}$ और $a = ${a}$ के साथ यह ${m(sum)} है। $b$ को उसके चिह्न सहित, मानक रूप से पढ़ो।`,
                )
              : t(
                  `The product is $\\frac{c}{a}$, with no minus sign: $\\frac{${c}}{${a}}$.`,
                  `गुणनफल $\\frac{c}{a}$ है, बिना ऋण चिह्न के: $\\frac{${c}}{${a}}$।`,
                ),
          },
          {
            id: "other",
            label: opt(isSum ? product : sum),
            feedback: isSum
              ? t(
                  "That is $\\frac{c}{a}$, the **product** of the zeroes.",
                  "वह $\\frac{c}{a}$ है, शून्यकों का **गुणनफल**।",
                )
              : t(
                  "That is $-\\frac{b}{a}$, the **sum** of the zeroes.",
                  "वह $-\\frac{b}{a}$ है, शून्यकों का **योग**।",
                ),
          },
          {
            id: "upside",
            label: opt(isSum ? -a / (bb || 1) : a / (c || 1)),
            feedback: t(
              "Divide by $a$, the coefficient of the square term: it goes underneath.",
              "वर्ग वाले पद के गुणांक $a$ से भाग दो: वह नीचे जाता है।",
            ),
          },
        ]),
        a * 13 + bb * 7 + c + (isSum ? 1 : 2),
      ),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
