import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import {
  type Option,
  choiceQuestion,
  distinctOptions,
  settle,
} from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** NCERT Table 10.3, and the in-text question's glass of index 1.50. */
const media = {
  ice: { n: 1.31, en: "ice", hi: "बर्फ़" },
  water: { n: 1.33, en: "water", hi: "पानी" },
  kerosene: { n: 1.44, en: "kerosene", hi: "किरोसिन" },
  glass: { n: 1.5, en: "a glass", hi: "एक काँच" },
  crownGlass: { n: 1.52, en: "crown glass", hi: "क्राउन काँच" },
  diamond: { n: 2.42, en: "diamond", hi: "हीरा" },
} as const;
type Name = keyof typeof media;

/** A speed in units of 10⁸ m/s, to two decimal places. */
function speed(x: number): ReturnType<typeof t> {
  const v = Number(x.toFixed(2));
  return t(`$${v} \\times 10^8$ m/s`, `$${v} \\times 10^8$ मीटर/सेकंड`);
}

/** v = c / n (NCERT in-text Q2): divide by n, not multiply, and the answer is slower than c. */
export const speedInMedium = family({
  level: Level.Medium,
  tests: [Concept.RefractiveIndex],
  params: z.object({ medium: z.enum(Object.keys(media) as [Name, ...Name[]]) }).strict(),
  build: ({ medium }, b) => {
    const m = media[medium];
    const wrong: Option[] = [
      {
        id: "times",
        label: speed(3 * m.n),
        feedback: t(
          `Light can't be faster in ${m.en} than in air. Since $n = \\frac{c}{v}$, $v = \\frac{c}{n}$: divide by ${m.n}.`,
          `${m.hi} में प्रकाश वायु से तेज़ नहीं हो सकता। $n = \\frac{c}{v}$ है, इसलिए $v = \\frac{c}{n}$: ${m.n} से भाग दो।`,
        ),
      },
      {
        id: "same",
        label: speed(3),
        feedback: t(
          `That is the speed in air. In ${m.en} light is ${m.n} times slower.`,
          `यह वायु में चाल है। ${m.hi} में प्रकाश ${m.n} गुना धीमा है।`,
        ),
      },
      {
        id: "flip",
        label: speed(m.n / 3),
        feedback: t(
          "Upside down: the speed in air goes on top, the refractive index underneath.",
          "उल्टा: वायु में चाल ऊपर जाती है, अपवर्तनांक नीचे।",
        ),
      },
    ];
    const options = distinctOptions({ id: "right", label: speed(3 / m.n) }, wrong);
    const ask = choiceQuestion(b, {
      prompt: t(
        `The refractive index of ${m.en} is ${m.n}. The speed of light in air is $3 \\times 10^8$ m/s. What is the speed of light in ${m.en}?`,
        `${m.hi} का अपवर्तनांक ${m.n} है। वायु में प्रकाश की चाल $3 \\times 10^8$ मीटर/सेकंड है। ${m.hi} में प्रकाश की चाल क्या है?`,
      ),
      options: settle(options, Math.round(m.n * 100)),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
