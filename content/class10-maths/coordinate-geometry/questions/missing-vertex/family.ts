import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const opposite = t(
  "The diagonals of a parallelogram bisect each other: the mid-point of one diagonal (opposite corners) equals the mid-point of the other.",
  "समांतर चतुर्भुज के विकर्ण एक-दूसरे को समद्विभाजित करते हैं: एक विकर्ण (सम्मुख कोनों) का मध्य-बिंदु दूसरे के मध्य-बिंदु के बराबर है।",
);

const items = {
  ex10: numItem(
    t(
      "Example 10: A(6, 1), B(8, 2), C(9, 4) and D(p, 3) are the vertices of a parallelogram, in order. Find p.",
      "उदाहरण 10: A(6, 1), B(8, 2), C(9, 4) और D(p, 3) क्रम से एक समांतर चतुर्भुज के शीर्ष हैं। p ज्ञात करो।",
    ),
    "7",
    [
      ["5", opposite],
      [
        "11",
        t(
          "Pair A with C and B with D, not A with B: (8 + p)/2 = 15/2.",
          "A को C के साथ और B को D के साथ जोड़ो, A को B के साथ नहीं: (8 + p)/2 = 15/2।",
        ),
      ],
    ],
  ),
  q6: numItem(
    t(
      "Exercise 7.2 Q6: (1, 2), (4, y), (x, 6) and (3, 5) are the vertices of a parallelogram, in order. Find x and y.",
      "प्रश्नावली 7.2 प्र6: (1, 2), (4, y), (x, 6) और (3, 5) क्रम से एक समांतर चतुर्भुज के शीर्ष हैं। x और y ज्ञात करो।",
    ),
    "x = 6, y = 3",
    [
      ["x = 3, y = 6", opposite],
      [
        "x = 6, y = 4",
        t(
          "For y: (y + 5)/2 = (2 + 6)/2 = 4, so y = 3.",
          "y के लिए: (y + 5)/2 = (2 + 6)/2 = 4, तो y = 3।",
        ),
      ],
    ],
  ),
  q7: numItem(
    t(
      "Exercise 7.2 Q7: AB is a diameter of a circle with centre (2, −3), and B is (1, 4). Find A.",
      "प्रश्नावली 7.2 प्र7: AB, केंद्र (2, −3) वाले वृत्त का व्यास है, और B (1, 4) है। A ज्ञात करो।",
    ),
    "(3, −10)",
    [
      [
        "(1.5, 0.5)",
        t(
          "That's half-way from the centre to B. The centre is the mid-point of A and B.",
          "यह केंद्र से B तक का आधा है। केंद्र, A और B का मध्य-बिंदु है।",
        ),
      ],
      ["(3, 10)", t("(y + 4)/2 = −3 gives y = −10.", "(y + 4)/2 = −3 से y = −10।")],
    ],
  ),
  q10: numItem(
    t(
      "Exercise 7.2 Q10: find the area of the rhombus with vertices (3, 0), (4, 5), (−1, 4) and (−2, −1), in order. (Area of a rhombus = ½ × product of its diagonals.)",
      "प्रश्नावली 7.2 प्र10: शीर्ष (3, 0), (4, 5), (−1, 4) और (−2, −1) (क्रम से) वाले समचतुर्भुज का क्षेत्रफल ज्ञात करो। (समचतुर्भुज का क्षेत्रफल = ½ × विकर्णों का गुणनफल।)",
    ),
    "24 square units",
    [
      [
        "48 square units",
        t("Remember the ½: ½ × 4√2 × 6√2 = 24.", "½ मत भूलो: ½ × 4√2 × 6√2 = 24।"),
      ],
      [
        "√26 × √26",
        t(
          "That uses the sides. The formula needs the diagonals: 4√2 and 6√2.",
          "यह भुजाएँ लेता है। सूत्र को विकर्ण चाहिए: 4√2 और 6√2।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Missing corners from mid-points: parallelograms, diameters, a rhombus (Example 10, Ex 7.2 Q6, Q7, Q10). */
export const missingVertex = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.UsingSectionFormula],
});
