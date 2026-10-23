import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, frac, numItem } from "../../kit";

const sumOf = (n: number) =>
  t(
    `Example 13 / Exercise 15.1 Q22 (i). Two dice are thrown together. What is P(the sum is ${n})?`,
    `उदाहरण 13 / प्रश्नावली 15.1 प्रश्न 22 (i). दो पासे एक साथ फेंके जाते हैं। P(योग ${n} है) क्या है?`,
  );
const pairs = (list: string, n: number) =>
  t(`Count the ordered pairs: ${list}. ${n} of 36.`, `क्रमित युग्म गिनो: ${list}। 36 में ${n}।`);
const eleven = t(
  "The 11 sums aren't equally likely; the 36 pairs are.",
  "11 योग समप्रायिक नहीं हैं; 36 युग्म हैं।",
);

/** Example 13, Exercise 15.1 Q22 (i) and Q24: sums on two dice. */
const items = {
  sum3: numItem(sumOf(3), frac(2, 36), [
    [frac(1, 36), pairs("(1, 2), (2, 1)", 2)],
    [frac(1, 11), eleven],
  ]),
  sum4: numItem(sumOf(4), frac(3, 36), [
    [frac(2, 36), pairs("(1, 3), (2, 2), (3, 1)", 3)],
    [frac(1, 11), eleven],
  ]),
  sum5: numItem(sumOf(5), frac(4, 36), [
    [frac(2, 36), pairs("(1, 4), (2, 3), (3, 2), (4, 1)", 4)],
    [frac(1, 11), eleven],
  ]),
  sum6: numItem(sumOf(6), frac(5, 36), [
    [frac(3, 36), pairs("(1, 5), (2, 4), (3, 3), (4, 2), (5, 1)", 5)],
    [frac(1, 11), eleven],
  ]),
  sum7: numItem(sumOf(7), frac(6, 36), [
    [frac(3, 36), pairs("(1, 6), (2, 5), (3, 4), (4, 3), (5, 2), (6, 1)", 6)],
    [frac(1, 11), eleven],
  ]),
  sum8: numItem(sumOf(8), frac(5, 36), [
    [frac(3, 36), pairs("(2, 6), (3, 5), (4, 4), (5, 3), (6, 2)", 5)],
    [frac(1, 11), eleven],
  ]),
  sum9: numItem(sumOf(9), frac(4, 36), [
    [frac(2, 36), pairs("(3, 6), (4, 5), (5, 4), (6, 3)", 4)],
    [frac(1, 11), eleven],
  ]),
  sum10: numItem(sumOf(10), frac(3, 36), [
    [frac(2, 36), pairs("(4, 6), (5, 5), (6, 4)", 3)],
    [frac(1, 11), eleven],
  ]),
  sum11: numItem(sumOf(11), frac(2, 36), [
    [frac(1, 36), pairs("(5, 6), (6, 5)", 2)],
    [frac(1, 11), eleven],
  ]),
  ex13ii: numItem(
    t(
      "Example 13 (ii). Two dice are thrown together. What is P(the sum is 13)?",
      "उदाहरण 13 (ii). दो पासे एक साथ फेंके जाते हैं। P(योग 13 है) क्या है?",
    ),
    "0",
    [
      [
        frac(1, 36),
        t(
          "The biggest sum is 6 + 6 = 12: 13 is impossible.",
          "सबसे बड़ा योग 6 + 6 = 12 है: 13 असंभव है।",
        ),
      ],
      [frac(1, 12), t("No pair adds to 13: P = 0.", "किसी युग्म का योग 13 नहीं: P = 0।")],
    ],
  ),
  ex13iii: numItem(
    t(
      "Example 13 (iii). Two dice are thrown together. What is P(the sum is less than or equal to 12)?",
      "उदाहरण 13 (iii). दो पासे एक साथ फेंके जाते हैं। P(योग 12 या उससे कम है) क्या है?",
    ),
    "1",
    [
      [
        frac(35, 36),
        t(
          "6 + 6 = 12 counts too: all 36 pairs. A sure event.",
          "6 + 6 = 12 भी गिनो: सारे 36 युग्म। निश्चित घटना।",
        ),
      ],
      [
        frac(11, 12),
        t("Every pair adds to 12 or less: 36 of 36.", "हर युग्म का योग 12 या कम है: 36 में 36।"),
      ],
    ],
  ),
  q24i: numItem(
    t(
      "Exercise 15.1 Q24 (i). A die is thrown twice. What is P(5 does not come up either time)?",
      "प्रश्नावली 15.1 प्रश्न 24 (i). एक पासा दो बार फेंका जाता है। P(5 किसी भी बार न आए) क्या है?",
    ),
    frac(25, 36),
    [
      [
        frac(11, 36),
        t(
          '11/36 is "5 at least once". Without a 5: 5 × 5 = 25.',
          '11/36, "कम से कम एक बार 5" है। बिना 5: 5 × 5 = 25।',
        ),
      ],
      [
        frac(24, 36),
        t("Each throw has 5 choices: 5 × 5 = 25 of 36.", "हर फेंक में 5 विकल्प: 36 में 5 × 5 = 25।"),
      ],
    ],
  ),
  q24ii: numItem(
    t(
      "Exercise 15.1 Q24 (ii). A die is thrown twice. What is P(5 comes up at least once)?",
      "प्रश्नावली 15.1 प्रश्न 24 (ii). एक पासा दो बार फेंका जाता है। P(5 कम से कम एक बार आए) क्या है?",
    ),
    frac(11, 36),
    [
      [
        frac(12, 36),
        t(
          "(5, 5) is in both the row and the column: count it once. 11.",
          "(5, 5) पंक्ति और स्तंभ दोनों में है: एक बार गिनो। 11।",
        ),
      ],
      [
        frac(25, 36),
        t(
          "25/36 is no 5 at all. At least once: 1 − 25/36.",
          "25/36 कोई 5 नहीं है। कम से कम एक बार: 1 − 25/36।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Find probabilities for two dice by counting ordered pairs. */
export const twoDiceSums = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.TwoCoinsAndTwoDice],
});
