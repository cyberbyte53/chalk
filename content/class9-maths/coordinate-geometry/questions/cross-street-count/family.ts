import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** Ex 3.1 Q2: in a city of 5 streets each way, a pair names exactly one cross-street. */
export const crossStreetCount = family({
  level: Level.Medium,
  tests: [Concept.TwoNumbersForAPlace],
  params: z
    .object({ ns: z.number().int().min(1).max(5), ew: z.number().int().min(1).max(5) })
    .strict()
    .refine(
      (p) => p.ns !== p.ew,
      "the two numbers differ, so the swapped pair is another crossing",
    ),
  build: ({ ns, ew }, b) => {
    const ask = choiceQuestion(b, {
      prompt: t(
        `A city has 5 streets running north–south and 5 running east–west, 200 m apart. The cross-street (a, b) is where the a-th north–south street meets the b-th east–west street. How many cross-streets can be called **(${ns}, ${ew})**?`,
        `एक शहर में 5 गलियाँ उत्तर–दक्षिण और 5 पूर्व–पश्चिम चलती हैं, 200 m दूर। चौराहा (a, b) वहाँ है जहाँ a-वीं उत्तर–दक्षिण गली b-वीं पूर्व–पश्चिम गली से मिलती है। कितने चौराहों को **(${ns}, ${ew})** कहा जा सकता है?`,
      ),
      options: [
        { id: "one", label: t("One", "एक") },
        {
          id: "two",
          label: t(
            `Two: (${ns}, ${ew}) and (${ew}, ${ns})`,
            `दो: (${ns}, ${ew}) और (${ew}, ${ns})`,
          ),
        },
        { id: "five", label: t("Five", "पाँच") },
      ],
      answer: "one",
      keepOrder: true,
    });
    return [ask];
  },
});
