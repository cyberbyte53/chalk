import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** The textbook's five positions for a convex lens (NCERT Table 10.4). */
const Where = {
  Beyond2F: "beyond2F",
  At2F: "at2F",
  Between: "between",
  AtF: "atF",
  InsideF: "insideF",
} as const;
type Where = (typeof Where)[keyof typeof Where];

const natures: Record<Where, { en: string; hi: string }> = {
  beyond2F: {
    en: "real, inverted, diminished, between F₂ and 2F₂",
    hi: "वास्तविक, उल्टा, छोटा, F₂ और 2F₂ के बीच",
  },
  at2F: { en: "real, inverted, same size, at 2F₂", hi: "वास्तविक, उल्टा, बराबर आकार, 2F₂ पर" },
  between: { en: "real, inverted, enlarged, beyond 2F₂", hi: "वास्तविक, उल्टा, बड़ा, 2F₂ से परे" },
  atF: { en: "real, inverted, highly enlarged, at infinity", hi: "वास्तविक, उल्टा, बहुत बड़ा, अनंत पर" },
  insideF: {
    en: "virtual, erect, enlarged, on the same side as the object",
    hi: "आभासी, सीधा, बड़ा, वस्तु वाली ओर",
  },
};

const placeWords: Record<Where, { en: string; hi: string }> = {
  beyond2F: { en: "beyond 2F₁", hi: "2F₁ से परे" },
  at2F: { en: "at 2F₁", hi: "2F₁ पर" },
  between: { en: "between 2F₁ and F₁", hi: "2F₁ और F₁ के बीच" },
  atF: { en: "at F₁", hi: "F₁ पर" },
  insideF: { en: "between F₁ and O", hi: "F₁ और O के बीच" },
};

/** Where the object stands, from its distance and f (an "at" counts within 0.5 cm). */
function whereOf(distance: number, f: number): Where {
  if (Math.abs(distance - 2 * f) <= 0.5) return Where.At2F;
  if (Math.abs(distance - f) <= 0.5) return Where.AtF;
  if (distance > 2 * f) return Where.Beyond2F;
  if (distance > f) return Where.Between;
  return Where.InsideF;
}

/** Given f and the object distance, pick the image's nature and place: find 2F first. */
export const convexLensImageNature = family({
  level: Level.Medium,
  tests: [Concept.ConvexLensCases],
  params: z
    .object({
      focalLength: z.number().int().min(5).max(40),
      distance: z.number().int().min(2).max(120),
    })
    .strict(),
  build: ({ focalLength, distance }, b) => {
    const right = whereOf(distance, focalLength);
    const order: Where[] = [Where.Beyond2F, Where.At2F, Where.Between, Where.AtF, Where.InsideF];
    const i = order.indexOf(right);
    const near = [order[i - 1], order[i + 1]].filter((k): k is Where => k !== undefined);
    const picks = [...near, ...order.filter((k) => k !== right && !near.includes(k))].slice(0, 2);
    const why = t(
      `f = ${focalLength} cm, so 2F₁ is ${2 * focalLength} cm from the lens. The object at ${distance} cm is ${placeWords[right].en}.`,
      `f = ${focalLength} सेमी, इसलिए 2F₁ लेंस से ${2 * focalLength} सेमी पर है। ${distance} सेमी पर रखी वस्तु ${placeWords[right].hi} है।`,
    );
    const options: Option[] = [
      { id: "right", label: t(natures[right].en, natures[right].hi) },
      ...picks.map((k) => ({
        id: k,
        label: t(natures[k].en, natures[k].hi),
        feedback: t(
          `That is the image for an object ${placeWords[k].en}. ${why.en}`,
          `यह ${placeWords[k].hi} रखी वस्तु का प्रतिबिंब है। ${why.hi}`,
        ),
      })),
    ];
    const ask = choiceQuestion(b, {
      prompt: t(
        `An object is ${distance} cm from a convex lens of focal length ${focalLength} cm. The image is…`,
        `${focalLength} सेमी फोकस दूरी वाले उत्तल लेंस से ${distance} सेमी पर एक वस्तु है। प्रतिबिंब है…`,
      ),
      options: settle(options, focalLength * 11 + distance),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
