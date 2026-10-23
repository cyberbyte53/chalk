import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemQuestion, seedOf } from "../../kit";

const r = String.raw;
const m = (tex: string) => t(`$${tex}$`, `$${tex}$`);
const ask = (eq: string) =>
  t(`Find the roots of $${eq}$ by factorising.`, `गुणनखंड करके $${eq}$ के मूल ज्ञात करो।`);
const signs = t(
  "Each root has the opposite sign to the number in its bracket: set each factor to 0 and solve.",
  "हर मूल का चिह्न उसके कोष्ठक की संख्या से उल्टा होता है: हर गुणनखंड को 0 रखकर हल करो।",
);
const splitNotRoots = t(
  "Those are the two numbers that split the middle term, not the roots. Finish factorising, then set each factor to 0.",
  "ये मध्य पद तोड़ने वाली संख्याएँ हैं, मूल नहीं। गुणनखंड पूरा करो, फिर हर गुणनखंड को 0 रखो।",
);

/** Exercise 4.2 Q1 and Examples 3, 4: the roots, with the usual slips as wrong answers. */
const items: Record<string, Item> = {
  q1i: {
    prompt: ask(r`x^2 - 3x - 10 = 0`),
    right: m(r`5 \text{ and } -2`),
    wrong: [{ label: m(r`-5 \text{ and } 2`), why: signs }],
  },
  q1ii: {
    prompt: ask(r`2x^2 + x - 6 = 0`),
    right: m(r`\tfrac{3}{2} \text{ and } -2`),
    wrong: [
      { label: m(r`-\tfrac{3}{2} \text{ and } 2`), why: signs },
      { label: m(r`4 \text{ and } -3`), why: splitNotRoots },
    ],
  },
  q1iii: {
    prompt: ask(r`\sqrt{2}x^2 + 7x + 5\sqrt{2} = 0`),
    right: m(r`-\tfrac{5}{\sqrt{2}} \text{ and } -\sqrt{2}`),
    wrong: [{ label: m(r`\tfrac{5}{\sqrt{2}} \text{ and } \sqrt{2}`), why: signs }],
  },
  q1iv: {
    prompt: ask(r`2x^2 - x + \tfrac{1}{8} = 0`),
    right: m(r`\tfrac{1}{4} \text{ and } \tfrac{1}{4}`),
    wrong: [
      {
        label: m(r`\tfrac{1}{4} \text{ and } -\tfrac{1}{4}`),
        why: t(
          r`Multiply by 8: $16x^2 - 8x + 1 = (4x - 1)^2$. Both factors give $\tfrac{1}{4}$.`,
          r`8 से गुणा करो: $16x^2 - 8x + 1 = (4x - 1)^2$। दोनों गुणनखंड $\tfrac{1}{4}$ देते हैं।`,
        ),
      },
    ],
  },
  q1v: {
    prompt: ask(r`100x^2 - 20x + 1 = 0`),
    right: m(r`\tfrac{1}{10} \text{ and } \tfrac{1}{10}`),
    wrong: [
      {
        label: m(r`10 \text{ and } 10`),
        why: t(
          r`$100x^2 - 20x + 1 = (10x - 1)^2$, and $10x - 1 = 0$ means $x = \tfrac{1}{10}$.`,
          r`$100x^2 - 20x + 1 = (10x - 1)^2$, और $10x - 1 = 0$ का अर्थ है $x = \tfrac{1}{10}$।`,
        ),
      },
    ],
  },
  ex3: {
    prompt: ask(r`2x^2 - 5x + 3 = 0`),
    right: m(r`1 \text{ and } \tfrac{3}{2}`),
    wrong: [
      { label: m(r`-2 \text{ and } -3`), why: splitNotRoots },
      { label: m(r`-1 \text{ and } -\tfrac{3}{2}`), why: signs },
    ],
  },
  ex4: {
    prompt: ask(r`6x^2 - x - 2 = 0`),
    right: m(r`\tfrac{2}{3} \text{ and } -\tfrac{1}{2}`),
    wrong: [
      { label: m(r`-\tfrac{2}{3} \text{ and } \tfrac{1}{2}`), why: signs },
      { label: m(r`-4 \text{ and } 3`), why: splitNotRoots },
    ],
  },
};
type Name = keyof typeof items;

/** Find the roots of a quadratic equation by factorising (Exercise 4.2 Q1). */
export const rootsByFactorising = family({
  level: Level.Medium,
  tests: [Concept.SolvingByFactorising],
  params: z.object({ item: z.enum(Object.keys(items) as [Name, ...Name[]]) }).strict(),
  build: ({ item }, b) => {
    const it = items[item];
    if (it === undefined) throw new Error(`no item ${item}`);
    return column([itemQuestion(b, it, seedOf(item)), space()]);
  },
});
