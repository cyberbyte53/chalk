import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const diagonals = t(
  "Compare the diagonals too: equal sides with equal diagonals make a square; equal sides with unequal diagonals make a rhombus.",
  "विकर्ण भी मिलाओ: बराबर भुजाएँ और बराबर विकर्ण से वर्ग बनता है; बराबर भुजाएँ और असमान विकर्ण से समचतुर्भुज।",
);
const sides = t(
  "Find all four sides with the distance formula before naming the shape.",
  "आकृति का नाम बताने से पहले दूरी सूत्र से चारों भुजाएँ निकालो।",
);

const items = {
  ex1: {
    prompt: t(
      "Example 1: what kind of triangle do (3, 2), (−2, −3) and (2, 3) form? (The squared sides are 50, 52 and 2.)",
      "उदाहरण 1: (3, 2), (−2, −3) और (2, 3) कैसा त्रिभुज बनाते हैं? (भुजाओं के वर्ग 50, 52 और 2 हैं।)",
    ),
    right: t("A right triangle", "समकोण त्रिभुज"),
    wrong: [
      {
        label: t("An isosceles triangle", "समद्विबाहु त्रिभुज"),
        why: t(
          "No two of 50, 52, 2 are equal. But 50 + 2 = 52.",
          "50, 52, 2 में से कोई दो बराबर नहीं। पर 50 + 2 = 52।",
        ),
      },
      {
        label: t("Not a triangle at all", "त्रिभुज ही नहीं"),
        why: t(
          "√50 + √2 ≈ 8.5 is more than √52 ≈ 7.2, so the points aren't in a line: it is a triangle.",
          "√50 + √2 ≈ 8.5, √52 ≈ 7.2 से बड़ा है, तो बिंदु एक रेखा में नहीं: यह त्रिभुज है।",
        ),
      },
    ],
  },
  q6a: {
    prompt: t(
      "Exercise 7.1 Q6 (i): what quadrilateral do (−1, −2), (1, 0), (−1, 2) and (−3, 0) form?",
      "प्रश्नावली 7.1 प्र6 (i): (−1, −2), (1, 0), (−1, 2) और (−3, 0) कौन-सा चतुर्भुज बनाते हैं?",
    ),
    right: t("A square", "वर्ग"),
    wrong: [
      { label: t("A rhombus", "समचतुर्भुज"), why: diagonals },
      {
        label: t("A rectangle", "आयत"),
        why: t(
          "Here all four sides are equal (2√2) and the diagonals are equal (4): that's a square.",
          "यहाँ चारों भुजाएँ बराबर (2√2) हैं और विकर्ण बराबर (4): यह वर्ग है।",
        ),
      },
    ],
  },
  q6c: {
    prompt: t(
      "Exercise 7.1 Q6 (iii): what quadrilateral do (4, 5), (7, 6), (4, 3) and (1, 2) form?",
      "प्रश्नावली 7.1 प्र6 (iii): (4, 5), (7, 6), (4, 3) और (1, 2) कौन-सा चतुर्भुज बनाते हैं?",
    ),
    right: t("A parallelogram", "समांतर चतुर्भुज"),
    wrong: [
      {
        label: t("A rectangle", "आयत"),
        why: t(
          "Opposite sides are equal (√10 and √18), but the diagonals are 2 and √52: not equal, so not a rectangle.",
          "सम्मुख भुजाएँ बराबर हैं (√10 और √18), पर विकर्ण 2 और √52 हैं: बराबर नहीं, तो आयत नहीं।",
        ),
      },
      { label: t("A rhombus", "समचतुर्भुज"), why: sides },
    ],
  },
  q4: {
    prompt: t(
      "Exercise 7.1 Q4: what kind of triangle has vertices (5, −2), (6, 4) and (7, −2)?",
      "प्रश्नावली 7.1 प्र4: शीर्ष (5, −2), (6, 4) और (7, −2) वाला त्रिभुज कैसा है?",
    ),
    right: t("Isosceles", "समद्विबाहु"),
    wrong: [
      {
        label: t("Equilateral", "समबाहु"),
        why: t("Two sides are √37 but the third is 2.", "दो भुजाएँ √37 हैं पर तीसरी 2 है।"),
      },
      {
        label: t("Right-angled", "समकोण"),
        why: t(
          "37 + 4 ≠ 37 and 37 + 37 ≠ 4: Pythagoras fails.",
          "37 + 4 ≠ 37 और 37 + 37 ≠ 4: पाइथागोरस नहीं लगता।",
        ),
      },
    ],
  },
  q5: {
    prompt: t(
      "Exercise 7.1 Q5: A(3, 4), B(6, 7), C(9, 4), D(6, 1). Sides 3√2 each, diagonals AC = BD = 6. ABCD is…",
      "प्रश्नावली 7.1 प्र5: A(3, 4), B(6, 7), C(9, 4), D(6, 1)। हर भुजा 3√2, विकर्ण AC = BD = 6। ABCD है…",
    ),
    right: t("a square", "एक वर्ग"),
    wrong: [
      { label: t("a rhombus only", "केवल समचतुर्भुज"), why: diagonals },
      {
        label: t("a kite", "पतंग"),
        why: t(
          "A kite has two pairs of equal neighbouring sides. Here all four are equal, and the diagonals too.",
          "पतंग में पास की भुजाओं के दो बराबर जोड़े होते हैं। यहाँ चारों बराबर हैं, और विकर्ण भी।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Naming a triangle or quadrilateral from its sides and diagonals (Examples 1–2, Ex 7.1 Q4–6). */
export const whichShape = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.UsingDistances],
});
