import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;

/** In the proof that √p is irrational, which step needs p to be prime? */
export const theoremStep = family({
  level: Level.Medium,
  tests: [Concept.RootTwoIrrational],
  params: z.object({ p: z.number().int().min(2).max(13) }).strict(),
  build: ({ p }, b) => {
    const options: Option[] = [
      {
        id: "square",
        label: t(
          r`$\sqrt{${p}} = \frac{a}{b}$ gives $${p}b^2 = a^2$`,
          r`$\sqrt{${p}} = \frac{a}{b}$ से $${p}b^2 = a^2$`,
        ),
        feedback: t(
          "That's just squaring both sides: it works for any number.",
          "यह बस दोनों ओर वर्ग करना है: किसी भी संख्या के लिए चलता है।",
        ),
      },
      {
        id: "right",
        label: t(
          r`${p} divides $a^2$, so ${p} divides $a$`,
          r`${p}, $a^2$ को विभाजित करता है, तो $a$ को भी`,
        ),
      },
      {
        id: "sub",
        label: t(r`$a = ${p}c$ gives $b^2 = ${p}c^2$`, r`$a = ${p}c$ से $b^2 = ${p}c^2$`),
        feedback: t(
          `That's substituting and dividing by ${p}: it works for any number.`,
          `यह रखकर ${p} से भाग देना है: किसी भी संख्या के लिए चलता है।`,
        ),
      },
    ];
    const ask = choiceQuestion(b, {
      prompt: t(
        r`In the proof that $\sqrt{${p}}$ is irrational, which step needs ${p} to be prime?`,
        r`$\sqrt{${p}}$ अपरिमेय है, इसकी उपपत्ति में किस क़दम के लिए ${p} का अभाज्य होना ज़रूरी है?`,
      ),
      options: settle(options, p * 17),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
