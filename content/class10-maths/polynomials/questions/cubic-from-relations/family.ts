import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, distinctOptions, settle } from "@chalk/patterns";
import { polyTex } from "@chalk/prop-polynomials";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** A cubic from its zeroes' sum, pairs and product (NCERT Ex 2.4 Q2): x³ − Sx² + Qx − P. */
export const cubicFromRelations = family({
  level: Level.Hard,
  tests: [Concept.CubicZeroes],
  params: z.object({ sum: z.number(), pairs: z.number(), product: z.number() }).strict(),
  build: ({ sum, pairs, product }, b) => {
    const show = (p: number[]) => t(`$${polyTex(p)}$`, `$${polyTex(p)}$`);
    const ask = choiceQuestion(b, {
      prompt: t(
        `A cubic's zeroes add to $${sum}$, their pairs add to $${pairs}$, and their product is $${product}$. Which cubic is it?`,
        `एक त्रिघात बहुपद के शून्यकों का योग $${sum}$, जोड़ों का योग $${pairs}$, और गुणनफल $${product}$ है। कौन-सा त्रिघात बहुपद है?`,
      ),
      options: settle(
        distinctOptions({ id: "right", label: show([1, -sum, pairs, -product]) }, [
          {
            id: "signs",
            label: show([1, sum, pairs, product]),
            feedback: t(
              "The $x^2$-coefficient is minus the sum, and the number on its own is minus the product.",
              "$x^2$ का गुणांक योग का ऋण है, और अकेली संख्या गुणनफल का ऋण है।",
            ),
          },
          {
            id: "pairs",
            label: show([1, -sum, -pairs, -product]),
            feedback: t(
              "The pairs sum keeps its sign: $\\alpha\\beta + \\beta\\gamma + \\gamma\\alpha = \\frac{c}{a}$.",
              "जोड़ों का योग अपना चिह्न रखता है: $\\alpha\\beta + \\beta\\gamma + \\gamma\\alpha = \\frac{c}{a}$।",
            ),
          },
          {
            id: "product",
            label: show([1, -sum, pairs, product]),
            feedback: t(
              "The number on its own is **minus** the product: $\\alpha\\beta\\gamma = -\\frac{d}{a}$.",
              "अकेली संख्या गुणनफल का **ऋण** है: $\\alpha\\beta\\gamma = -\\frac{d}{a}$।",
            ),
          },
        ]),
        sum * 11 + pairs * 7 + product,
      ),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
