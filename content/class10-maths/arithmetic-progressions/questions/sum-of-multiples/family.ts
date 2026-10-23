import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const r = String.raw;

const halve = t("That's n(a + l), which is 2S. Halve it.", "यह n(a + l) है, जो 2S है। आधा करो।");

/** Example 14, Gauss, Exercise 5.3 Q12–Q14: sums of whole numbers and of multiples. */
const items = {
  gauss: numItem(t("What is 1 + 2 + 3 + … + 100?", "1 + 2 + 3 + … + 100 कितना है?"), "5050", [
    ["10100", halve],
    ["5000", t("100 × 101 ÷ 2 = 5050.", "100 × 101 ÷ 2 = 5050।")],
  ]),
  ex14i: numItem(t("What is 1 + 2 + 3 + … + 1000?", "1 + 2 + 3 + … + 1000 कितना है?"), "500500", [
    ["1001000", halve],
    ["500000", t("1000 × 1001 ÷ 2 = 500500.", "1000 × 1001 ÷ 2 = 500500।")],
  ]),
  ex14ii: numItem(
    t("The sum of the first n positive integers is", "पहले n धन पूर्णांकों का योग है"),
    r`$\dfrac{n(n + 1)}{2}$`,
    [
      [r`$n(n + 1)$`, halve],
      [
        r`$\dfrac{n(n - 1)}{2}$`,
        t("The last term is n, so a + l = 1 + n.", "अंतिम पद n है, तो a + l = 1 + n।"),
      ],
    ],
  ),
  q12: numItem(
    t(
      "Find the sum of the first 40 positive integers divisible by 6.",
      "6 से विभाज्य पहले 40 धन पूर्णांकों का योग ज्ञात करो।",
    ),
    "4920",
    [
      [
        "240",
        t(
          "240 is the 40th one. Add all 40: 20 × (6 + 240).",
          "240 चालीसवाँ है। सारे 40 जोड़ो: 20 × (6 + 240)।",
        ),
      ],
      ["9840", halve],
    ],
  ),
  q13: numItem(
    t("Find the sum of the first 15 multiples of 8.", "8 के पहले 15 गुणजों का योग ज्ञात करो।"),
    "960",
    [
      ["120", t("120 is the 15th multiple, 15 × 8.", "120 पंद्रहवाँ गुणज है, 15 × 8।")],
      ["1920", halve],
    ],
  ),
  q14: numItem(
    t(
      "Find the sum of the odd numbers between 0 and 50.",
      "0 और 50 के बीच विषम संख्याओं का योग ज्ञात करो।",
    ),
    "625",
    [
      [
        "1275",
        t(
          "That's 1 + 2 + … + 50, every number. Only odd ones: 1, 3, …, 49 (25 terms).",
          "यह 1 + 2 + … + 50 है, हर संख्या। सिर्फ़ विषम: 1, 3, …, 49 (25 पद)।",
        ),
      ],
      [
        "600",
        t(
          "There are 25 odd numbers, and 25/2 × (1 + 49) = 625.",
          "25 विषम संख्याएँ हैं, और 25/2 × (1 + 49) = 625।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Sums of consecutive whole numbers and of multiples. */
export const sumOfMultiples = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.SumOfNTerms],
});
