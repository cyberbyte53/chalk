import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choice } from "@chalk/patterns";
import { divide } from "@chalk/prop-primes";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/**
 * Divide a by b: which q and r? One option has a remainder of b or more (or, when q = 0, divides the
 * wrong way round), one swaps q and r (or, when they are equal, is one out in the remainder).
 * q = 0 (a < b) and r = 0 (b divides a) are both fine.
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
    const swappedLabel = pair(rem, q);
    // Swapping q and r is the usual slip; when that reads the same as the right pair (or the other
    // wrong one), the remainder is one out instead.
    const flipped: Option =
      rem !== q && swappedLabel !== tooFew.label.en
        ? {
            id: "flipped",
            label: t(swappedLabel, swappedLabel),
            feedback: t(
              r`That swaps them. The quotient is how many ${d}s fit in ${a}, and the remainder is what is left: $$${a} = ${d} \times ${q} + ${rem}$$`,
              r`इसमें दोनों उलट गए। भागफल यह है कि ${a} में कितने ${d} आते हैं, और शेषफल जो बचता है: $$${a} = ${d} \times ${q} + ${rem}$$`,
            ),
          }
        : {
            id: "offByOne",
            label: t(pair(q, rem + 1), pair(q, rem + 1)),
            feedback: t(
              r`Check it: $${d} \times ${q} + ${rem + 1} = ${d * q + rem + 1}$, not ${a}.`,
              r`जाँचो: $${d} \times ${q} + ${rem + 1} = ${d * q + rem + 1}$, ${a} नहीं।`,
            ),
          };
    const options: Option[] = [tooFew, flipped];
    const ask = choice(b, {
      prompt: t(
        r`Divide ${a} by ${d}. What are the quotient $q$ and the remainder $r$?`,
        r`${a} को ${d} से भाग दो। भागफल $q$ और शेषफल $r$ क्या हैं?`,
      ),
      right: t(pair(q, rem), pair(q, rem)),
      wrong: Object.fromEntries(options.map(({ id, ...o }) => [id, o])),
    });
    return [ask];
  },
});
