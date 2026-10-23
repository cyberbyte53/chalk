import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const noRoot = t(
  "The areas' ratio is the square of the sides' ratio, so take the square root first.",
  "क्षेत्रफलों का अनुपात भुजाओं के अनुपात का वर्ग है, तो पहले वर्गमूल लो।",
);

/** Exercise 6.4 Q1, the half-area line and one more: a side from areas. */
const items = {
  q1: numItem(
    t(
      "∆ ABC ~ ∆ DEF, ar(ABC) = 64 cm² and ar(DEF) = 121 cm². EF = 15.4 cm. Find BC.",
      "∆ ABC ~ ∆ DEF, ar(ABC) = 64 cm² और ar(DEF) = 121 cm²। EF = 15.4 cm। BC ज्ञात करो।",
    ),
    "11.2 cm",
    [
      ["8.1 cm", noRoot],
      [
        "21.2 cm",
        t(
          "ABC is the smaller triangle, so BC is shorter than EF: 15.4 × 8/11.",
          "ABC छोटा त्रिभुज है, तो BC, EF से छोटी है: 15.4 × 8/11।",
        ),
      ],
    ],
  ),
  half: numItem(
    t(
      "A line parallel to BC cuts AB at P and halves the area of ∆ ABC. AB = 10 cm. Find AP.",
      "BC के समांतर एक रेखा AB को P पर काटती है और ∆ ABC का क्षेत्रफल आधा करती है। AB = 10 cm। AP ज्ञात करो।",
    ),
    "7.1 cm",
    [
      [
        "5 cm",
        t(
          "Halving the side quarters the area. (AP/AB)² = 1/2, so AP = 10/√2.",
          "भुजा आधी करने से क्षेत्रफल चौथाई होता है। (AP/AB)² = 1/2, तो AP = 10/√2।",
        ),
      ],
      [
        "7.5 cm",
        t(
          "(AP/AB)² = 1/2, so AP/AB = 1/√2 ≈ 0.71, not 3/4.",
          "(AP/AB)² = 1/2, तो AP/AB = 1/√2 ≈ 0.71, 3/4 नहीं।",
        ),
      ],
    ],
  ),
  bigger: numItem(
    t(
      "Two similar triangles have areas 25 cm² and 36 cm². A side of the smaller is 10 cm. Find the matching side of the bigger.",
      "दो समरूप त्रिभुजों के क्षेत्रफल 25 cm² और 36 cm² हैं। छोटे की एक भुजा 10 cm है। बड़े की संगत भुजा ज्ञात करो।",
    ),
    "12 cm",
    [
      ["14.4 cm", noRoot],
      [
        "11 cm",
        t(
          "Use the ratio √25 : √36 = 5 : 6, so 10 × 6/5.",
          "अनुपात √25 : √36 = 5 : 6 लो, तो 10 × 6/5।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Find a side of a similar triangle from the ratio of areas. */
export const sideFromArea = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.AreasOfSimilarTriangles],
});
