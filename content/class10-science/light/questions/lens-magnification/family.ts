import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, distinctOptions, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** A signed number to two decimal places, trailing zeros dropped. */
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

/** m = v/u for a lens, with no minus (NCERT 10.3.7), and what its sign and size say. */
export const lensMagnification = family({
  level: Level.Medium,
  tests: [Concept.LensFormula],
  params: z
    .object({
      distance: z.number().positive().max(100),
      /** The image distance with its sign, cm. */
      v: z.number(),
    })
    .strict(),
  build: ({ distance, v }, b) => {
    const u = -distance;
    const m = v / u;
    const label = (x: number) => {
      const n = nature(x);
      return t(`$m = ${signed(x)}$: ${n.en}`, `$m = ${signed(x)}$: ${n.hi}`);
    };
    const wrong: Option[] = [
      {
        id: "mirror",
        label: label(-v / u),
        feedback: t(
          "The minus sign is the mirror's. For a lens, m = v/u.",
          "ऋण चिह्न दर्पण का है। लेंस के लिए m = v/u।",
        ),
      },
      {
        id: "flip",
        label: label(u / v),
        feedback: t(
          "That's upside down: v goes on top, u underneath.",
          "यह उल्टा है: v ऊपर जाता है, u नीचे।",
        ),
      },
    ];
    const options = distinctOptions({ id: "right", label: label(m) }, wrong);
    const where =
      v > 0
        ? t(`${v} cm on the other side`, `दूसरी ओर ${v} सेमी पर`)
        : t(`${Math.abs(v)} cm on the object's side`, `वस्तु वाली ओर ${Math.abs(v)} सेमी पर`);
    const ask = choiceQuestion(b, {
      prompt: t(
        `An object is ${distance} cm from a lens, and its image forms ${where.en}. What is the magnification, and what is the image like?`,
        `एक वस्तु लेंस से ${distance} सेमी पर है, और उसका प्रतिबिंब ${where.hi} बनता है। आवर्धन क्या है, और प्रतिबिंब कैसा है?`,
      ),
      options: settle(options, Math.round(distance * 11 + Math.abs(v) * 3)),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
