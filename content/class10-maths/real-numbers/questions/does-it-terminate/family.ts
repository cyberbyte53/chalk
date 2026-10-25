import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choice, frac, primesTex } from "@chalk/patterns";
import { bagOf, gcd } from "@chalk/prop-primes";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/** Without dividing: does p/q terminate? (NCERT Ex 1.4 Q1) Lowest terms first, then q's primes. */
export const doesItTerminate = family({
  level: Level.Easy,
  tests: [Concept.WhichFractionsEnd],
  params: z.object({ p: z.number().int().min(1), q: z.number().int().min(2) }).strict(),
  build: ({ p, q }, b) => {
    const g = gcd(p, q);
    const lowQ = q / g;
    const bag = bagOf(lowQ);
    const others = Object.keys(bag)
      .map(Number)
      .filter((x) => x !== 2 && x !== 5);
    const ends = others.length === 0;
    const reduced = g > 1 ? r`$${frac(p, q)} = ${frac(p / g, lowQ)}$ in lowest terms, and ` : "";
    const hiReduced = g > 1 ? r`न्यूनतम पदों में $${frac(p, q)} = ${frac(p / g, lowQ)}$, और ` : "";
    const qText = lowQ === 1 ? "1" : primesTex(lowQ);
    const yes = {
      label: t("Yes, it terminates", "हाँ, सांत है"),
      ...(ends
        ? {}
        : {
            feedback: t(
              r`${reduced}$${lowQ} = ${qText}$ has a ${others[0]}: it can't be paired into tens, so the decimal doesn't terminate.`,
              r`${hiReduced}$${lowQ} = ${qText}$ में एक ${others[0]} है: उसकी दहाई वाली जोड़ी नहीं बन सकती, इसलिए दशमलव कभी सांत नहीं होता।`,
            ),
          }),
    };
    const no = {
      label: t("No, it repeats", "नहीं, आवर्ती है"),
      ...(ends
        ? {
            feedback: t(
              g > 1 && Object.keys(bagOf(q)).some((x) => x !== "2" && x !== "5")
                ? r`Lowest terms first: $${frac(p, q)} = ${frac(p / g, lowQ)}$, and $${lowQ} = ${qText}$ has only 2s and 5s.`
                : r`$${lowQ} = ${qText}$ has only 2s and 5s, so it can be topped up to a power of 10.`,
              g > 1 && Object.keys(bagOf(q)).some((x) => x !== "2" && x !== "5")
                ? r`पहले न्यूनतम पद: $${frac(p, q)} = ${frac(p / g, lowQ)}$, और $${lowQ} = ${qText}$ में केवल 2 और 5 हैं।`
                : r`$${lowQ} = ${qText}$ में केवल 2 और 5 हैं, इसलिए इसे 10 की घात तक पूरा किया जा सकता है।`,
            ),
          }
        : {}),
    };
    const ask = choice(b, {
      prompt: t(
        r`Without long division: does $${frac(p, q)}$ have a terminating decimal expansion?`,
        r`लंबा भाग किए बिना: क्या $${frac(p, q)}$ का दशमलव प्रसार सांत है?`,
      ),
      right: ends ? yes.label : no.label,
      wrong: ends ? { no } : { yes },
    });
    return [ask];
  },
});
