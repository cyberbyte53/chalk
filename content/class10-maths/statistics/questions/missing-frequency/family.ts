import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** Missing frequencies from a known median (Example 8, Exercise 14.3 Q2). */
const items = {
  ex8sum: numItem(
    t(
      "Example 8. 100 policies: 0 – 100: 2, 100 – 200: 5, 200 – 300: x, 300 – 400: 12, 400 – 500: 17, 500 – 600: 20, 600 – 700: y, 700 – 800: 9, 800 – 900: 7, 900 – 1000: 4. What is x + y?",
      "उदाहरण 8। 100 पॉलिसियाँ: 0 – 100: 2, 100 – 200: 5, 200 – 300: x, 300 – 400: 12, 400 – 500: 17, 500 – 600: 20, 600 – 700: y, 700 – 800: 9, 800 – 900: 7, 900 – 1000: 4। x + y क्या है?",
    ),
    "24",
    [
      [
        "76",
        t(
          "76 is the total of the known frequencies. x + y = 100 − 76 = 24.",
          "76 ज्ञात बारंबारताओं का योग है। x + y = 100 − 76 = 24।",
        ),
      ],
      [
        "50",
        t(
          "50 is n/2. Use the total: 76 + x + y = 100, so x + y = 24.",
          "50, n/2 है। कुल योग लो: 76 + x + y = 100, तो x + y = 24।",
        ),
      ],
    ],
  ),
  ex8: numItem(
    t(
      "Example 8. The median of those 100 policies is 525, with x + y = 24. Find x and y.",
      "उदाहरण 8। उन 100 पॉलिसियों का माध्यक 525 है, और x + y = 24। x और y ज्ञात करो।",
    ),
    "x = 9, y = 15",
    [
      [
        "x = 15, y = 9",
        t(
          "Solve 525 = 500 + ((50 − 36 − x)/20) × 100: 14 − x = 5, so x = 9 and y = 15.",
          "525 = 500 + ((50 − 36 − x)/20) × 100 हल करो: 14 − x = 5, तो x = 9 और y = 15।",
        ),
      ],
      [
        "x = 5, y = 19",
        t("5 is 14 − x, not x. So x = 9 and y = 15.", "5 तो 14 − x है, x नहीं। तो x = 9 और y = 15।"),
      ],
    ],
  ),
  q2sum: numItem(
    t(
      "Exercise 14.3 Q2. 60 observations: 0 – 10: 5, 10 – 20: x, 20 – 30: 20, 30 – 40: 15, 40 – 50: y, 50 – 60: 5. What is x + y?",
      "प्रश्नावली 14.3 प्र2। 60 प्रेक्षण: 0 – 10: 5, 10 – 20: x, 20 – 30: 20, 30 – 40: 15, 40 – 50: y, 50 – 60: 5। x + y क्या है?",
    ),
    "15",
    [
      [
        "45",
        t(
          "45 is the total of the known frequencies. x + y = 60 − 45 = 15.",
          "45 ज्ञात बारंबारताओं का योग है। x + y = 60 − 45 = 15।",
        ),
      ],
      [
        "30",
        t(
          "30 is n/2. Use the total: 45 + x + y = 60, so x + y = 15.",
          "30, n/2 है। कुल योग लो: 45 + x + y = 60, तो x + y = 15।",
        ),
      ],
    ],
  ),
  q2: numItem(
    t(
      "Exercise 14.3 Q2. The median of those 60 observations is 28.5, with x + y = 15. Find x and y.",
      "प्रश्नावली 14.3 प्र2। उन 60 प्रेक्षणों का माध्यक 28.5 है, और x + y = 15। x और y ज्ञात करो।",
    ),
    "x = 8, y = 7",
    [
      [
        "x = 7, y = 8",
        t(
          "From 28.5 = 20 + ((30 − 5 − x)/20) × 10, 25 − x = 17: x = 8, y = 7.",
          "28.5 = 20 + ((30 − 5 − x)/20) × 10 से 25 − x = 17: x = 8, y = 7।",
        ),
      ],
      [
        "x = 5, y = 10",
        t(
          "Use the median: 8.5 = (25 − x)/2 gives x = 8, so y = 7.",
          "माध्यक लगाओ: 8.5 = (25 − x)/2 से x = 8, तो y = 7।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

export const missingFrequency = bankFamily(items, {
  level: Level.Hard,
  tests: [Concept.MedianOfGroupedData],
});
