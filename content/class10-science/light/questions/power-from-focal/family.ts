import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, distinctOptions, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** A power in dioptres with its sign, to two decimal places: "+4 D", "−0.5 D". */
function dioptres(p: number): ReturnType<typeof t> {
  const v = Number(Math.abs(p).toFixed(2));
  const s = `${p < 0 ? "−" : "+"}${v} D`;
  return t(s, s);
}

/** P = 1/f with f in metres (NCERT in-text Q3): the slips are cm left as cm, the sign, and not inverting. */
export const powerFromFocal = family({
  level: Level.Easy,
  tests: [Concept.PowerOfALens],
  params: z
    .object({
      kind: z.enum(["convex", "concave"]),
      focalLength: z.number().positive(),
      unit: z.enum(["cm", "m"]),
    })
    .strict(),
  build: ({ kind, focalLength, unit }, b) => {
    const sign = kind === "convex" ? 1 : -1;
    const metres = unit === "cm" ? focalLength / 100 : focalLength;
    const right = sign / metres;
    const wrong: Option[] = [
      {
        id: "sign",
        label: dioptres(-right),
        feedback:
          kind === "convex"
            ? t(
                "A convex lens has a positive focal length, so its power is positive.",
                "उत्तल लेंस की फोकस दूरी धनात्मक है, इसलिए उसकी क्षमता धनात्मक है।",
              )
            : t(
                "A concave lens has a negative focal length, so its power is negative.",
                "अवतल लेंस की फोकस दूरी ऋणात्मक है, इसलिए उसकी क्षमता ऋणात्मक है।",
              ),
      },
    ];
    if (unit === "cm")
      wrong.push({
        id: "cm",
        label: dioptres(sign / focalLength),
        feedback: t(
          `Change to metres first: ${focalLength} cm = ${metres} m.`,
          `पहले मीटर में बदलो: ${focalLength} सेमी = ${metres} मीटर।`,
        ),
      });
    wrong.push({
      id: "invert",
      label: dioptres(sign * metres),
      feedback: t(
        "Power is the reciprocal of the focal length: P = 1/f.",
        "क्षमता फोकस दूरी का व्युत्क्रम है: P = 1/f।",
      ),
    });
    const options = distinctOptions({ id: "right", label: dioptres(right) }, wrong);
    const lens = kind === "convex" ? t("convex", "उत्तल") : t("concave", "अवतल");
    const len =
      unit === "cm"
        ? t(`${focalLength} cm`, `${focalLength} सेमी`)
        : t(`${focalLength} m`, `${focalLength} मीटर`);
    const ask = choiceQuestion(b, {
      prompt: t(
        `What is the power of a ${lens.en} lens of focal length ${len.en}?`,
        `${len.hi} फोकस दूरी वाले ${lens.hi} लेंस की क्षमता क्या है?`,
      ),
      options: settle(options, Math.round(focalLength * 7 + (unit === "cm" ? 1 : 2))),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
