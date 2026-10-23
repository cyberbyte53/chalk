import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemQuestion, seedOf } from "../../kit";

const r = String.raw;
const m = (tex: string) => t(`$${tex}$`, `$${tex}$`);
const ask = (eq: string) =>
  t(
    `Use the quadratic formula on $${eq}$. What are its roots?`,
    `$${eq}$ पर द्विघाती सूत्र लगाओ। इसके मूल क्या हैं?`,
  );
const minusB = t(
  r`The formula starts with $-b$: if $b$ is negative, $-b$ is positive.`,
  r`सूत्र $-b$ से शुरू होता है: अगर $b$ ऋणात्मक है, तो $-b$ धनात्मक है।`,
);
const twoA = t(
  r`Divide the whole top by $2a$, not by $a$ or by 2.`,
  r`पूरे ऊपरी भाग को $2a$ से भाग दो, $a$ या 2 से नहीं।`,
);
const none = (d: string) =>
  t(
    `Here $b^2 - 4ac = ${d}$, which is negative, so there are no real roots.`,
    `यहाँ $b^2 - 4ac = ${d}$, जो ऋणात्मक है, तो कोई वास्तविक मूल नहीं।`,
  );

/** Exercise 4.3 Q2 and Examples 10, 11, 13: roots by the formula. */
const items: Record<string, Item> = {
  q2i: {
    prompt: ask(r`2x^2 - 7x + 3 = 0`),
    right: m(r`3 \text{ and } \tfrac{1}{2}`),
    wrong: [
      { label: m(r`-3 \text{ and } -\tfrac{1}{2}`), why: minusB },
      { label: m(r`6 \text{ and } 1`), why: twoA },
    ],
  },
  q2ii: {
    prompt: ask(r`2x^2 + x - 4 = 0`),
    right: m(r`\dfrac{-1 \pm \sqrt{33}}{4}`),
    wrong: [
      {
        label: m(r`\dfrac{-1 \pm \sqrt{31}}{4}`),
        why: t(
          r`$b^2 - 4ac = 1 - 4 \times 2 \times (-4) = 1 + 32 = 33$: minus a negative is plus.`,
          r`$b^2 - 4ac = 1 - 4 \times 2 \times (-4) = 1 + 32 = 33$: ऋण का ऋण धन होता है।`,
        ),
      },
      { label: m(r`\dfrac{-1 \pm \sqrt{33}}{2}`), why: twoA },
    ],
  },
  q2iii: {
    prompt: ask(r`4x^2 + 4\sqrt{3}x + 3 = 0`),
    right: m(r`-\tfrac{\sqrt{3}}{2} \text{ and } -\tfrac{\sqrt{3}}{2}`),
    wrong: [
      { label: m(r`\tfrac{\sqrt{3}}{2} \text{ and } \tfrac{\sqrt{3}}{2}`), why: minusB },
      {
        label: t("No real roots", "कोई वास्तविक मूल नहीं"),
        why: t(
          r`$b^2 - 4ac = 48 - 48 = 0$, not negative.`,
          r`$b^2 - 4ac = 48 - 48 = 0$, ऋणात्मक नहीं।`,
        ),
      },
    ],
  },
  q2iv: {
    prompt: ask(r`2x^2 + x + 4 = 0`),
    right: t("No real roots", "कोई वास्तविक मूल नहीं"),
    wrong: [{ label: m(r`\dfrac{-1 \pm \sqrt{33}}{4}`), why: none("1 - 32 = -31") }],
  },
  ex13i: {
    prompt: ask(r`3x^2 - 5x + 2 = 0`),
    right: m(r`1 \text{ and } \tfrac{2}{3}`),
    wrong: [
      { label: m(r`-1 \text{ and } -\tfrac{2}{3}`), why: minusB },
      { label: m(r`2 \text{ and } \tfrac{4}{3}`), why: twoA },
    ],
  },
  ex13ii: {
    prompt: ask(r`x^2 + 4x + 5 = 0`),
    right: t("No real roots", "कोई वास्तविक मूल नहीं"),
    wrong: [{ label: m(r`-2 \pm 1`), why: none("16 - 20 = -4") }],
  },
  ex11: {
    prompt: ask(r`x^2 + 2x - 143 = 0`),
    right: m(r`11 \text{ and } -13`),
    wrong: [
      { label: m(r`-11 \text{ and } 13`), why: minusB },
      { label: m(r`22 \text{ and } -26`), why: twoA },
    ],
  },
};
type Name = keyof typeof items;

/** Find the roots with the quadratic formula, or show there are none. */
export const formulaRoots = family({
  level: Level.Medium,
  tests: [Concept.QuadraticFormula],
  params: z.object({ item: z.enum(Object.keys(items) as [Name, ...Name[]]) }).strict(),
  build: ({ item }, b) => {
    const it = items[item];
    if (it === undefined) throw new Error(`no item ${item}`);
    return column([itemQuestion(b, it, seedOf(item)), space()]);
  },
});
