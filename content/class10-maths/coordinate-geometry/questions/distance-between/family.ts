import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const legs = t(
  "You added the legs. The distance is the hypotenuse: square each leg, add, then take the root.",
  "तुमने भुजाएँ जोड़ दीं। दूरी कर्ण है: हर भुजा का वर्ग करो, जोड़ो, फिर मूल लो।",
);
const signs = t(
  "Watch the signs: subtracting a negative coordinate adds. Work out x₂ − x₁ and y₂ − y₁ first.",
  "चिह्नों पर ध्यान दो: ऋणात्मक निर्देशांक घटाने से जुड़ता है। पहले x₂ − x₁ और y₂ − y₁ निकालो।",
);
const noRoot = t(
  "That's PQ², not PQ. Take the square root at the end.",
  "यह PQ² है, PQ नहीं। अंत में वर्गमूल लो।",
);

const items = {
  q1a: numItem(
    t(
      "Exercise 7.1 Q1 (i): find the distance between (2, 3) and (4, 1).",
      "प्रश्नावली 7.1 प्र1 (i): (2, 3) और (4, 1) के बीच की दूरी ज्ञात करो।",
    ),
    "2√2",
    [
      ["4", legs],
      ["8", noRoot],
      ["√52", signs],
    ],
  ),
  q1b: numItem(
    t(
      "Exercise 7.1 Q1 (ii): find the distance between (−5, 7) and (−1, 3).",
      "प्रश्नावली 7.1 प्र1 (ii): (−5, 7) और (−1, 3) के बीच की दूरी ज्ञात करो।",
    ),
    "4√2",
    [
      ["8", legs],
      ["√136", signs],
    ],
  ),
  q2: numItem(
    t(
      "Exercise 7.1 Q2: find the distance between (0, 0) and (36, 15).",
      "प्रश्नावली 7.1 प्र2: (0, 0) और (36, 15) के बीच की दूरी ज्ञात करो।",
    ),
    "39",
    [
      ["51", legs],
      ["1521", noRoot],
      ["21", t("That's 36 − 15. Use √(36² + 15²).", "यह 36 − 15 है। √(36² + 15²) लो।")],
    ],
  ),
  across: numItem(
    t(
      "Find the distance between P(6, 4) and Q(−5, −3).",
      "P(6, 4) और Q(−5, −3) के बीच की दूरी ज्ञात करो।",
    ),
    "√170",
    [
      ["18", legs],
      ["√2", signs],
    ],
  ),
  half: numItem(
    t("Find the distance between (1, −2) and (4, 2).", "(1, −2) और (4, 2) के बीच की दूरी ज्ञात करो।"),
    "5",
    [
      ["7", legs],
      ["3", signs],
      ["25", noRoot],
    ],
  ),
} satisfies Record<string, Item>;

/** The distance formula with numbers (Ex 7.1 Q1–2 and the textbook's P(6, 4), Q(−5, −3)). */
export const distanceBetween = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.DistanceFormula],
});
