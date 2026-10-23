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

/** A signed length to one decimal place, trailing ".0" dropped: "+6", "−37.5". */
function signed(x: number): string {
  const v = Number(Math.abs(x).toFixed(1));
  return `${x < 0 ? "-" : "+"}${v}`;
}

/** v from the mirror formula 1/v + 1/u = 1/f, or null at infinity. */
function imageAt(u: number, f: number): number | null {
  const inv = 1 / f - 1 / u;
  return Math.abs(inv) < 1e-9 ? null : 1 / inv;
}

/** Where v puts the image, in words. */
function side(v: number): { en: string; hi: string } {
  return v < 0
    ? { en: "in front of the mirror, real", hi: "दर्पण के सामने, वास्तविक" }
    : { en: "behind the mirror, virtual", hi: "दर्पण के पीछे, आभासी" };
}

/**
 * NCERT Ex 12, 14, 15: the object distance and the focal length (or the radius) given; find v with
 * its sign and the nature it gives. The slips: u taken positive, f's sign, and the right size on the
 * wrong side.
 */
export const mirrorImagePosition = family({
  level: Level.Medium,
  tests: [Concept.MirrorFormula],
  params: z
    .object({
      kind: z.enum(["concave", "convex"]),
      /** How far in front, cm. */
      distance: z.number().positive().max(100),
      /** The focal length's size, cm. */
      focalLength: z.number().positive().max(60),
      /** Give the radius of curvature instead of f. */
      byRadius: z.boolean().optional(),
    })
    .strict(),
  build: ({ kind, distance, focalLength, byRadius = false }, b) => {
    const u = -distance;
    const f = kind === "concave" ? -focalLength : focalLength;
    const v = imageAt(u, f);
    if (v === null) throw new Error("mirror-image-position: the object is at F");
    const label = (x: number) => {
      const s = side(x);
      return t(`$v = ${signed(x)}$ cm: ${s.en}`, `$v = ${signed(x)}$ सेमी: ${s.hi}`);
    };
    const wrong: Option[] = [];
    const uSlip = imageAt(distance, f);
    if (uSlip !== null)
      wrong.push({
        id: "u",
        label: label(uSlip),
        feedback: t(
          `The object is in front, on the left, so $u = -${distance}$ cm, negative.`,
          `वस्तु सामने, बाईं ओर है, इसलिए $u = -${distance}$ सेमी, ऋणात्मक।`,
        ),
      });
    const fSlip = imageAt(u, -f);
    if (fSlip !== null)
      wrong.push({
        id: "f",
        label: label(fSlip),
        feedback:
          kind === "concave"
            ? t(
                "A concave mirror's F is in front of it, on the left, so its focal length is negative.",
                "अवतल दर्पण का F उसके सामने, बाईं ओर है, इसलिए उसकी फोकस दूरी ऋणात्मक है।",
              )
            : t(
                "A convex mirror's F is behind it, on the right, so its focal length is positive.",
                "उत्तल दर्पण का F उसके पीछे, दाईं ओर है, इसलिए उसकी फोकस दूरी धनात्मक है।",
              ),
      });
    wrong.push({
      id: "side",
      label: label(-v),
      feedback: t(
        "The size is right but the sign isn't. Keep the signs through every step of the working.",
        "माप सही है पर चिह्न नहीं। हल के हर क़दम में चिह्न साथ रखो।",
      ),
    });
    const options = distinctOptions({ id: "right", label: label(v) }, wrong);
    const mirror = kind === "concave" ? t("concave", "अवतल") : t("convex", "उत्तल");
    const given = byRadius
      ? t(`radius of curvature ${2 * focalLength} cm`, `वक्रता त्रिज्या ${2 * focalLength} सेमी`)
      : t(`focal length ${focalLength} cm`, `फोकस दूरी ${focalLength} सेमी`);
    const ask = choiceQuestion(b, {
      prompt: t(
        `An object is ${distance} cm in front of a ${mirror.en} mirror of ${given.en}. Where is the image?`,
        `${given.hi} वाले ${mirror.hi} दर्पण के सामने ${distance} सेमी पर एक वस्तु है। प्रतिबिंब कहाँ है?`,
      ),
      options: settle(options, Math.round(distance * 7 + focalLength * 3)),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
