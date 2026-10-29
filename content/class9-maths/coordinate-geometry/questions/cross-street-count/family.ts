import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** NCERT Ex 3.1 Q2, in the book's own words: how many cross-streets can be called (4, 3), (3, 4)? */
export const crossStreetCount = family({
  level: Level.Medium,
  tests: [Concept.TwoNumbersForAPlace],
  params: z
    .object({ ns: z.number().int().min(1).max(5), ew: z.number().int().min(1).max(5) })
    .strict(),
  build: ({ ns, ew }, b) => {
    const ask = choiceQuestion(b, {
      prompt: t(
        `A city has two main roads which cross each other at the centre of the city. These two roads are along the North-South direction and East-West direction. All the other streets of the city run parallel to these roads and are 200 m apart. There are 5 streets in each direction. The street in the 2nd North-South direction and 5th in the East-West direction meet at some crossing; we call this the cross-street (2, 5). How many cross-streets can be referred to as **(${ns}, ${ew})**?`,
        `एक शहर में दो मुख्य सड़कें हैं, जो शहर के केंद्र पर एक-दूसरे को काटती हैं। ये दोनों सड़कें उत्तर-दक्षिण दिशा और पूर्व-पश्चिम दिशा में हैं। शहर की अन्य सभी गलियाँ इन सड़कों के समांतर हैं और 200 m की दूरी पर हैं। हर दिशा में 5 गलियाँ हैं। उत्तर-दक्षिण दिशा की दूसरी गली और पूर्व-पश्चिम दिशा की पाँचवीं गली एक चौराहे पर मिलती हैं; इसे चौराहा (2, 5) कहते हैं। कितने चौराहों को **(${ns}, ${ew})** कहा जा सकता है?`,
      ),
      options: [
        { id: "one", label: t("One", "एक") },
        { id: "two", label: t("Two", "दो") },
        { id: "five", label: t("Five", "पाँच") },
      ],
      answer: "one",
      keepOrder: true,
    });
    return [ask];
  },
});
