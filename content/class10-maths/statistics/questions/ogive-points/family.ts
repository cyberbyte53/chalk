import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** Points on the less-than and more-than ogives (Section 14.5, Example 9, Exercise 14.4 Q1–Q3). */
const items = {
  less1412: numItem(
    t(
      "Table 14.12: 0 – 10: 5, 10 – 20: 3, 20 – 30: 4, … Which point is on the less-than ogive?",
      "तालिका 14.12: 0 – 10: 5, 10 – 20: 3, 20 – 30: 4, … से कम प्रकार के तोरण पर कौन-सा बिंदु है?",
    ),
    "(20, 8)",
    [
      [
        "(10, 8)",
        t(
          "A less-than ogive uses upper limits: 8 students scored less than 20, so (20, 8).",
          "से कम प्रकार का तोरण उपरी सीमाएँ लेता है: 20 से कम 8 विद्यार्थी, तो (20, 8)।",
        ),
      ],
      [
        "(20, 3)",
        t(
          "3 is the frequency of 10 – 20. Plot the cumulative frequency: 5 + 3 = 8.",
          "3, 10 – 20 की बारंबारता है। संचयी बारंबारता आलेखित करो: 5 + 3 = 8।",
        ),
      ],
    ],
  ),
  income: numItem(
    t(
      "Exercise 14.4 Q1. Daily income (₹) of 50 workers: 100 – 120: 12, 120 – 140: 14, 140 – 160: 8, 160 – 180: 6, 180 – 200: 10. Which point is on the less-than ogive?",
      "प्रश्नावली 14.4 प्र1। 50 मज़दूरों की दैनिक आय (₹): 100 – 120: 12, 120 – 140: 14, 140 – 160: 8, 160 – 180: 6, 180 – 200: 10। से कम प्रकार के तोरण पर कौन-सा बिंदु है?",
    ),
    "(140, 26)",
    [
      [
        "(120, 26)",
        t(
          "26 workers earn less than ₹140, the upper limit: (140, 26).",
          "26 मज़दूर ₹140, यानी उपरी सीमा, से कम कमाते हैं: (140, 26)।",
        ),
      ],
      [
        "(140, 14)",
        t(
          "14 is just 120 – 140. The cumulative count is 12 + 14 = 26.",
          "14 सिर्फ़ 120 – 140 है। संचयी गिनती 12 + 14 = 26 है।",
        ),
      ],
    ],
  ),
  weights: numItem(
    t(
      "Exercise 14.4 Q2. Weights: less than 44 kg: 9, less than 46 kg: 14, less than 48 kg: 28. Which point is on the less-than ogive?",
      "प्रश्नावली 14.4 प्र2। भार: 44 किग्रा से कम: 9, 46 किग्रा से कम: 14, 48 किग्रा से कम: 28। से कम प्रकार के तोरण पर कौन-सा बिंदु है?",
    ),
    "(46, 14)",
    [
      [
        "(14, 46)",
        t(
          "The x-axis carries the weight and the y-axis the count: (46, 14).",
          "x-अक्ष पर भार और y-अक्ष पर गिनती होती है: (46, 14)।",
        ),
      ],
      [
        "(46, 28)",
        t(
          "28 is below 48. Below 46 there are 14: (46, 14).",
          "28, 48 से नीचे वाले हैं। 46 से नीचे 14 हैं: (46, 14)।",
        ),
      ],
    ],
  ),
  farms: numItem(
    t(
      "Exercise 14.4 Q3. Yield of 100 farms: 50 – 55: 2, 55 – 60: 8, 60 – 65: 12, 65 – 70: 24, 70 – 75: 38, 75 – 80: 16. Which point is on the more-than ogive?",
      "प्रश्नावली 14.4 प्र3। 100 खेतों की उपज: 50 – 55: 2, 55 – 60: 8, 60 – 65: 12, 65 – 70: 24, 70 – 75: 38, 75 – 80: 16। से अधिक प्रकार के तोरण पर कौन-सा बिंदु है?",
    ),
    "(65, 78)",
    [
      [
        "(70, 78)",
        t(
          "A more-than ogive uses lower limits: 78 farms yield 65 or more: (65, 78).",
          "से अधिक प्रकार का तोरण निम्न सीमाएँ लेता है: 78 खेतों की उपज 65 या ज़्यादा: (65, 78)।",
        ),
      ],
      [
        "(65, 22)",
        t(
          "22 farms yield less than 65, a less-than point. 100 − 22 = 78: (65, 78).",
          "22 खेतों की उपज 65 से कम है, यह से कम प्रकार का बिंदु है। 100 − 22 = 78: (65, 78)।",
        ),
      ],
    ],
  ),
  profits: numItem(
    t(
      "Example 9. Profits (₹ lakh) of 30 shops: 5 – 10: 2, 10 – 15: 12, 15 – 20: 2, 20 – 25: 4, 25 – 30: 3, 30 – 35: 4, 35 – 40: 3. Which point is on the more-than ogive?",
      "उदाहरण 9। 30 दुकानों का लाभ (₹ लाख): 5 – 10: 2, 10 – 15: 12, 15 – 20: 2, 20 – 25: 4, 25 – 30: 3, 30 – 35: 4, 35 – 40: 3। से अधिक प्रकार के तोरण पर कौन-सा बिंदु है?",
    ),
    "(20, 14)",
    [
      [
        "(20, 16)",
        t(
          "16 shops earn less than 20. At or above 20 there are 30 − 16 = 14: (20, 14).",
          "16 दुकानें 20 से कम कमाती हैं। 20 या ज़्यादा वाली 30 − 16 = 14 हैं: (20, 14)।",
        ),
      ],
      [
        "(25, 14)",
        t(
          "Plot against the lower limit: 14 shops earn 20 or more, so (20, 14).",
          "निम्न सीमा के सामने आलेखित करो: 14 दुकानें 20 या ज़्यादा कमाती हैं, तो (20, 14)।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

export const ogivePoints = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.Ogives],
});
