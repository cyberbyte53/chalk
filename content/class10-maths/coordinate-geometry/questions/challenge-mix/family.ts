import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const items = {
  q1: numItem(
    t(
      "Exercise 7.4 Q1: in what ratio does the line 2x + y − 4 = 0 divide the join of A(2, −2) and B(3, 7)?",
      "प्रश्नावली 7.4 प्र1: रेखा 2x + y − 4 = 0, A(2, −2) और B(3, 7) को मिलाने वाले रेखाखंड को किस अनुपात में बाँटती है?",
    ),
    "2 : 9",
    [
      [
        "9 : 2",
        t(
          "With k : 1, the point is ((3k + 2)/(k + 1), (7k − 2)/(k + 1)); putting it in the line gives 9k = 2, so k = 2/9.",
          "k : 1 से बिंदु ((3k + 2)/(k + 1), (7k − 2)/(k + 1)) है; इसे रेखा में रखने पर 9k = 2, तो k = 2/9।",
        ),
      ],
      [
        "1 : 1",
        t(
          "Check the mid-point (2.5, 2.5): 2 × 2.5 + 2.5 − 4 ≠ 0.",
          "मध्य-बिंदु (2.5, 2.5) जाँचो: 2 × 2.5 + 2.5 − 4 ≠ 0।",
        ),
      ],
    ],
  ),
  q2: numItem(
    t(
      "Exercise 7.4 Q2: (x, y), (1, 2) and (7, 0) are collinear. Which relation holds?",
      "प्रश्नावली 7.4 प्र2: (x, y), (1, 2) और (7, 0) संरेख हैं। कौन-सा संबंध सही है?",
    ),
    "x + 3y = 7",
    [
      ["3x + y = 7", t("Set the area to 0: 2x + 6y − 14 = 0.", "क्षेत्रफल 0 रखो: 2x + 6y − 14 = 0।")],
      ["x − 3y = 7", t("Collect the y-terms: −y + 7y = 6y.", "y वाले पद इकट्ठे करो: −y + 7y = 6y।")],
    ],
  ),
  q3: numItem(
    t(
      "Exercise 7.4 Q3: find the centre of the circle through (6, −6), (3, −7) and (3, 3).",
      "प्रश्नावली 7.4 प्र3: (6, −6), (3, −7) और (3, 3) से जाने वाले वृत्त का केंद्र ज्ञात करो।",
    ),
    "(3, −2)",
    [
      [
        "(4, −10/3)",
        t(
          "That's the centroid. The centre is the point equidistant from all three.",
          "यह केन्द्रक है। केंद्र तीनों से समदूरस्थ बिंदु है।",
        ),
      ],
      [
        "(3, 2)",
        t(
          "Level with the mid-point of (3, −7) and (3, 3): y = −2.",
          "(3, −7) और (3, 3) के मध्य-बिंदु की ऊँचाई पर: y = −2।",
        ),
      ],
    ],
  ),
  q4: numItem(
    t(
      "Exercise 7.4 Q4: opposite vertices of a square are (−1, 2) and (3, 2). The other two are…",
      "प्रश्नावली 7.4 प्र4: एक वर्ग के सम्मुख शीर्ष (−1, 2) और (3, 2) हैं। बाक़ी दो हैं…",
    ),
    "(1, 0) and (1, 4)",
    [
      [
        "(−1, 6) and (3, 6)",
        t(
          "The given points are opposite, so they're a diagonal, not a side.",
          "दिए गए बिंदु सम्मुख हैं, तो विकर्ण हैं, भुजा नहीं।",
        ),
      ],
      [
        "(1, 1) and (1, 3)",
        t(
          "The other diagonal is also 4 long: its ends are 2 from the centre (1, 2).",
          "दूसरा विकर्ण भी 4 लंबा है: उसके सिरे केंद्र (1, 2) से 2 दूर हैं।",
        ),
      ],
    ],
  ),
  q6: numItem(
    t(
      "Exercise 7.4 Q6: in ∆ABC, D and E are on AB and AC with AD/AB = AE/AC = 1/4. Area of ∆ADE : area of ∆ABC is…",
      "प्रश्नावली 7.4 प्र6: ∆ABC में D और E, AB और AC पर हैं जिनमें AD/AB = AE/AC = 1/4। ∆ADE का क्षेत्रफल : ∆ABC का क्षेत्रफल है…",
    ),
    "1 : 16",
    [
      [
        "1 : 4",
        t(
          "Areas of similar triangles go by the square of the side ratio: (1/4)².",
          "समरूप त्रिभुजों के क्षेत्रफल भुजाओं के अनुपात के वर्ग से चलते हैं: (1/4)²।",
        ),
      ],
      [
        "1 : 8",
        t("Square the side ratio: (1/4)² = 1/16.", "भुजाओं के अनुपात का वर्ग करो: (1/4)² = 1/16।"),
      ],
    ],
  ),
  q8: {
    prompt: t(
      "Exercise 7.4 Q8: the mid-points of the sides of the rectangle A(−1, −1), B(−1, 4), C(5, 4), D(5, −1) form…",
      "प्रश्नावली 7.4 प्र8: आयत A(−1, −1), B(−1, 4), C(5, 4), D(5, −1) की भुजाओं के मध्य-बिंदु बनाते हैं…",
    ),
    right: t("a rhombus", "एक समचतुर्भुज"),
    wrong: [
      {
        label: t("a square", "एक वर्ग"),
        why: t(
          "The sides are equal but the diagonals are 6 and 5.",
          "भुजाएँ बराबर हैं पर विकर्ण 6 और 5 हैं।",
        ),
      },
      {
        label: t("a rectangle", "एक आयत"),
        why: t(
          "The diagonals 6 and 5 aren't equal, but all four sides are.",
          "विकर्ण 6 और 5 बराबर नहीं, पर चारों भुजाएँ बराबर हैं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** The optional Exercise 7.4 mixed problems (Q1–Q4, Q6, Q8). */
export const challengeMix = bankFamily(items, {
  level: Level.Hard,
  tests: [Concept.ChallengeAndFinale],
});
