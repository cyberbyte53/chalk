import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choice } from "@chalk/patterns";
import { bagOf } from "@chalk/prop-primes";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/**
 * Is √n rational? Rational when n is a perfect square. Otherwise n = s² × m with m prime, and the
 * reason is the one the chapter teaches: the √2 proof with m in place of 2, and (when s > 1)
 * √n = s√m, a non-zero rational times an irrational.
 */
export const isRootRational = family({
  level: Level.Easy,
  tests: [Concept.RootTwoIrrational],
  params: z.object({ n: z.number().int().min(2).max(999) }).strict(),
  build: ({ n }, b) => {
    const bag = bagOf(n);
    const odd = Object.keys(bag)
      .map(Number)
      .filter((p) => (bag[p] ?? 0) % 2 === 1);
    const isRational = odd.length === 0;
    if (odd.length > 1)
      throw new Error("pick n = s² × a prime: the chapter proves √p only for a prime p");
    const m = odd[0] ?? 1;
    const s = Math.round(Math.sqrt(n / m));
    const root = Math.round(Math.sqrt(n));
    const proof = {
      en: r`Use the proof for $\sqrt{2}$ with ${m} in place of 2: if $\sqrt{${m}} = \frac{a}{b}$ in lowest terms, then $${m}b^2 = a^2$, so ${m} divides $a$, and then $b$ too. But $a$ and $b$ share no factor, so $\sqrt{${m}}$ is irrational.`,
      hi: r`$\sqrt{2}$ वाली उपपत्ति में 2 की जगह ${m} रखो: अगर न्यूनतम रूप में $\sqrt{${m}} = \frac{a}{b}$, तो $${m}b^2 = a^2$, तो ${m}, $a$ को भाग देता है, और फिर $b$ को भी। पर $a$ और $b$ का कोई साझा गुणनखंड नहीं, तो $\sqrt{${m}}$ अपरिमेय है।`,
    };
    const rational = {
      label: t("Rational", "परिमेय"),
      ...(isRational
        ? {}
        : {
            feedback:
              s === 1
                ? t(proof.en, proof.hi)
                : t(
                    r`$\sqrt{${n}} = \sqrt{${s * s} \times ${m}} = ${s}\sqrt{${m}}$. $\sqrt{${m}}$ is irrational (the proof for $\sqrt{2}$ works with the prime ${m}), and ${s} times an irrational is irrational. So $\sqrt{${n}}$ is irrational.`,
                    r`$\sqrt{${n}} = \sqrt{${s * s} \times ${m}} = ${s}\sqrt{${m}}$। $\sqrt{${m}}$ अपरिमेय है ($\sqrt{2}$ वाली उपपत्ति अभाज्य ${m} के साथ भी चलती है), और ${s} गुणा अपरिमेय, अपरिमेय होता है। तो $\sqrt{${n}}$ अपरिमेय है।`,
                  ),
          }),
    };
    const irrational = {
      label: t("Irrational", "अपरिमेय"),
      ...(isRational
        ? {
            feedback: t(
              r`$${n} = ${root}^2$, so $\sqrt{${n}} = ${root}$, a whole number.`,
              r`$${n} = ${root}^2$, इसलिए $\sqrt{${n}} = ${root}$, एक पूर्ण संख्या।`,
            ),
          }
        : {}),
    };
    const ask = choice(b, {
      prompt: t(r`Is $\sqrt{${n}}$ rational or irrational?`, r`$\sqrt{${n}}$ परिमेय है या अपरिमेय?`),
      right: isRational ? rational.label : irrational.label,
      wrong: isRational ? { irrational } : { rational },
    });
    return [ask];
  },
});
