import { family } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Item, askItem, seedOf, w, wrong } from "../../qkit";

const ITEMS = {
  six8: {
    prompt: w(
      "Solution A has pH 6, B has pH 8. Which has more H⁺ ions?",
      "विलयन A का pH 6, B का pH 8 है। किसमें ज़्यादा H⁺ आयन हैं?",
    ),
    right: w("A", "A"),
    wrong: [wrong(w("B", "B"), w("Higher H⁺ means lower pH.", "ज़्यादा H⁺ मतलब कम pH।"))],
  },
  two5: {
    prompt: w(
      "Solution P has pH 2, Q has pH 5. Which has more H⁺ ions?",
      "विलयन P का pH 2, Q का pH 5 है। किसमें ज़्यादा H⁺ आयन हैं?",
    ),
    right: w("P", "P"),
    wrong: [wrong(w("Q", "Q"), w("The lower the pH, the more H⁺.", "जितना कम pH, उतने ज़्यादा H⁺।"))],
  },
  magnesium: {
    prompt: w(
      "Magnesium in HCl and in acetic acid of the same concentration. Which fizzes harder?",
      "एक ही सांद्रता के HCl और ऐसीटिक अम्ल में मैग्नीशियम। कौन ज़्यादा सनसनाता है?",
    ),
    right: w("HCl: a strong acid gives more H⁺", "HCl: प्रबल अम्ल ज़्यादा H⁺ देता है"),
    wrong: [
      wrong(
        w("Acetic acid: its smell is stronger", "ऐसीटिक अम्ल: उसकी गंध तेज़ है"),
        w("Acetic acid is weak: it gives fewer H⁺ ions.", "ऐसीटिक अम्ल दुर्बल है: यह कम H⁺ आयन देता है।"),
      ),
      wrong(
        w("Both the same: equal concentrations", "दोनों बराबर: सांद्रता समान है"),
        w(
          "Same concentration, different strength: HCl gives more H⁺.",
          "सांद्रता एक, प्रबलता अलग: HCl ज़्यादा H⁺ देता है।",
        ),
      ),
    ],
  },
  order: {
    prompt: w(
      "pH values 4, 1, 11, 7, 9. Which has the least hydrogen-ion concentration?",
      "pH मान 4, 1, 11, 7, 9। किसमें हाइड्रोजन-आयन सांद्रता सबसे कम है?",
    ),
    right: w("pH 11", "pH 11"),
    wrong: [
      wrong(
        w("pH 1", "pH 1"),
        w(
          "pH 1 has the most H⁺. The least is the highest pH.",
          "pH 1 में सबसे ज़्यादा H⁺ हैं। सबसे कम सबसे ऊँचे pH में।",
        ),
      ),
    ],
  },
  basicH: {
    prompt: w(
      "Do basic solutions have any H⁺(aq) ions?",
      "क्या क्षारकीय विलयनों में कोई H⁺(aq) आयन होते हैं?",
    ),
    right: w("Yes, but far fewer than OH⁻", "हाँ, पर OH⁻ से बहुत कम"),
    wrong: [
      wrong(
        w("No, none", "नहीं, कोई नहीं"),
        w(
          "There are always a few; OH⁻ just outnumbers them.",
          "कुछ हमेशा होते हैं; बस OH⁻ उनसे ज़्यादा होते हैं।",
        ),
      ),
    ],
  },
} satisfies Record<string, Item>;

type Key = keyof typeof ITEMS;
const KEYS = Object.keys(ITEMS) as [Key, ...Key[]];

/** Which has more hydrogen ions, or which acid is stronger? */
export const moreHydrogenIons = family({
  level: Level.Medium,
  tests: [Concept.PhScale],
  params: z.object({ item: z.enum(KEYS) }).strict(),
  build: ({ item }, b) => askItem(b, ITEMS[item], seedOf(item)),
});
