import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemQuestion, seedOf } from "../../kit";

const r = String.raw;
const m = (tex: string) => t(`$${tex}$`, `$${tex}$`);
const ask = (eq: string, not: string) =>
  t(
    `Clear the denominators in $${eq}$ (with $${not}$). Which quadratic equation do you get?`,
    `$${eq}$ में हर हटाओ ($${not}$ के साथ)। कौन-सा द्विघात समीकरण मिलता है?`,
  );
const every = t(
  "Multiply **every** term by the denominators, including the number on its own.",
  "**हर** पद को हरों से गुणा करो, अकेली संख्या को भी।",
);
const moveAll = t(
  "Move everything to one side carefully: each term changes sign as it crosses.",
  "ध्यान से सब कुछ एक ओर ले जाओ: पार करते हुए हर पद का चिह्न बदलता है।",
);

/** Equations with x in a denominator (Example 14, Exercise 4.3 Q3, Q4). */
const items: Record<string, Item> = {
  ex14i: {
    prompt: ask(r`x + \frac{1}{x} = 3`, r`x \neq 0`),
    right: m(r`x^2 - 3x + 1 = 0`),
    wrong: [
      { label: m(r`x^2 - 3 = 0`), why: every },
      { label: m(r`x^2 + 3x + 1 = 0`), why: moveAll },
    ],
  },
  q3i: {
    prompt: ask(r`x - \frac{1}{x} = 3`, r`x \neq 0`),
    right: m(r`x^2 - 3x - 1 = 0`),
    wrong: [
      { label: m(r`x^2 - 3x + 1 = 0`), why: moveAll },
      { label: m(r`x^2 - 4 = 0`), why: every },
    ],
  },
  ex14ii: {
    prompt: ask(r`\frac{1}{x} - \frac{1}{x - 2} = 3`, r`x \neq 0, 2`),
    right: m(r`3x^2 - 6x + 2 = 0`),
    wrong: [
      { label: m(r`3x^2 - 6x - 2 = 0`), why: moveAll },
      { label: m(r`x^2 - 2x - 2 = 0`), why: every },
    ],
  },
  q3ii: {
    prompt: ask(r`\frac{1}{x + 4} - \frac{1}{x - 7} = \frac{11}{30}`, r`x \neq -4, 7`),
    right: m(r`x^2 - 3x + 2 = 0`),
    wrong: [
      { label: m(r`x^2 - 3x - 58 = 0`), why: moveAll },
      { label: m(r`x^2 + 3x + 2 = 0`), why: moveAll },
    ],
  },
  rehman: {
    prompt: ask(r`\frac{1}{x - 3} + \frac{1}{x + 5} = \frac{1}{3}`, r`x \neq 3, -5`),
    right: m(r`x^2 - 4x - 21 = 0`),
    wrong: [
      { label: m(r`x^2 + 2x - 15 = 0`), why: every },
      { label: m(r`x^2 - 4x + 21 = 0`), why: moveAll },
    ],
  },
};
type Name = keyof typeof items;

/** Turn an equation with x in a denominator into a quadratic equation. */
export const reduceToQuadratic = family({
  level: Level.Medium,
  tests: [Concept.WordProblems],
  params: z.object({ item: z.enum(Object.keys(items) as [Name, ...Name[]]) }).strict(),
  build: ({ item }, b) => {
    const it = items[item];
    if (it === undefined) throw new Error(`no item ${item}`);
    return column([itemQuestion(b, it, seedOf(item)), space()]);
  },
});
