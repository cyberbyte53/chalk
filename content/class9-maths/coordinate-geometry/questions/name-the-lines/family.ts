import { family, scene, t } from "@chalk/author";
import { Level, type Localized } from "@chalk/content";
import { choice } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** The three names Ex 3.2 Q1 asks for, and the fourth the lesson gives: each an option. */
const NAMES: Record<
  "axes" | "quadrant" | "origin" | "directions",
  { label: Localized; feedback: Localized; feedbackSays?: Localized }
> = {
  axes: {
    label: t("The x-axis and the y-axis", "x-अक्ष और y-अक्ष"),
    feedback: t(
      "The x-axis and the y-axis are the two lines themselves: X′X across and Y′Y up.",
      "x-अक्ष और y-अक्ष स्वयं दोनों रेखाएँ हैं: आड़ी X′X और खड़ी Y′Y।",
    ),
    feedbackSays: t(
      "The x-axis and the y-axis are the two lines themselves: X dash X across and Y dash Y up.",
      "एक्स-अक्ष और वाई-अक्ष स्वयं दोनों रेखाएँ हैं: आड़ी X डैश X और खड़ी Y डैश Y।",
    ),
  },
  quadrant: {
    label: t("A quadrant", "एक चतुर्थांश"),
    feedback: t(
      "A quadrant is one of the four parts the two lines divide the plane into.",
      "चतुर्थांश उन चार भागों में से एक है जिनमें दोनों रेखाएँ तल को बाँटती हैं।",
    ),
  },
  origin: {
    label: t("The origin", "मूल बिंदु"),
    feedback: t(
      "The origin, O, is the one point where the two lines cross.",
      "मूल बिंदु O वह एक बिंदु है जहाँ दोनों रेखाएँ काटती हैं।",
    ),
  },
  directions: {
    label: t("The positive and negative directions", "धनात्मक और ऋणात्मक दिशाएँ"),
    feedback: t(
      "The directions are the halves of each axis, OX and OX′, OY and OY′, not the lines or the parts.",
      "दिशाएँ हर अक्ष के आधे भाग हैं, OX और OX′, OY और OY′, न कि रेखाएँ या भाग।",
    ),
    feedbackSays: t(
      "The directions are the halves of each axis, O X and O X dash, O Y and O Y dash, not the lines or the parts.",
      "दिशाएँ हर अक्ष के आधे भाग हैं, O X और O X डैश, O Y और O Y डैश, न कि रेखाएँ या भाग।",
    ),
  },
};
type Name = keyof typeof NAMES;

/** Each part of the question, in the book's words, and the name that answers it. */
const ASKS = {
  lines: {
    answer: "axes",
    prompt: t(
      "What is the name of the horizontal and the vertical lines drawn to determine the position of any point in the Cartesian plane?",
      "कार्तीय तल में किसी बिंदु की स्थिति निर्धारित करने के लिए खींची गई क्षैतिज और ऊर्ध्वाधर रेखाओं का क्या नाम है?",
    ),
  },
  parts: {
    answer: "quadrant",
    prompt: t(
      "What is the name of each part of the plane formed by these two lines?",
      "इन दोनों रेखाओं से बने तल के प्रत्येक भाग का क्या नाम है?",
    ),
  },
  point: {
    answer: "origin",
    prompt: t(
      "Write the name of the point where these two lines intersect.",
      "उस बिंदु का नाम लिखिए जहाँ ये दोनों रेखाएँ प्रतिच्छेद करती हैं।",
    ),
  },
} as const satisfies Record<string, { answer: Name; prompt: ReturnType<typeof t> }>;

/** NCERT Ex 3.2 Q1, in the book's words: the names of the axes, the quadrants and the origin. */
export const nameTheLines = family({
  level: Level.Easy,
  tests: [Concept.TheCartesianPlane],
  params: z.object({ ask: z.enum(["lines", "parts", "point"]) }).strict(),
  build: ({ ask: which }) => {
    const { answer, prompt } = ASKS[which];
    const ask = choice({
      prompt,
      options: (Object.keys(NAMES) as Name[]).map((id) => ({
        id,
        label: NAMES[id].label,
        ...(id === answer
          ? {}
          : { feedback: NAMES[id].feedback, feedbackSays: NAMES[id].feedbackSays }),
      })),
      answer,
    });
    return scene({ pieces: { ask: ask.piece }, uses: [ask.use] });
  },
});
