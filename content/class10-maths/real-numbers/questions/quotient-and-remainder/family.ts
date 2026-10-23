import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { divide } from "@chalk/prop-primes";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/**
 * Divide a by b: which q and r? One option has a remainder of b or more (or, when q = 0, divides the
 * wrong way round), one a negative remainder. q = 0 (a < b) and r = 0 (b divides a) are both fine.
 */
export const quotientAndRemainder = family({
  level: Level.Easy,
  tests: [Concept.DivisionLemma],
  params: z.object({ a: z.number().int().min(2), b: z.number().int().min(2) }).strict(),
  build: ({ a, b: d }, b) => {
    const { q, r: rem } = divide(a, d);
    const pair = (qq: number, rr: number) => r`$q = ${qq}, \; r = ${rr}$`;
    // With q = 0 there is no row to take back, so the second wrong pair divides the wrong way round.
    const tooFew: Option =
      q >= 1
        ? {
            id: "big",
            label: t(pair(q - 1, rem + d), pair(q - 1, rem + d)),
            feedback: t(
              r`$${d} \times ${q - 1} + ${rem + d} = ${a}$ is true, but the remainder must be less than ${d}: ${rem + d} holds one more ${d}.`,
              r`$${d} \times ${q - 1} + ${rem + d} = ${a}$ सही है, पर शेषफल ${d} से कम होना चाहिए: ${rem + d} में एक और ${d} आ जाता है।`,
            ),
          }
        : {
            id: "swapped",
            label: t(pair(Math.floor(d / a), d % a), pair(Math.floor(d / a), d % a)),
            feedback: t(
              r`That divides ${d} by ${a}. Here ${a} is divided by ${d}: ${d} goes into ${a} zero times, so $q = 0$ and $r = ${a}$.`,
              r`यह ${d} को ${a} से भाग देता है। यहाँ ${a} को ${d} से भाग देना है: ${d}, ${a} में शून्य बार जाता है, इसलिए $q = 0$ और $r = ${a}$।`,
            ),
          };
    const options: Option[] = [
      { id: "right", label: t(pair(q, rem), pair(q, rem)) },
      tooFew,
      {
        id: "negative",
        label: t(pair(q + 1, rem - d), pair(q + 1, rem - d)),
        feedback: t(
          r`$${d} \times ${q + 1} = ${d * (q + 1)}$ is more than ${a}, and a remainder can't be negative.`,
          r`$${d} \times ${q + 1} = ${d * (q + 1)}$, ${a} से ज़्यादा है, और शेषफल ऋणात्मक नहीं हो सकता।`,
        ),
      },
    ];
    const ask = choiceQuestion(b, {
      prompt: t(
        r`Divide ${a} by ${d}. What are the quotient $q$ and the remainder $r$?`,
        r`${a} को ${d} से भाग दो। भागफल $q$ और शेषफल $r$ क्या हैं?`,
      ),
      options: settle(options, a * 31 + d),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
