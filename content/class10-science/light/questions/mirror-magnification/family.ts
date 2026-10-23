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

/** A signed number to two decimal places, trailing zeros dropped: "+1", "−0.5". */
function signed(x: number): string {
  const v = Number(Math.abs(x).toFixed(2));
  return `${x < 0 ? "-" : "+"}${v}`;
}

/** What a magnification says about the image. */
function nature(m: number): { en: string; hi: string } {
  const size =
    Math.abs(Math.abs(m) - 1) < 1e-9
      ? { en: "same size", hi: "बराबर आकार" }
      : Math.abs(m) > 1
        ? { en: "enlarged", hi: "बड़ा" }
        : { en: "diminished", hi: "छोटा" };
  return m < 0
    ? { en: `real, inverted, ${size.en}`, hi: `वास्तविक, उल्टा, ${size.hi}` }
    : { en: `virtual, erect, ${size.en}`, hi: `आभासी, सीधा, ${size.hi}` };
}

/** m = −v/u for a mirror, and what its sign and size say (NCERT 10.2.4, Ex 13). */
export const mirrorMagnification = family({
  level: Level.Medium,
  tests: [Concept.MirrorFormula],
  params: z
    .object({
      /** How far in front the object is, cm. */
      distance: z.number().positive().max(100),
      /** The image distance with its sign, cm. */
      v: z.number(),
    })
    .strict(),
  build: ({ distance, v }, b) => {
    const u = -distance;
    const m = -v / u;
    const label = (x: number) => {
      const n = nature(x);
      return t(`$m = ${signed(x)}$: ${n.en}`, `$m = ${signed(x)}$: ${n.hi}`);
    };
    const wrong: Option[] = [
      {
        id: "minus",
        label: label(v / u),
        feedback: t(
          "For a mirror there is a minus sign: m = −v/u.",
          "दर्पण के लिए ऋण चिह्न है: m = −v/u।",
        ),
      },
      {
        id: "flip",
        label: label(-u / v),
        feedback: t(
          "That's upside down: v goes on top, u underneath.",
          "यह उल्टा है: v ऊपर जाता है, u नीचे।",
        ),
      },
      {
        id: "sign",
        label: label(-m),
        feedback: t(
          "Put both distances in with their signs before dividing.",
          "भाग देने से पहले दोनों दूरियाँ उनके चिह्नों के साथ रखो।",
        ),
      },
    ];
    const options = distinctOptions({ id: "right", label: label(m) }, wrong);
    const where =
      v < 0
        ? t(`${Math.abs(v)} cm in front of it`, `उसके ${Math.abs(v)} सेमी सामने`)
        : t(`${v} cm behind it`, `उसके ${v} सेमी पीछे`);
    const ask = choiceQuestion(b, {
      prompt: t(
        `An object is ${distance} cm in front of a spherical mirror, and its image forms ${where.en}. What is the magnification, and what is the image like?`,
        `एक वस्तु गोलीय दर्पण के ${distance} सेमी सामने है, और उसका प्रतिबिंब ${where.hi} बनता है। आवर्धन क्या है, और प्रतिबिंब कैसा है?`,
      ),
      options: settle(options, Math.round(distance * 3 + Math.abs(v) * 7)),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
