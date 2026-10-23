import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** The textbook's five positions, by name, and the nature of the image each gives. */
const Where = {
  BeyondC: "beyondC",
  AtC: "atC",
  BetweenCF: "betweenCF",
  AtF: "atF",
  InsideF: "insideF",
} as const;
type Where = (typeof Where)[keyof typeof Where];

const natures: Record<Where, { en: string; hi: string }> = {
  beyondC: {
    en: "real, inverted, diminished, between F and C",
    hi: "वास्तविक, उल्टा, छोटा, F और C के बीच",
  },
  atC: { en: "real, inverted, same size, at C", hi: "वास्तविक, उल्टा, बराबर आकार, C पर" },
  betweenCF: { en: "real, inverted, enlarged, beyond C", hi: "वास्तविक, उल्टा, बड़ा, C से परे" },
  atF: { en: "real, inverted, highly enlarged, at infinity", hi: "वास्तविक, उल्टा, बहुत बड़ा, अनंत पर" },
  insideF: {
    en: "virtual, erect, enlarged, behind the mirror",
    hi: "आभासी, सीधा, बड़ा, दर्पण के पीछे",
  },
};

/** Where an object stands, from its distance and the focal length (an "at" counts within 0.5 cm). */
function whereOf(distance: number, f: number): Where {
  if (Math.abs(distance - 2 * f) <= 0.5) return Where.AtC;
  if (Math.abs(distance - f) <= 0.5) return Where.AtF;
  if (distance > 2 * f) return Where.BeyondC;
  if (distance > f) return Where.BetweenCF;
  return Where.InsideF;
}

/**
 * Given f and the object distance (so the learner must first find C and place the object), pick the
 * nature and position of the image: the board's two-mark staple.
 */
export const concaveImageNature = family({
  level: Level.Medium,
  tests: [Concept.ConcaveMirrorCases],
  params: z
    .object({
      focalLength: z.number().int().min(5).max(40),
      distance: z.number().int().min(2).max(120),
    })
    .strict(),
  build: ({ focalLength, distance }, b) => {
    const right = whereOf(distance, focalLength);
    const wrong = (Object.keys(natures) as Where[]).filter((k) => k !== right);
    // Two distractors: the neighbouring cases, which are the ones a slip lands on.
    const order: Where[] = [Where.BeyondC, Where.AtC, Where.BetweenCF, Where.AtF, Where.InsideF];
    const i = order.indexOf(right);
    const near = [order[i - 1], order[i + 1]].filter((k): k is Where => k !== undefined);
    const picks = [...near, ...wrong.filter((k) => !near.includes(k))].slice(0, 2);
    const c = 2 * focalLength;
    const why = t(
      `f = ${focalLength} cm, so C is at ${c} cm. The object at ${distance} cm is ${placeWords[right].en}.`,
      `f = ${focalLength} सेमी, इसलिए C, ${c} सेमी पर है। ${distance} सेमी पर रखी वस्तु ${placeWords[right].hi} है।`,
    );
    const options: Option[] = [
      { id: "right", label: t(natures[right].en, natures[right].hi) },
      ...picks.map((k) => ({
        id: k,
        label: t(natures[k].en, natures[k].hi),
        feedback: t(
          `That is the image for an object ${placeWords[k].en}. ${why.en}`,
          `यह ${placeWords[k].hi} वस्तु का प्रतिबिंब है। ${why.hi}`,
        ),
      })),
    ];
    const ask = choiceQuestion(b, {
      prompt: t(
        `An object is placed ${distance} cm in front of a concave mirror of focal length ${focalLength} cm. The image is…`,
        `${focalLength} सेमी फोकस दूरी वाले अवतल दर्पण के सामने ${distance} सेमी पर वस्तु रखी है। प्रतिबिंब है…`,
      ),
      options: settle(options, focalLength * 13 + distance),
      answer: "right",
    });
    return column([ask, space()]);
  },
});

const placeWords: Record<Where, { en: string; hi: string }> = {
  beyondC: { en: "beyond C", hi: "C से परे" },
  atC: { en: "at C", hi: "C पर" },
  betweenCF: { en: "between C and F", hi: "C और F के बीच" },
  atF: { en: "at F", hi: "F पर" },
  insideF: { en: "between F and P", hi: "F और P के बीच" },
};
