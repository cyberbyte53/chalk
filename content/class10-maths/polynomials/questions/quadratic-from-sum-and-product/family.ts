import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, distinctOptions, exprTex, numberOf, settle } from "@chalk/patterns";
import { polyTex } from "@chalk/prop-polynomials";
import nerdamer from "nerdamer";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** k(x² − Sx + P), written out: nerdamer expands it exactly, surds and fractions included. */
function quadratic(k: number, sum: string, product: string): number[] {
  const expanded = nerdamer(`expand(${k}*(x^2 - (${sum})*x + (${product})))`);
  const coeffs = nerdamer(`coeffs(${expanded.toString()}, x)`);
  // coeffs lists the constant first; evaluate each (√2 → 1.414…) for writing the book's way.
  const low = coeffs
    .toString()
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((c) => numberOf(c.trim()));
  while (low.length < 3) low.push(0);
  return low.reverse();
}

/** A quadratic from the sum and product of its zeroes (NCERT Ex 2.2 Q2): x² − Sx + P, times k. */
export const quadraticFromSumAndProduct = family({
  level: Level.Medium,
  tests: [Concept.QuadraticFromZeroes],
  params: z
    .object({
      /** In nerdamer's syntax: "1/4", "sqrt(2)". */
      sum: z.string(),
      product: z.string(),
      /** The multiplier that clears fractions, as the book's answer uses. */
      k: z.number().int().min(1),
    })
    .strict(),
  build: ({ sum, product, k }, b) => {
    const show = (p: number[]) => t(`$${polyTex(p)}$`, `$${polyTex(p)}$`);
    const ask = choiceQuestion(b, {
      prompt: t(
        `Which quadratic has zeroes with sum $${exprTex(sum)}$ and product $${exprTex(product)}$?`,
        `किस द्विघात बहुपद के शून्यकों का योग $${exprTex(sum)}$ और गुणनफल $${exprTex(product)}$ है?`,
      ),
      options: settle(
        distinctOptions({ id: "right", label: show(quadratic(k, sum, product)) }, [
          {
            id: "sign",
            label: show(quadratic(k, `-(${sum})`, product)),
            feedback: t(
              "The $x$-term is **minus** the sum: $x^2 - Sx + P$.",
              "$x$ वाला पद योग का **ऋण** होता है: $x^2 - Sx + P$।",
            ),
          },
          {
            id: "swap",
            label: show(quadratic(k, product, sum)),
            feedback: t(
              "That swaps them: the sum goes with $x$, the product is the constant term.",
              "इसमें दोनों बदल गए: योग $x$ के साथ जाता है, गुणनफल अचर पद होता है।",
            ),
          },
          {
            id: "product-sign",
            label: show(quadratic(k, sum, `-(${product})`)),
            feedback: t(
              "The constant term is $+P$: $\\alpha\\beta = \\frac{c}{a}$ has no minus sign.",
              "अचर पद $+P$ होता है: $\\alpha\\beta = \\frac{c}{a}$ में ऋण चिह्न नहीं है।",
            ),
          },
        ]),
        k * 17 + sum.length * 5 + product.length,
      ),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
