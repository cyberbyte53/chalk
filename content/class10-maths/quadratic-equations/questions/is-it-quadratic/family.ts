import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { itemQuestion, seedOf } from "../../kit";

const r = String.raw;

/** Exercise 4.1 Q1 and Example 2: the equation, and what it simplifies to. */
const items = {
  q1i: { eq: r`(x + 1)^2 = 2(x - 3)`, simple: r`x^2 + 7 = 0`, isQuadratic: true },
  q1ii: { eq: r`x^2 - 2x = (-2)(3 - x)`, simple: r`x^2 - 4x + 6 = 0`, isQuadratic: true },
  q1iii: { eq: r`(x - 2)(x + 1) = (x - 1)(x + 3)`, simple: r`-3x + 1 = 0`, isQuadratic: false },
  q1iv: { eq: r`(x - 3)(2x + 1) = x(x + 5)`, simple: r`x^2 - 10x - 3 = 0`, isQuadratic: true },
  q1v: { eq: r`(2x - 1)(x - 3) = (x + 5)(x - 1)`, simple: r`x^2 - 11x + 8 = 0`, isQuadratic: true },
  q1vi: { eq: r`x^2 + 3x + 1 = (x - 2)^2`, simple: r`7x - 3 = 0`, isQuadratic: false },
  q1vii: {
    eq: r`(x + 2)^3 = 2x(x^2 - 1)`,
    simple: r`x^3 - 6x^2 - 14x - 8 = 0`,
    isQuadratic: false,
  },
  q1viii: {
    eq: r`x^3 - 4x^2 - x + 1 = (x - 2)^3`,
    simple: r`2x^2 - 13x + 9 = 0`,
    isQuadratic: true,
  },
  ex2ii: { eq: r`x(x + 1) + 8 = (x + 2)(x - 2)`, simple: r`x + 12 = 0`, isQuadratic: false },
  ex2iv: { eq: r`(x + 2)^3 = x^3 - 4`, simple: r`x^2 + 2x + 2 = 0`, isQuadratic: true },
} as const;
type Name = keyof typeof items;

/** Decide whether an equation is quadratic, after simplifying it. */
export const isItQuadratic = family({
  level: Level.Easy,
  tests: [Concept.WhatIsAQuadraticEquation],
  params: z.object({ item: z.enum(Object.keys(items) as [Name, ...Name[]]) }).strict(),
  build: ({ item }, b) => {
    const it = items[item];
    const yes = t("Yes, it is quadratic", "हाँ, यह द्विघात है");
    const no = t("No, it is not quadratic", "नहीं, यह द्विघात नहीं है");
    const why = t(
      `Expand both sides and move everything to one side: $${it.simple}$. ${it.isQuadratic ? "Its highest power of x is 2." : "Its highest power of x is not 2."}`,
      `दोनों पक्ष खोलो और सब कुछ एक ओर ले जाओ: $${it.simple}$। ${it.isQuadratic ? "इसमें x की सबसे बड़ी घात 2 है।" : "इसमें x की सबसे बड़ी घात 2 नहीं है।"}`,
    );
    const ask = itemQuestion(
      b,
      {
        prompt: t(`Is $${it.eq}$ a quadratic equation?`, `क्या $${it.eq}$ एक द्विघात समीकरण है?`),
        right: it.isQuadratic ? yes : no,
        wrong: [{ label: it.isQuadratic ? no : yes, why }],
      },
      seedOf(item),
    );
    return column([ask, space()]);
  },
});
