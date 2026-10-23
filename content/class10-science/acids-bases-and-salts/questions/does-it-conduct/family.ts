import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, askItem, seedOf, w, wrong } from "../../qkit";

const ITEMS = {
  hcl: {
    prompt: w(
      "Dilute hydrochloric acid in the conductivity tester:",
      "चालकता परीक्षक में तनु हाइड्रोक्लोरिक अम्ल:",
    ),
    right: w("The bulb glows: it has ions", "बल्ब जलता है: इसमें आयन हैं"),
    wrong: [
      wrong(
        w("The bulb stays dark", "बल्ब बुझा रहता है"),
        w(
          "Acids give H⁺ and anions in water, which carry the current.",
          "अम्ल जल में H⁺ और ऋणायन देते हैं, जो धारा ले जाते हैं।",
        ),
      ),
    ],
  },
  glucose: {
    prompt: w("Glucose solution in the conductivity tester:", "चालकता परीक्षक में ग्लूकोज़ घोल:"),
    right: w("The bulb stays dark: no ions", "बल्ब बुझा रहता है: कोई आयन नहीं"),
    wrong: [
      wrong(
        w("The bulb glows: it has hydrogen", "बल्ब जलता है: इसमें हाइड्रोजन है"),
        w(
          "Containing hydrogen isn't enough; glucose doesn't form ions.",
          "हाइड्रोजन होना काफ़ी नहीं; ग्लूकोज़ आयन नहीं बनाता।",
        ),
      ),
    ],
  },
  alcohol: {
    prompt: w("Alcohol in the conductivity tester:", "चालकता परीक्षक में ऐल्कोहॉल:"),
    right: w("The bulb stays dark", "बल्ब बुझा रहता है"),
    wrong: [
      wrong(
        w("The bulb glows", "बल्ब जलता है"),
        w(
          "Alcohol has hydrogen but gives no ions: it isn't an acid.",
          "ऐल्कोहॉल में हाइड्रोजन है पर यह आयन नहीं देता: यह अम्ल नहीं है।",
        ),
      ),
    ],
  },
  naoh: {
    prompt: w(
      "Sodium hydroxide solution in the conductivity tester:",
      "चालकता परीक्षक में सोडियम हाइड्रॉक्साइड घोल:",
    ),
    right: w("The bulb glows: Na⁺ and OH⁻ ions", "बल्ब जलता है: Na⁺ और OH⁻ आयन"),
    wrong: [
      wrong(
        w("The bulb stays dark", "बल्ब बुझा रहता है"),
        w("Alkalis give ions in water too.", "क्षार भी जल में आयन देते हैं।"),
      ),
    ],
  },
  distilled: {
    prompt: w("Distilled water vs rain water in the tester:", "परीक्षक में आसुत जल बनाम वर्षा का जल:"),
    right: w("Only rain water lets a little current through", "केवल वर्षा का जल थोड़ी धारा जाने देता है"),
    wrong: [
      wrong(
        w("Both conduct equally", "दोनों बराबर चालित करते हैं"),
        w(
          "Distilled water has almost no ions; rain water has dissolved substances that give ions.",
          "आसुत जल में लगभग कोई आयन नहीं; वर्षा के जल में घुले पदार्थ आयन देते हैं।",
        ),
      ),
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof ITEMS;
const KEYS = Object.keys(ITEMS) as [Key, ...Key[]];

/** Does the solution light the bulb? */
export const doesItConduct = family({
  level: Level.Easy,
  tests: [Concept.AcidsAndBasesInWater],
  params: z.object({ item: z.enum(KEYS) }).strict(),
  build: ({ item }, b) => askItem(b, ITEMS[item], seedOf(item)),
});
