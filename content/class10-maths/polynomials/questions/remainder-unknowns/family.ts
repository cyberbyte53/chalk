import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/** NCERT Ex 2.4 Q5: dividing x⁴ − 6x³ + 16x² − 25x + 10 by x² − 2x + k leaves x + a. Find k and a. */
export const remainderUnknowns = family({
  level: Level.Hard,
  tests: [Concept.DividingPolynomials],
  params: z.object({ part: z.literal("both") }).strict(),
  build: (_p, b) => {
    const why = t(
      r`Divide with $k$ left as a letter. The remainder comes out as $(2k - 9)x + (k^2 - 8k + 10)$. Match it with $x + a$: $2k - 9 = 1$, so $k = 5$, and then $a = 25 - 40 + 10 = -5$.`,
      r`$k$ को अक्षर रहने देकर भाग दो। शेषफल $(2k - 9)x + (k^2 - 8k + 10)$ आता है। इसे $x + a$ से मिलाओ: $2k - 9 = 1$, तो $k = 5$, और फिर $a = 25 - 40 + 10 = -5$।`,
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        r`Dividing $x^4 - 6x^3 + 16x^2 - 25x + 10$ by $x^2 - 2x + k$ leaves the remainder $x + a$. What are $k$ and $a$?`,
        r`$x^4 - 6x^3 + 16x^2 - 25x + 10$ को $x^2 - 2x + k$ से भाग देने पर शेषफल $x + a$ बचता है। $k$ और $a$ क्या हैं?`,
      ),
      options: [
        { id: "right", label: t(r`$k = 5, \; a = -5$`, r`$k = 5, \; a = -5$`) },
        { id: "sign", label: t(r`$k = 5, \; a = 5$`, r`$k = 5, \; a = 5$`), feedback: why },
        { id: "swap", label: t(r`$k = -5, \; a = 5$`, r`$k = -5, \; a = 5$`), feedback: why },
      ],
      answer: "right",
    });
    return column([ask, space()]);
  },
});
