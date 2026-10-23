import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, itemQuestion, seedOf } from "../../kit";

const r = String.raw;
const m = (tex: string) => t(`$${tex}$`, `$${tex}$`);
const ask = (eq: string) => t(`Solve $${eq}$.`, `$${eq}$ हल करो।`);
const both = t(
  "Both the positive and the negative square root work: write ± and solve each.",
  "धनात्मक और ऋणात्मक दोनों वर्गमूल चलते हैं: ± लिखो और दोनों हल करो।",
);
const root = t(
  "Undo the square by taking the square root of both sides, not by squaring or dividing.",
  "वर्ग हटाने के लिए दोनों पक्षों का वर्गमूल लो, वर्ग या भाग नहीं।",
);
const move = t(
  "After taking the square root, move the number in the bracket across: its sign changes.",
  "वर्गमूल लेने के बाद कोष्ठक की संख्या को दूसरी ओर ले जाओ: उसका चिह्न बदल जाता है।",
);

/** The last step of completing the square: a square equal to a number. */
const items: Record<string, Item> = {
  sunita: {
    prompt: ask(r`x^2 = 9`),
    right: m(r`x = 3 \text{ or } x = -3`),
    wrong: [
      { label: m(r`x = 3`), why: both },
      { label: m(r`x = 4.5`), why: root },
    ],
  },
  plus2: {
    prompt: ask(r`(x + 2)^2 = 9`),
    right: m(r`x = 1 \text{ or } x = -5`),
    wrong: [
      { label: m(r`x = 1`), why: both },
      { label: m(r`x = -1 \text{ or } x = 5`), why: move },
    ],
  },
  minus1: {
    prompt: ask(r`(x - 1)^2 = 16`),
    right: m(r`x = 5 \text{ or } x = -3`),
    wrong: [
      { label: m(r`x = 3 \text{ or } x = -5`), why: move },
      { label: m(r`x = 17`), why: root },
    ],
  },
  surd: {
    prompt: ask(r`(x + 2)^2 = 5`),
    right: m(r`x = -2 \pm \sqrt{5}`),
    wrong: [
      { label: m(r`x = 2 \pm \sqrt{5}`), why: move },
      { label: m(r`x = -2 \pm 5`), why: root },
    ],
  },
  quarter: {
    prompt: ask(r`\left(x - \tfrac{5}{4}\right)^2 = \tfrac{1}{16}`),
    right: m(r`x = \tfrac{3}{2} \text{ or } x = 1`),
    wrong: [
      { label: m(r`x = \tfrac{3}{2}`), why: both },
      { label: m(r`x = -1 \text{ or } x = -\tfrac{3}{2}`), why: move },
    ],
  },
  negative: {
    prompt: ask(r`(x + 3)^2 = -4`),
    right: t("No real roots", "कोई वास्तविक मूल नहीं"),
    wrong: [
      {
        label: m(r`x = -1 \text{ or } x = -5`),
        why: t(
          "Check: (−1 + 3)² = 4, not −4. No real number squares to a negative.",
          "जाँचो: (−1 + 3)² = 4 है, −4 नहीं। किसी वास्तविक संख्या का वर्ग ऋणात्मक नहीं होता।",
        ),
      },
    ],
  },
};
type Name = keyof typeof items;

/** Solve (x + p)² = q, the step completing the square ends on. */
export const squareRootStep = family({
  level: Level.Easy,
  tests: [Concept.CompletingTheSquare],
  params: z.object({ item: z.enum(Object.keys(items) as [Name, ...Name[]]) }).strict(),
  build: ({ item }, b) => {
    const it = items[item];
    if (it === undefined) throw new Error(`no item ${item}`);
    return column([itemQuestion(b, it, seedOf(item)), space()]);
  },
});
