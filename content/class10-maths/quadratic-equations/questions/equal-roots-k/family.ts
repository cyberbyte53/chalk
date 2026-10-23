import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemQuestion, seedOf } from "../../kit";

const r = String.raw;
const m = (tex: string) => t(`$${tex}$`, `$${tex}$`);
const ask = (eq: string) =>
  t(`For which $k$ does $${eq}$ have two equal roots?`, `किस $k$ के लिए $${eq}$ के दो बराबर मूल हैं?`);
const pm = t(
  r`$k^2 = $ a positive number has two solutions: $k$ can be positive or negative.`,
  r`$k^2 = $ एक धनात्मक संख्या के दो हल होते हैं: $k$ धनात्मक या ऋणात्मक हो सकता है।`,
);

/** Exercise 4.4 Q2 and more like it: choose k so that D = 0. */
const items: Record<string, Item> = {
  q2i: {
    prompt: ask(r`2x^2 + kx + 3 = 0`),
    right: m(r`k = \pm 2\sqrt{6}`),
    wrong: [
      { label: m(r`k = 2\sqrt{6}`), why: pm },
      {
        label: m(r`k = \pm 24`),
        why: t(
          r`$D = k^2 - 24 = 0$ gives $k^2 = 24$, so $k = \pm\sqrt{24} = \pm 2\sqrt{6}$.`,
          r`$D = k^2 - 24 = 0$ से $k^2 = 24$, तो $k = \pm\sqrt{24} = \pm 2\sqrt{6}$।`,
        ),
      },
    ],
  },
  q2ii: {
    prompt: ask(r`kx(x - 2) + 6 = 0`),
    right: m(r`k = 6`),
    wrong: [
      {
        label: m(r`k = 0 \text{ or } k = 6`),
        why: t(
          r`$D = 4k^2 - 24k = 4k(k - 6)$, but $k = 0$ leaves no $x^2$ term: not a quadratic.`,
          r`$D = 4k^2 - 24k = 4k(k - 6)$, पर $k = 0$ पर $x^2$ वाला पद नहीं बचता: द्विघात नहीं।`,
        ),
      },
    ],
  },
  nine: {
    prompt: ask(r`x^2 - kx + 9 = 0`),
    right: m(r`k = \pm 6`),
    wrong: [
      { label: m(r`k = 6`), why: pm },
      {
        label: m(r`k = \pm 3`),
        why: t(r`$D = k^2 - 36 = 0$, so $k^2 = 36$.`, r`$D = k^2 - 36 = 0$, तो $k^2 = 36$।`),
      },
    ],
  },
  four: {
    prompt: ask(r`4x^2 + kx + 1 = 0`),
    right: m(r`k = \pm 4`),
    wrong: [
      { label: m(r`k = 4`), why: pm },
      {
        label: m(r`k = \pm 2`),
        why: t(r`$D = k^2 - 16 = 0$, so $k^2 = 16$.`, r`$D = k^2 - 16 = 0$, तो $k^2 = 16$।`),
      },
    ],
  },
  lead: {
    prompt: ask(r`kx^2 + 4x + 1 = 0`),
    right: m(r`k = 4`),
    wrong: [
      {
        label: m(r`k = \pm 4`),
        why: t(
          r`$D = 16 - 4k = 0$ is linear in $k$: just one value.`,
          r`$D = 16 - 4k = 0$, $k$ में रैखिक है: बस एक मान।`,
        ),
      },
      {
        label: m(r`k = 16`),
        why: t(
          r`$16 - 4k = 0$ gives $4k = 16$, so $k = 4$.`,
          r`$16 - 4k = 0$ से $4k = 16$, तो $k = 4$।`,
        ),
      },
    ],
  },
};
type Name = keyof typeof items;

/** Find k so that the equation has two equal roots (D = 0). */
export const equalRootsK = family({
  level: Level.Hard,
  tests: [Concept.NatureOfRoots],
  params: z.object({ item: z.enum(Object.keys(items) as [Name, ...Name[]]) }).strict(),
  build: ({ item }, b) => {
    const it = items[item];
    if (it === undefined) throw new Error(`no item ${item}`);
    return column([itemQuestion(b, it, seedOf(item)), space()]);
  },
});
