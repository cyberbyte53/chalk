import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** What the question gives and asks: f from R, R from f, or which mirror has F behind it. */
const Ask = { FocalFromRadius: "focalFromRadius", RadiusFromFocal: "radiusFromFocal" } as const;

/** R = 2f, both ways, with a mirror kind named so the learner reads past it. */
export const mirrorVocabulary = family({
  level: Level.Easy,
  tests: [Concept.MirrorParts],
  params: z
    .object({
      ask: z.nativeEnum(Ask),
      /** The given length, cm. */
      given: z.number().int().min(4).max(80),
      kind: z.enum(["concave", "convex"]),
    })
    .strict(),
  build: ({ ask, given, kind }, b) => {
    const cm = (v: number) => t(`${v} cm`, `${v} सेमी`);
    const mirror = kind === "concave" ? t("concave", "अवतल") : t("convex", "उत्तल");
    const right = ask === Ask.FocalFromRadius ? given / 2 : given * 2;
    const prompt =
      ask === Ask.FocalFromRadius
        ? t(
            `The radius of curvature of a ${mirror.en} mirror is ${given} cm. Its focal length is…`,
            `एक ${mirror.hi} दर्पण की वक्रता त्रिज्या ${given} सेमी है। उसकी फोकस दूरी है…`,
          )
        : t(
            `The focal length of a ${mirror.en} mirror is ${given} cm. Its radius of curvature is…`,
            `एक ${mirror.hi} दर्पण की फोकस दूरी ${given} सेमी है। उसकी वक्रता त्रिज्या है…`,
          );
    const options: Option[] = [
      { id: "right", label: cm(right) },
      {
        id: "same",
        label: cm(given),
        feedback: t(
          "F is halfway between P and C, so the two lengths differ by a factor of 2.",
          "F, P और C के ठीक बीच में है, इसलिए दोनों लंबाइयों में 2 का गुणा-भाग है।",
        ),
      },
      {
        id: "other",
        label: cm(ask === Ask.FocalFromRadius ? given * 2 : given / 2),
        feedback:
          ask === Ask.FocalFromRadius
            ? t("R = 2f, so f = R ÷ 2, not R × 2.", "R = 2f, इसलिए f = R ÷ 2, न कि R × 2।")
            : t(
                "R = 2f: the radius is twice the focal length, not half.",
                "R = 2f: त्रिज्या फोकस दूरी की दोगुनी है, आधी नहीं।",
              ),
      },
    ];
    const askQ = choiceQuestion(b, {
      prompt,
      options: settle(options, given * 3 + (ask === Ask.FocalFromRadius ? 0 : 1)),
      answer: "right",
    });
    return column([askQ, space()]);
  },
});
