import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choice, primesTex } from "@chalk/patterns";
import { bagOf } from "@chalk/prop-primes";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/** Is √n rational? Exactly when every prime in n has an even count. */
export const isRootRational = family({
  level: Level.Easy,
  tests: [Concept.RootTwoIrrational],
  params: z.object({ n: z.number().int().min(2).max(999) }).strict(),
  build: ({ n }, b) => {
    const bag = bagOf(n);
    const odd = Object.keys(bag)
      .map(Number)
      .find((p) => (bag[p] ?? 0) % 2 === 1);
    const isRational = odd === undefined;
    const root = Math.round(Math.sqrt(n));
    const rational = {
      label: t("Rational", "परिमेय"),
      ...(isRational
        ? {}
        : {
            feedback: t(
              r`$${n} = ${primesTex(n)}$ has an odd number of ${odd}s. A square has an even count of every prime, so $a^2 = ${n}b^2$ can never balance.`,
              r`$${n} = ${primesTex(n)}$ में ${odd} विषम बार है। वर्ग में हर अभाज्य सम बार होता है, इसलिए $a^2 = ${n}b^2$ कभी बराबर नहीं हो सकता।`,
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
