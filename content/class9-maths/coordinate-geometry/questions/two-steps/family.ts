import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** From an address to the walk: along the main road to the street, then up it to the house. */
export const twoSteps = family({
  level: Level.Easy,
  tests: [Concept.TwoNumbersForAPlace],
  params: z
    .object({ street: z.number().int().min(1).max(8), house: z.number().int().min(1).max(5) })
    .strict()
    .refine((p) => p.street !== p.house, "the street and the house differ, so the order shows"),
  build: ({ street, house }, b) => {
    const ask = choiceQuestion(b, {
      prompt: t(
        `In Riya's town, streets leave the main road going north, numbered from the west, and houses are numbered up each street from the main road. Riya stands where the main road begins. Which walk takes her to **Street ${street}, House ${house}**?`,
        `रिया के शहर में गलियाँ मुख्य सड़क से उत्तर की ओर निकलती हैं, पश्चिम से गिनी हुई, और हर गली में मकान मुख्य सड़क से गिने जाते हैं। रिया वहाँ खड़ी है जहाँ मुख्य सड़क शुरू होती है। कौन-सा रास्ता उसे **गली ${street}, मकान ${house}** तक ले जाता है?`,
      ),
      options: [
        {
          id: "right",
          label: t(
            `Along the main road to Street ${street}, then up it to House ${house}`,
            `मुख्य सड़क पर गली ${street} तक, फिर उसमें मकान ${house} तक`,
          ),
        },
        {
          id: "swapped",
          label: t(
            `Along the main road to Street ${house}, then up it to House ${street}`,
            `मुख्य सड़क पर गली ${house} तक, फिर उसमें मकान ${street} तक`,
          ),
        },
        {
          id: "added",
          label: t(
            `Along the main road to Street ${street + house}`,
            `मुख्य सड़क पर गली ${street + house} तक`,
          ),
        },
      ],
      answer: "right",
    });
    return [ask];
  },
});
