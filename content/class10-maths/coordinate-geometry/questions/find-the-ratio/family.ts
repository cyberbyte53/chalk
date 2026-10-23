import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const flipped = t(
  "The ratio is AP : PB. A point near the first end gives a small first number. Solve for m₁ : m₂ from one coordinate.",
  "अनुपात AP : PB है। पहले सिरे के पास का बिंदु छोटी पहली संख्या देता है। एक निर्देशांक से m₁ : m₂ हल करो।",
);
const axisRule = t(
  "On the y-axis x = 0, and on the x-axis y = 0. Set that coordinate of (kx₂ + x₁)/(k + 1) to 0 and solve for k.",
  "y-अक्ष पर x = 0, और x-अक्ष पर y = 0। (kx₂ + x₁)/(k + 1) का वह निर्देशांक 0 रखकर k हल करो।",
);

const items = {
  ex7: numItem(
    t(
      "Example 7: in what ratio does (−4, 6) divide the join of A(−6, 10) and B(3, −8)?",
      "उदाहरण 7: (−4, 6), A(−6, 10) और B(3, −8) को मिलाने वाले रेखाखंड को किस अनुपात में बाँटता है?",
    ),
    "2 : 7",
    [
      ["7 : 2", flipped],
      [
        "1 : 3",
        t("Test it: 1 : 3 gives x = (3 − 18)/4, not −4.", "जाँचो: 1 : 3 से x = (3 − 18)/4, −4 नहीं।"),
      ],
    ],
  ),
  q4: numItem(
    t(
      "Exercise 7.2 Q4: in what ratio does (−1, 6) divide the join of (−3, 10) and (6, −8)?",
      "प्रश्नावली 7.2 प्र4: (−1, 6), (−3, 10) और (6, −8) को मिलाने वाले रेखाखंड को किस अनुपात में बाँटता है?",
    ),
    "2 : 7",
    [
      ["7 : 2", flipped],
      [
        "1 : 2",
        t(
          "Test it: 1 : 2 gives x = (6 − 6)/3 = 0, not −1.",
          "जाँचो: 1 : 2 से x = (6 − 6)/3 = 0, −1 नहीं।",
        ),
      ],
    ],
  ),
  ex9: numItem(
    t(
      "Example 9: in what ratio does the y-axis divide the join of (5, −6) and (−1, −4)?",
      "उदाहरण 9: y-अक्ष, (5, −6) और (−1, −4) को मिलाने वाले रेखाखंड को किस अनुपात में बाँटता है?",
    ),
    "5 : 1",
    [
      ["1 : 5", flipped],
      ["3 : 2", axisRule],
    ],
  ),
  q5: numItem(
    t(
      "Exercise 7.2 Q5: in what ratio does the x-axis divide the join of A(1, −5) and B(−4, 5)?",
      "प्रश्नावली 7.2 प्र5: x-अक्ष, A(1, −5) और B(−4, 5) को मिलाने वाले रेखाखंड को किस अनुपात में बाँटता है?",
    ),
    "1 : 1",
    [
      ["4 : 1", axisRule],
      ["1 : 4", axisRule],
    ],
  ),
  ex9point: numItem(
    t(
      "Example 9 again: the y-axis divides the join of (5, −6) and (−1, −4) in 5 : 1. Where does it cut?",
      "उदाहरण 9 फिर: y-अक्ष, (5, −6) और (−1, −4) को मिलाने वाले रेखाखंड को 5 : 1 में बाँटता है। यह कहाँ काटता है?",
    ),
    "(0, −13/3)",
    [
      [
        "(0, −17/3)",
        t(
          "You used 1 : 5. With 5 : 1, y = (5 × (−4) + (−6))/6.",
          "तुमने 1 : 5 लिया। 5 : 1 से y = (5 × (−4) + (−6))/6।",
        ),
      ],
      [
        "(−13/3, 0)",
        t(
          "On the y-axis the x-coordinate is 0: the point is (0, y).",
          "y-अक्ष पर x-निर्देशांक 0 है: बिंदु (0, y) है।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Running the section formula backwards: the ratio, and where an axis cuts (Examples 7, 9; Ex 7.2 Q4–5). */
export const findTheRatio = bankFamily(items, {
  level: Level.Hard,
  tests: [Concept.UsingSectionFormula],
});
