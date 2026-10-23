import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemQuestion, seedOf } from "../../kit";

const r = String.raw;
const abc = (a: string, b: string, c: string) =>
  t(`$a = ${a},\\ b = ${b},\\ c = ${c}$`, `$a = ${a},\\ b = ${b},\\ c = ${c}$`);
const ask = (eq: string) =>
  t(
    `Before using the formula on $${eq}$, what are $a$, $b$ and $c$?`,
    `$${eq}$ पर सूत्र लगाने से पहले, $a$, $b$ और $c$ क्या हैं?`,
  );
const order = t(
  r`Put it in standard form $ax^2 + bx + c = 0$ first: $a$ goes with $x^2$, $b$ with $x$, and $c$ is the number.`,
  r`पहले इसे मानक रूप $ax^2 + bx + c = 0$ में लाओ: $a$, $x^2$ के साथ है, $b$, $x$ के साथ, और $c$ अकेली संख्या है।`,
);
const sign = t(
  "The sign in front of a term is part of its coefficient.",
  "किसी पद के आगे का चिह्न उसके गुणांक का हिस्सा है।",
);
const side = t(
  "Everything must be on one side, with 0 on the other, before you read off a, b, c.",
  "a, b, c पढ़ने से पहले सब कुछ एक ओर हो, दूसरी ओर 0।",
);

/** Read a, b, c correctly, from equations not written in standard form. */
const items: Record<string, Item> = {
  mixed: {
    prompt: ask(r`4x - 3x^2 + 2 = 0`),
    right: abc("-3", "4", "2"),
    wrong: [
      { label: abc("4", "-3", "2"), why: order },
      { label: abc("3", "4", "2"), why: sign },
    ],
  },
  noX: {
    prompt: ask(r`1 - x^2 + 300 = 0`),
    right: abc("-1", "0", "301"),
    wrong: [
      { label: abc("1", "0", "301"), why: sign },
      {
        label: abc("-1", "1", "300"),
        why: t(
          r`There is no $x$ term, so $b = 0$; and $1 + 300 = 301$ is the number.`,
          r`$x$ वाला पद नहीं है, तो $b = 0$; और संख्या $1 + 300 = 301$ है।`,
        ),
      },
    ],
  },
  noC: {
    prompt: ask(r`x^2 = 5x`),
    right: abc("1", "-5", "0"),
    wrong: [
      { label: abc("1", "5", "0"), why: side },
      { label: abc("1", "0", "-5"), why: order },
    ],
  },
  plot: {
    prompt: ask(r`2x^2 + x = 528`),
    right: abc("2", "1", "-528"),
    wrong: [
      { label: abc("2", "1", "528"), why: side },
      {
        label: abc("2", "0", "-528"),
        why: t(r`$x$ means $1x$, so $b = 1$.`, r`$x$ का अर्थ $1x$ है, तो $b = 1$।`),
      },
    ],
  },
  toys: {
    prompt: ask(r`x^2 - 55x + 750 = 0`),
    right: abc("1", "-55", "750"),
    wrong: [{ label: abc("1", "55", "750"), why: sign }],
  },
};
type Name = keyof typeof items;

/** Identify a, b, c (with their signs) before using the formula. */
export const identifyAbc = family({
  level: Level.Easy,
  tests: [Concept.QuadraticFormula],
  params: z.object({ item: z.enum(Object.keys(items) as [Name, ...Name[]]) }).strict(),
  build: ({ item }, b) => {
    const it = items[item];
    if (it === undefined) throw new Error(`no item ${item}`);
    return column([itemQuestion(b, it, seedOf(item)), space()]);
  },
});
