import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, distinctOptions, settle } from "@chalk/patterns";
import { niceNumber, polyTex } from "@chalk/prop-polynomials";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** The zero of ax + b is −b/a: where the line meets the x-axis. */
export const zeroOfALine = family({
  level: Level.Easy,
  tests: [Concept.ValueAndZeroes],
  params: z.object({ a: z.number().int(), b: z.number().int() }).strict(),
  build: ({ a, b: c }, b) => {
    if (a === 0) throw new Error("a must not be 0");
    const m = (x: number) => `$${niceNumber(x).tex}$`;
    const ask = choiceQuestion(b, {
      prompt: t(
        `Where does the graph of $y = ${polyTex([a, c])}$ meet the $x$-axis? At $x =$`,
        `$y = ${polyTex([a, c])}$ का ग्राफ़ $x$-अक्ष से कहाँ मिलता है? $x =$`,
      ),
      options: settle(
        distinctOptions({ id: "right", label: t(m(-c / a), m(-c / a)) }, [
          {
            id: "sign",
            label: t(m(c / a), m(c / a)),
            feedback: t(
              `Solve $${polyTex([a, c])} = 0$: $${a}x = ${-c}$, so the sign of $b$ flips.`,
              `$${polyTex([a, c])} = 0$ हल करो: $${a}x = ${-c}$, इसलिए $b$ का चिह्न बदलता है।`,
            ),
          },
          {
            id: "swap",
            label: t(m(-a / c), m(-a / c)),
            feedback: t(
              "Divide by the coefficient of $x$: the zero is $-\\frac{b}{a}$, not $-\\frac{a}{b}$.",
              "$x$ के गुणांक से भाग दो: शून्यक $-\\frac{b}{a}$ है, $-\\frac{a}{b}$ नहीं।",
            ),
          },
          {
            id: "intercept",
            label: t(m(c), m(c)),
            feedback: t(
              "That is where the line meets the $y$-axis, $p(0)$. On the $x$-axis, $y = 0$.",
              "वह वह बिंदु है जहाँ रेखा $y$-अक्ष से मिलती है, $p(0)$। $x$-अक्ष पर $y = 0$ होता है।",
            ),
          },
        ]),
        a * 31 + c,
      ),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
