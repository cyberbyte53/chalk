import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const notSquared = t(
  "That's the ratio of the sides. Areas go by its square.",
  "यह भुजाओं का अनुपात है। क्षेत्रफल उसके वर्ग से चलते हैं।",
);

/** Exercise 6.4 Q5, Q7, Q8, Q9 and the banner: ratios of areas. */
const items = {
  q9: numItem(
    t(
      "The sides of two similar triangles are in the ratio 4 : 9. What is the ratio of their areas?",
      "दो समरूप त्रिभुजों की भुजाएँ 4 : 9 के अनुपात में हैं। उनके क्षेत्रफलों का अनुपात क्या है?",
    ),
    "16 : 81",
    [
      ["4 : 9", notSquared],
      [
        "2 : 3",
        t("That's the square root. Square instead: 4² : 9².", "यह वर्गमूल है। वर्ग लो: 4² : 9²।"),
      ],
    ],
  ),
  q5: numItem(
    t(
      "D, E and F are the midpoints of the sides of ∆ ABC. Find ar(DEF) : ar(ABC).",
      "D, E और F, ∆ ABC की भुजाओं के मध्य-बिंदु हैं। ar(DEF) : ar(ABC) ज्ञात करो।",
    ),
    "1 : 4",
    [
      ["1 : 2", notSquared],
      [
        "1 : 3",
        t(
          "The midpoints cut ABC into 4 equal triangles, and DEF is one of them.",
          "मध्य-बिंदु ABC को 4 बराबर त्रिभुजों में काटते हैं, और DEF उनमें से एक है।",
        ),
      ],
    ],
  ),
  q7: numItem(
    t(
      "Equilateral triangles are drawn on a side and on a diagonal of a square. Find the ratio of their areas.",
      "एक वर्ग की एक भुजा और एक विकर्ण पर समबाहु त्रिभुज बनाए गए। उनके क्षेत्रफलों का अनुपात ज्ञात करो।",
    ),
    "1 : 2",
    [
      ["1 : √2", notSquared],
      [
        "1 : 4",
        t(
          "The diagonal is √2 times the side, not 2 times, so the areas are 1 : (√2)² = 1 : 2.",
          "विकर्ण भुजा का √2 गुना है, 2 गुना नहीं, तो क्षेत्रफल 1 : (√2)² = 1 : 2।",
        ),
      ],
    ],
  ),
  q8: numItem(
    t(
      "ABC and BDE are equilateral triangles, and D is the midpoint of BC. Find ar(ABC) : ar(BDE).",
      "ABC और BDE समबाहु त्रिभुज हैं, और D, BC का मध्य-बिंदु है। ar(ABC) : ar(BDE) ज्ञात करो।",
    ),
    "4 : 1",
    [
      ["2 : 1", notSquared],
      [
        "1 : 4",
        t(
          "That's the right numbers, but ABC is the bigger one, so it comes first as 4.",
          "संख्याएँ सही हैं, पर ABC बड़ा है, तो पहले 4 आता है।",
        ),
      ],
    ],
  ),
  banner: numItem(
    t(
      "A triangular banner needs ₹40 of ink. A similar banner 3 times as wide is planned. How much ink?",
      "एक त्रिकोणीय बैनर में ₹40 की स्याही लगती है। उसी आकार का 3 गुना चौड़ा बैनर बनना है। कितनी स्याही?",
    ),
    "₹360",
    [
      ["₹120", notSquared],
      [
        "₹160",
        t(
          "That's for a banner twice as wide (2² = 4). Three times as wide is 3² = 9 times the ink.",
          "यह दोगुने चौड़े बैनर के लिए है (2² = 4)। तीन गुना चौड़ा यानी 3² = 9 गुना स्याही।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Compare the areas of similar triangles. */
export const areaRatio = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.AreasOfSimilarTriangles],
});
