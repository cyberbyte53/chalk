import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion, primesTex } from "@chalk/content-source/patterns";
import { bagOf } from "@chalk/prop-primes";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/** Can kⁿ end in 0? Exactly when k's bag holds a 2 and a 5 (NCERT Example 5, Ex 1.2 Q5). */
export const endsInZero = family({
  level: Level.Easy,
  tests: [Concept.FundamentalTheorem],
  params: z.object({ base: z.number().int().min(2).max(99) }).strict(),
  build: ({ base }, b) => {
    const bag = bagOf(base);
    const hasTwo = (bag[2] ?? 0) > 0;
    const hasFive = (bag[5] ?? 0) > 0;
    const can = hasTwo && hasFive;
    const missing = hasTwo ? "5" : hasFive ? "2" : "2 or 5";
    const hiMissing = hasTwo ? "5" : hasFive ? "2" : "2 या 5";
    const why = t(
      r`$${base} = ${primesTex(base)}$, so $${base}^n$ has only these primes, and no ${missing} ever appears. Ending in 0 needs both a 2 and a 5.`,
      r`$${base} = ${primesTex(base)}$, इसलिए $${base}^n$ में केवल यही अभाज्य हैं, और कोई ${hiMissing} कभी नहीं आता। 0 पर ख़त्म होने के लिए 2 और 5 दोनों चाहिए।`,
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        r`Can $${base}^n$ end with the digit 0 for some natural number $n$?`,
        r`क्या किसी प्राकृत संख्या $n$ के लिए $${base}^n$ का अंतिम अंक 0 हो सकता है?`,
      ),
      options: [
        {
          id: "yes",
          label: t("Yes", "हाँ"),
          ...(can ? {} : { feedback: why }),
        },
        {
          id: "no",
          label: t("No", "नहीं"),
          ...(can
            ? {
                feedback: t(
                  r`$${base} = ${primesTex(base)}$ has a 2 and a 5, so 10 divides $${base}^n$ for every $n$.`,
                  r`$${base} = ${primesTex(base)}$ में 2 और 5 दोनों हैं, इसलिए हर $n$ के लिए 10, $${base}^n$ को विभाजित करता है।`,
                ),
              }
            : {}),
        },
      ],
      answer: can ? "yes" : "no",
    });
    return column([ask, space()]);
  },
});
