import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Kind = { Ends: "ends", Repeats: "repeats", Never: "never" } as const;

/** Read a decimal backwards (NCERT Ex 1.4 Q3): rational or not, and what q's primes must be. */
export const kindOfDecimal = family({
  level: Level.Medium,
  tests: [Concept.WhichFractionsEnd],
  params: z
    .object({
      /** The decimal as LaTeX: "43.123456789", "0.\\overline{142857}", "0.1010010001\\ldots" */
      decimal: z.string().min(1),
      kind: z.nativeEnum(Kind),
    })
    .strict(),
  build: ({ decimal, kind }, b) => {
    const ask = choiceQuestion(b, {
      prompt: t(
        `What kind of number is $${decimal}$? If it is rational, $\\frac{p}{q}$ in lowest terms, what can you say about $q$?`,
        `$${decimal}$ किस प्रकार की संख्या है? यदि यह परिमेय है, $\\frac{p}{q}$ न्यूनतम पदों में, तो $q$ के बारे में क्या कह सकते हो?`,
      ),
      options: [
        {
          id: Kind.Ends,
          label: t("Rational; q has only 2s and 5s", "परिमेय; q में केवल 2 और 5"),
          ...(kind === Kind.Ends
            ? {}
            : {
                feedback: t(
                  "With only 2s and 5s in q the decimal would terminate. This one doesn't.",
                  "q में केवल 2 और 5 होते तो दशमलव सांत होता। यह सांत नहीं है।",
                ),
              }),
        },
        {
          id: Kind.Repeats,
          label: t(
            "Rational; q has a prime other than 2 and 5",
            "परिमेय; q में 2 और 5 के अलावा कोई अभाज्य",
          ),
          ...(kind === Kind.Repeats
            ? {}
            : {
                feedback:
                  kind === Kind.Ends
                    ? t(
                        "It terminates, so it is a fraction over a power of 10: q has only 2s and 5s.",
                        "यह सांत है, इसलिए 10 की घात पर एक भिन्न है: q में केवल 2 और 5 हैं।",
                      )
                    : t(
                        "Look for a repeating block: there isn't one. A fraction always terminates or repeats.",
                        "कोई दोहराता खंड खोजो: कोई नहीं है। भिन्न हमेशा सांत या आवर्ती होती है।",
                      ),
              }),
        },
        {
          id: Kind.Never,
          label: t("Irrational", "अपरिमेय"),
          ...(kind === Kind.Never
            ? {}
            : {
                feedback: t(
                  kind === Kind.Ends
                    ? "It terminates, so it is a fraction over a power of 10: rational."
                    : "It goes on forever, but it repeats, and a repeating decimal is a fraction: rational.",
                  kind === Kind.Ends
                    ? "यह सांत है, इसलिए 10 की घात पर एक भिन्न है: परिमेय।"
                    : "यह अनंत तक चलता है, पर दोहराता है, और आवर्ती दशमलव एक भिन्न है: परिमेय।",
                ),
              }),
        },
      ],
      answer: kind,
    });
    return column([ask, space()]);
  },
});
