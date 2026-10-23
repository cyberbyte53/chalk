import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Look = {
  RoundYellow: "roundYellow",
  RoundGreen: "roundGreen",
  WrinkledYellow: "wrinkledYellow",
  WrinkledGreen: "wrinkledGreen",
} as const;
type Look = (typeof Look)[keyof typeof Look];

const looks: Record<Look, { en: string; hi: string; of16: number }> = {
  roundYellow: { en: "round and yellow", hi: "गोल और पीले", of16: 9 },
  roundGreen: { en: "round and green", hi: "गोल और हरे", of16: 3 },
  wrinkledYellow: { en: "wrinkled and yellow", hi: "झुर्रीदार और पीले", of16: 3 },
  wrinkledGreen: { en: "wrinkled and green", hi: "झुर्रीदार और हरे", of16: 1 },
};

const Ask = { Fraction: "fraction", Count: "count" } as const;

/** F2 of RrYy × RrYy (Fig. 9.5): the share of seeds with a given look, as a fraction of 16 or out of N. */
export const dihybridFraction = family({
  level: Level.Medium,
  tests: [Concept.MendelTwoTraits],
  params: z
    .object({
      look: z.nativeEnum(Look),
      ask: z.nativeEnum(Ask),
      total: z.number().int().min(16).max(1600).multipleOf(16),
    })
    .strict(),
  build: ({ look, ask, total }, b) => {
    const k = looks[look];
    const show = (n: number) =>
      ask === Ask.Fraction
        ? t(`${n}/16`, `${n}/16`)
        : t(`${(n * total) / 16}`, `${(n * total) / 16}`);
    const wrong = [9, 3, 1, 4].filter((n) => n !== k.of16).slice(0, 2);
    const options: Option[] = [
      { id: "right", label: show(k.of16) },
      ...wrong.map((n) => ({
        id: `n${n}`,
        label: show(n),
        feedback: t(
          `Round yellow (both dominant) fill 9 of the 16 boxes, round green 3, wrinkled yellow 3, and wrinkled green (both recessive) only 1. ${k.en.charAt(0).toUpperCase()}${k.en.slice(1)} is ${k.of16} in 16.`,
          `गोल पीले (दोनों प्रभावी) 16 में से 9 खाने भरते हैं, गोल हरे 3, झुर्रीदार पीले 3, और झुर्रीदार हरे (दोनों अप्रभावी) केवल 1। ${k.hi} 16 में ${k.of16} हैं।`,
        ),
      })),
    ];
    const tail =
      ask === Ask.Fraction
        ? t("What fraction of the F₂ seeds are", "F₂ के कितने भाग बीज")
        : t(`Out of ${total} F₂ seeds, about how many are`, `${total} F₂ बीजों में से लगभग कितने`);
    const ask1 = choiceQuestion(b, {
      prompt: t(
        `Round yellow pea plants (RrYy) are self-pollinated. R (round) and Y (yellow) are dominant. ${tail.en} ${k.en}?`,
        `गोल पीले मटर के पौधों (RrYy) का स्व-परागण होता है। R (गोल) और Y (पीला) प्रभावी हैं। ${tail.hi} ${k.hi} हैं?`,
      ),
      options: settle(options, look.length * 7 + total),
      answer: "right",
    });
    return column([ask1, space()]);
  },
});
