import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const flipped = t(
  "That's the ratio upside down. The longer shadow belongs to the taller thing.",
  "यह उल्टा अनुपात है। लंबी छाया ऊँची चीज़ की होती है।",
);
const added = t(
  "Heights and shadows are in one ratio, so multiply; don't add the difference.",
  "ऊँचाई और छाया एक अनुपात में हैं, तो गुणा करो; अंतर मत जोड़ो।",
);

/** Exercise 6.3 Q15, the water tank and Example 7: heights from shadows. */
const items = {
  q15: numItem(
    t(
      "A 6 m pole casts a 4 m shadow while a tower casts a 28 m shadow. How tall is the tower?",
      "6 m का खंभा 4 m की छाया डालता है जबकि एक मीनार 28 m की छाया। मीनार कितनी ऊँची है?",
    ),
    "42 m",
    [
      ["18⅔ m", flipped],
      ["30 m", added],
    ],
  ),
  tank: numItem(
    t(
      "A 1.5 m stick casts a 1 m shadow. At the same time the water tank's shadow is 10 m. How tall is the tank?",
      "1.5 m की छड़ी 1 m की छाया डालती है। उसी समय पानी की टंकी की छाया 10 m है। टंकी कितनी ऊँची है?",
    ),
    "15 m",
    [
      ["6⅔ m", flipped],
      ["10.5 m", added],
    ],
  ),
  ex7: numItem(
    t(
      "A girl 90 cm tall walks away from a 3.6 m lamp post at 1.2 m/s. How long is her shadow after 4 s?",
      "90 cm लंबी एक लड़की 3.6 m ऊँचे लैंप-पोस्ट से 1.2 m/s की चाल से दूर जाती है। 4 s बाद उसकी छाया कितनी लंबी है?",
    ),
    "1.6 m",
    [
      [
        "1.2 m",
        t(
          "That's a quarter of 4.8 m, but the shadow sits beyond her: x/(x + 4.8) = 0.9/3.6.",
          "यह 4.8 m का चौथाई है, पर छाया उसके आगे है: x/(x + 4.8) = 0.9/3.6।",
        ),
      ],
      [
        "4.8 m",
        t(
          "4.8 m is how far she walked (1.2 × 4). The shadow x solves x/(x + 4.8) = 0.9/3.6.",
          "4.8 m वह दूरी है जो वह चली (1.2 × 4)। छाया x, x/(x + 4.8) = 0.9/3.6 से मिलती है।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Find a height or a shadow with similar triangles. */
export const shadowHeights = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.SasAndUsingSimilarity],
});
