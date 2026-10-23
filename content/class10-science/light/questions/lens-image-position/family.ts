import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, distinctOptions, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** A signed length to one decimal place, trailing ".0" dropped: "+16.7", "−10". */
function signed(x: number): string {
  const v = Number(Math.abs(x).toFixed(1));
  return `${x < 0 ? "-" : "+"}${v}`;
}

/** 1 / (sum of reciprocals), or null at infinity. */
function reciprocal(inv: number): number | null {
  return Math.abs(inv) < 1e-9 ? null : 1 / inv;
}

/**
 * NCERT Examples 10.3–10.4, Ex 10–11: u and f given; find v with its sign and the nature it gives.
 * The slips: the mirror formula's plus, u taken positive, and the right size on the wrong side.
 */
export const lensImagePosition = family({
  level: Level.Medium,
  tests: [Concept.LensFormula],
  params: z
    .object({
      kind: z.enum(["convex", "concave"]),
      distance: z.number().positive().max(100),
      focalLength: z.number().positive().max(60),
    })
    .strict(),
  build: ({ kind, distance, focalLength }, b) => {
    const u = -distance;
    const f = kind === "convex" ? focalLength : -focalLength;
    const v = reciprocal(1 / f + 1 / u);
    if (v === null) throw new Error("lens-image-position: the object is at F");
    const label = (x: number) =>
      x > 0
        ? t(
            `$v = ${signed(x)}$ cm: on the other side, real`,
            `$v = ${signed(x)}$ सेमी: दूसरी ओर, वास्तविक`,
          )
        : t(
            `$v = ${signed(x)}$ cm: on the object's side, virtual`,
            `$v = ${signed(x)}$ सेमी: वस्तु वाली ओर, आभासी`,
          );
    const wrong: Option[] = [];
    const mirror = reciprocal(1 / f - 1 / u);
    if (mirror !== null)
      wrong.push({
        id: "mirror",
        label: label(mirror),
        feedback: t(
          "That's the mirror formula. For a lens it is 1/v − 1/u = 1/f, so 1/v = 1/f + 1/u.",
          "यह दर्पण सूत्र है। लेंस के लिए 1/v − 1/u = 1/f है, इसलिए 1/v = 1/f + 1/u।",
        ),
      });
    const uSlip = reciprocal(1 / f + 1 / distance);
    if (uSlip !== null)
      wrong.push({
        id: "u",
        label: label(uSlip),
        feedback: t(
          `The object is on the left, so $u = -${distance}$ cm, negative.`,
          `वस्तु बाईं ओर है, इसलिए $u = -${distance}$ सेमी, ऋणात्मक।`,
        ),
      });
    wrong.push({
      id: "side",
      label: label(-v),
      feedback: t(
        "The size is right but the sign isn't. Keep the signs through every step.",
        "माप सही है पर चिह्न नहीं। हर क़दम में चिह्न साथ रखो।",
      ),
    });
    const options = distinctOptions({ id: "right", label: label(v) }, wrong);
    const lens = kind === "convex" ? t("convex", "उत्तल") : t("concave", "अवतल");
    const ask = choiceQuestion(b, {
      prompt: t(
        `An object is ${distance} cm from a ${lens.en} lens of focal length ${focalLength} cm. Where is the image?`,
        `${focalLength} सेमी फोकस दूरी वाले ${lens.hi} लेंस से ${distance} सेमी पर एक वस्तु है। प्रतिबिंब कहाँ है?`,
      ),
      options: settle(options, Math.round(distance * 5 + focalLength * 9)),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
