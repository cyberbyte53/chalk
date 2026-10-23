import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const order = t(
  "From A, the first point of trisection divides AB in 1 : 2 and the second in 2 : 1. Check which ratio you used.",
  "A से, पहला समत्रिभाजन बिंदु AB को 1 : 2 में और दूसरा 2 : 1 में बाँटता है। देखो तुमने कौन-सा अनुपात लिया।",
);

const items = {
  ex8: numItem(
    t(
      "Example 8: the points of trisection of the join of A(2, −2) and B(−7, 4) are…",
      "उदाहरण 8: A(2, −2) और B(−7, 4) को मिलाने वाले रेखाखंड के समत्रिभाजन बिंदु हैं…",
    ),
    "(−1, 0) and (−4, 2)",
    [
      [
        "(−1, 0) and (−2.5, 1)",
        t(
          "(−2.5, 1) is the mid-point. Trisection uses 1 : 2 and 2 : 1.",
          "(−2.5, 1) मध्य-बिंदु है। समत्रिभाजन 1 : 2 और 2 : 1 लेता है।",
        ),
      ],
      [
        "(−3, 0) and (−12, 6)",
        t(
          "Divide by m₁ + m₂ = 3: x = (1 × (−7) + 2 × 2)/3 = −1.",
          "m₁ + m₂ = 3 से भाग दो: x = (1 × (−7) + 2 × 2)/3 = −1।",
        ),
      ],
    ],
  ),
  q2: numItem(
    t(
      "Exercise 7.2 Q2: the point of trisection of the join of (4, −1) and (−2, −3) nearer (4, −1) is…",
      "प्रश्नावली 7.2 प्र2: (4, −1) और (−2, −3) को मिलाने वाले रेखाखंड का (4, −1) के पास वाला समत्रिभाजन बिंदु है…",
    ),
    "(2, −5/3)",
    [
      ["(0, −7/3)", order],
      ["(1, −2)", t("(1, −2) is the mid-point. Use 1 : 2.", "(1, −2) मध्य-बिंदु है। 1 : 2 लो।")],
    ],
  ),
  q9: numItem(
    t(
      "Exercise 7.2 Q9: the points dividing the join of A(−2, 2) and B(2, 8) into four equal parts are…",
      "प्रश्नावली 7.2 प्र9: A(−2, 2) और B(2, 8) को मिलाने वाले रेखाखंड को चार बराबर भागों में बाँटने वाले बिंदु हैं…",
    ),
    "(−1, 7/2), (0, 5), (1, 13/2)",
    [
      [
        "(−1, 3), (0, 5), (1, 7)",
        t(
          "Check the y's: 2 + 6 × ¼ = 3.5, so the first is (−1, 7/2).",
          "y जाँचो: 2 + 6 × ¼ = 3.5, तो पहला (−1, 7/2) है।",
        ),
      ],
      [
        "(0, 5) and (1, 13/2) only",
        t(
          "Four equal parts need three points: 1 : 3, 1 : 1 and 3 : 1.",
          "चार बराबर भागों के लिए तीन बिंदु चाहिए: 1 : 3, 1 : 1 और 3 : 1।",
        ),
      ],
    ],
  ),
  q8: numItem(
    t(
      "Exercise 7.2 Q8: A(−2, −2), B(2, −4), and P on AB with AP = (3/7)AB. Find P.",
      "प्रश्नावली 7.2 प्र8: A(−2, −2), B(2, −4), और AB पर P जिसमें AP = (3/7)AB। P ज्ञात करो।",
    ),
    "(−2/7, −20/7)",
    [
      [
        "(2/7, −22/7)",
        t(
          "AP = 3/7 of AB leaves PB = 4/7, so the ratio is 3 : 4, not 4 : 3.",
          "AP = AB का 3/7, तो PB = 4/7 बचता है; अनुपात 3 : 4 है, 4 : 3 नहीं।",
        ),
      ],
      [
        "(−4/5, −13/5)",
        t(
          "3 : 7 would make AP = 3/10 of AB. AP : PB = 3 : 4.",
          "3 : 7 से AP, AB का 3/10 होगा। AP : PB = 3 : 4।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Trisection, four equal parts and a fraction of the way (Example 8, Ex 7.2 Q2, Q8, Q9). */
export const equalParts = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.UsingSectionFormula],
});
