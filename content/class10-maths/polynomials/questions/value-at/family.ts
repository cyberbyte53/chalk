import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, distinctOptions, settle } from "@chalk/patterns";
import { niceNumber, polyTex, valueAt } from "@chalk/prop-polynomials";

const clean = (x: number) => Math.round(x * 1e9) / 1e9 + 0;
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** p(k), worked a wrong way: each term's power and sign handled by `term`. */
function valueWith(p: readonly number[], term: (c: number, power: number) => number): number {
  const n = p.length - 1;
  return clean(p.reduce((sum, c, i) => sum + term(c, n - i), 0));
}

/** The value p(k) (NCERT 2.1), with the usual slips as options: signs with a negative k, powers, the constant. */
export const valueAtK = family({
  level: Level.Easy,
  tests: [Concept.ValueAndZeroes],
  params: z
    .object({
      /** Highest power first, space-separated: "1 -3 -4". */
      coefficients: z.string(),
      k: z.number(),
      name: z
        .string()
        .regex(/^[a-z]$/)
        .optional(),
      variable: z
        .string()
        .regex(/^[a-z]$/)
        .optional(),
    })
    .strict(),
  build: ({ coefficients, k, name = "p", variable = "x" }, b) => {
    const p = coefficients.split(/\s+/).map(Number);
    const m = (x: number) => `$${niceNumber(x).tex}$`;
    const right = clean(valueAt(p, k));
    const wrong: { id: string; value: number; feedback: ReturnType<typeof t> }[] =
      k < 0
        ? [
            {
              id: "square",
              value: valueWith(p, (c, n) =>
                n >= 2 && n % 2 === 0 ? -c * Math.abs(k) ** n : c * k ** n,
              ),
              feedback: t(
                `A negative number squared is positive: $(${niceNumber(k).tex})^2 = ${niceNumber(k * k).tex}$.`,
                `ऋणात्मक संख्या का वर्ग धनात्मक होता है: $(${niceNumber(k).tex})^2 = ${niceNumber(k * k).tex}$।`,
              ),
            },
            {
              id: "times",
              value: valueWith(p, (c, n) => (n % 2 === 1 ? -c * k ** n : c * k ** n)),
              feedback: t(
                "A negative times a negative is positive: check the sign of each term.",
                "ऋणात्मक गुणा ऋणात्मक धनात्मक होता है: हर पद का चिह्न जाँचो।",
              ),
            },
          ]
        : [
            {
              id: "constant",
              value: valueWith(p, (c, n) => (n === 0 ? 0 : c * k ** n)),
              feedback: t("Don't forget the number on its own.", "अकेली संख्या मत भूलो।"),
            },
            {
              id: "powers",
              value: valueWith(p, (c, n) => (n === 0 ? c : c * k * n)),
              feedback: t(
                `Work out the powers first: $${variable}^2$ means $${variable} \\times ${variable}$.`,
                `पहले घातें निकालो: $${variable}^2$ का अर्थ $${variable} \\times ${variable}$ है।`,
              ),
            },
          ];
    if (k < 0 && p.length > 3)
      wrong.unshift({
        id: "cube",
        value: valueWith(p, (c, n) => (n >= 3 && n % 2 === 1 ? c * Math.abs(k) ** n : c * k ** n)),
        feedback: t(
          `A negative number cubed stays negative: $(${niceNumber(k).tex})^3 = ${niceNumber(k ** 3).tex}$.`,
          `ऋणात्मक संख्या का घन ऋणात्मक ही रहता है: $(${niceNumber(k).tex})^3 = ${niceNumber(k ** 3).tex}$।`,
        ),
      });
    const last = p.at(-1) ?? 0;
    wrong.push(
      last !== 0
        ? {
            id: "flip",
            value: clean(right - 2 * last),
            feedback: t("Check the sign of the number on its own.", "अकेली संख्या का चिह्न जाँचो।"),
          }
        : {
            id: "negate",
            value: clean(-right),
            feedback: t(
              "Check the sign of each term as you add them up.",
              "जोड़ते समय हर पद का चिह्न जाँचो।",
            ),
          },
    );
    if (k < 0)
      wrong.push({
        id: "constant",
        value: valueWith(p, (c, n) => (n === 0 ? 0 : c * k ** n)),
        feedback: t("Don't forget the number on its own.", "अकेली संख्या मत भूलो।"),
      });
    const ask = choiceQuestion(b, {
      prompt: t(
        `$${name}(${variable}) = ${polyTex(p, variable)}$. What is $${name}(${niceNumber(k).tex})$?`,
        `$${name}(${variable}) = ${polyTex(p, variable)}$। $${name}(${niceNumber(k).tex})$ क्या है?`,
      ),
      options: settle(
        distinctOptions(
          { id: "right", label: t(m(right), m(right)) },
          wrong
            .filter((w) => w.value !== right)
            .map((w) => ({ id: w.id, label: t(m(w.value), m(w.value)), feedback: w.feedback })),
        ),
        Math.round(k * 7 + p.length * 13 + right),
      ),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
