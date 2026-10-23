import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Nature = { Two: "two", Equal: "equal", None: "none" } as const;
type Nature = (typeof Nature)[keyof typeof Nature];
const words: Record<Nature, { en: string; hi: string }> = {
  two: { en: "Two distinct real roots", hi: "दो भिन्न वास्तविक मूल" },
  equal: { en: "Two equal real roots", hi: "दो बराबर वास्तविक मूल" },
  none: { en: "No real roots", hi: "कोई वास्तविक मूल नहीं" },
};

/** The nature of the roots from the discriminant (Exercise 4.4 Q1, Examples 16, 18). */
export const natureOfRoots = family({
  level: Level.Easy,
  tests: [Concept.NatureOfRoots],
  params: z
    .object({
      /** The equation, in TeX. */
      equation: z.string(),
      /** D = b² − 4ac worked out, in TeX, e.g. "(-3)^2 - 4 \times 2 \times 5 = -31". */
      working: z.string(),
      d: z.number(),
    })
    .strict(),
  build: ({ equation, working, d }, b) => {
    const nature: Nature = d > 0 ? Nature.Two : d === 0 ? Nature.Equal : Nature.None;
    const why = t(
      `$D = b^2 - 4ac = ${working}$. ${d > 0 ? "D > 0" : d === 0 ? "D = 0" : "D < 0"}: ${words[nature].en.toLowerCase()}.`,
      `$D = b^2 - 4ac = ${working}$। ${d > 0 ? "D > 0" : d === 0 ? "D = 0" : "D < 0"}: ${words[nature].hi}।`,
    );
    const options: Option[] = (Object.values(Nature) as Nature[]).map((n) =>
      n === nature
        ? { id: n, label: t(words[n].en, words[n].hi) }
        : { id: n, label: t(words[n].en, words[n].hi), feedback: why },
    );
    const ask = choiceQuestion(b, {
      prompt: t(
        `What is the nature of the roots of $${equation}$?`,
        `$${equation}$ के मूलों की प्रकृति क्या है?`,
      ),
      options: settle(options, equation.length * 5),
      answer: nature,
    });
    return column([ask, space()]);
  },
});
