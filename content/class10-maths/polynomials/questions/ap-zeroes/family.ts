import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/** NCERT Ex 2.4 Q3: the zeroes of x³ − 3x² + x + 1 are a − b, a and a + b. Find a and b. */
export const apZeroes = family({
  level: Level.Hard,
  tests: [Concept.CubicZeroes],
  params: z.object({ part: z.literal("both") }).strict(),
  build: (_p, b) => {
    const ask = choiceQuestion(b, {
      prompt: t(
        r`The zeroes of $x^3 - 3x^2 + x + 1$ are $a - b$, $a$ and $a + b$. What are $a$ and $b$?`,
        r`$x^3 - 3x^2 + x + 1$ के शून्यक $a - b$, $a$ और $a + b$ हैं। $a$ और $b$ क्या हैं?`,
      ),
      options: [
        { id: "right", label: t(r`$a = 1, \; b = \pm\sqrt{2}$`, r`$a = 1, \; b = \pm\sqrt{2}$`) },
        {
          id: "sum",
          label: t(r`$a = -1, \; b = \pm\sqrt{2}$`, r`$a = -1, \; b = \pm\sqrt{2}$`),
          feedback: t(
            r`The zeroes add to $3a$, and the sum is $-\frac{b}{a} = -\frac{-3}{1} = 3$. So $a = 1$.`,
            r`शून्यकों का योग $3a$ है, और योग $-\frac{b}{a} = -\frac{-3}{1} = 3$ है। तो $a = 1$।`,
          ),
        },
        {
          id: "product",
          label: t(r`$a = 1, \; b = \pm 2$`, r`$a = 1, \; b = \pm 2$`),
          feedback: t(
            r`The product is $(1 - b) \times 1 \times (1 + b) = 1 - b^2$, and it equals $-\frac{d}{a} = -1$. So $b^2 = 2$.`,
            r`गुणनफल $(1 - b) \times 1 \times (1 + b) = 1 - b^2$ है, और यह $-\frac{d}{a} = -1$ के बराबर है। तो $b^2 = 2$।`,
          ),
        },
      ],
      answer: "right",
    });
    return column([ask, space()]);
  },
});
