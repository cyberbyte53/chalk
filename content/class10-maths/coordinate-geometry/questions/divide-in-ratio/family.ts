import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const swapped = t(
  "You swapped the ratio. m₁ multiplies the second point's coordinates: x = (m₁x₂ + m₂x₁)/(m₁ + m₂).",
  "तुमने अनुपात उलट दिया। m₁ दूसरे बिंदु के निर्देशांकों से गुणा होता है: x = (m₁x₂ + m₂x₁)/(m₁ + m₂)।",
);
const middle = t(
  "That's the mid-point (1 : 1). Put the given ratio into the section formula.",
  "यह मध्य-बिंदु (1 : 1) है। दिया गया अनुपात विभाजन सूत्र में रखो।",
);
const noDivide = t("Don't forget to divide by m₁ + m₂.", "m₁ + m₂ से भाग देना मत भूलो।");

const items = {
  ex6: numItem(
    t(
      "Example 6: find the point dividing the join of (4, −3) and (8, 5) in the ratio 3 : 1.",
      "उदाहरण 6: (4, −3) और (8, 5) को मिलाने वाले रेखाखंड को 3 : 1 में बाँटने वाला बिंदु ज्ञात करो।",
    ),
    "(7, 3)",
    [
      ["(5, −1)", swapped],
      ["(6, 1)", middle],
      ["(28, 12)", noDivide],
    ],
  ),
  q1: numItem(
    t(
      "Exercise 7.2 Q1: find the point dividing the join of (−1, 7) and (4, −3) in the ratio 2 : 3.",
      "प्रश्नावली 7.2 प्र1: (−1, 7) और (4, −3) को मिलाने वाले रेखाखंड को 2 : 3 में बाँटने वाला बिंदु ज्ञात करो।",
    ),
    "(1, 3)",
    [
      ["(2, 1)", swapped],
      ["(1.5, 2)", middle],
    ],
  ),
  tower: numItem(
    t(
      "The relay tower: P divides the join of O(0, 0) and B(36, 15) in the ratio 1 : 2. Find P.",
      "रिले टावर: P, O(0, 0) और B(36, 15) को मिलाने वाले रेखाखंड को 1 : 2 में बाँटता है। P ज्ञात करो।",
    ),
    "(12, 5)",
    [
      ["(24, 10)", swapped],
      ["(18, 7.5)", middle],
    ],
  ),
  kOne: numItem(
    t(
      "P divides the join of A(2, 1) and B(10, 9) in the ratio 3 : 1. Find P.",
      "P, A(2, 1) और B(10, 9) को मिलाने वाले रेखाखंड को 3 : 1 में बाँटता है। P ज्ञात करो।",
    ),
    "(8, 7)",
    [
      ["(4, 3)", swapped],
      ["(6, 5)", middle],
    ],
  ),
} satisfies Record<string, Item>;

/** The section formula with numbers (Example 6, Ex 7.2 Q1, the relay tower). */
export const divideInRatio = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.SectionFormula],
});
