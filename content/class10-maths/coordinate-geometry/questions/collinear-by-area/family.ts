import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const expand = t(
  "Set x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂) = 0, expand each bracket carefully and solve for k.",
  "x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂) = 0 रखो, हर कोष्ठक ध्यान से खोलो और k हल करो।",
);

const items = {
  ex13: {
    prompt: t(
      "Example 13: what is the area of the triangle P(−1.5, 3), Q(6, −2), R(−3, 4)?",
      "उदाहरण 13: त्रिभुज P(−1.5, 3), Q(6, −2), R(−3, 4) का क्षेत्रफल क्या है?",
    ),
    right: t("0: the points are collinear", "0: बिंदु संरेख हैं"),
    wrong: [
      {
        label: t("15: the biggest term", "15: सबसे बड़ा पद"),
        why: t("Add all three terms: 9 + 6 − 15 = 0.", "तीनों पद जोड़ो: 9 + 6 − 15 = 0।"),
      },
      {
        label: t("15/2: half of 15", "15/2: 15 का आधा"),
        why: t(
          "The bracket is 9 + 6 − 15 = 0, so the area is 0.",
          "कोष्ठक 9 + 6 − 15 = 0 है, तो क्षेत्रफल 0।",
        ),
      },
    ],
  },
  ex14: numItem(
    t(
      "Example 14: find k if A(2, 3), B(4, k) and C(6, −3) are collinear.",
      "उदाहरण 14: k ज्ञात करो यदि A(2, 3), B(4, k) और C(6, −3) संरेख हैं।",
    ),
    "0",
    [
      ["3", expand],
      [
        "−3",
        t(
          "B is half-way between A and C in x, so it is half-way in y: (3 + (−3))/2 = 0.",
          "x में B, A और C के ठीक बीच है, तो y में भी: (3 + (−3))/2 = 0।",
        ),
      ],
    ],
  ),
  q2a: numItem(
    t(
      "Exercise 7.3 Q2 (i): find k if (7, −2), (5, 1) and (3, k) are collinear.",
      "प्रश्नावली 7.3 प्र2 (i): k ज्ञात करो यदि (7, −2), (5, 1) और (3, k) संरेख हैं।",
    ),
    "4",
    [
      ["−4", expand],
      ["1", expand],
    ],
  ),
  q2b: numItem(
    t(
      "Exercise 7.3 Q2 (ii): find k if (8, 1), (k, −4) and (2, −5) are collinear.",
      "प्रश्नावली 7.3 प्र2 (ii): k ज्ञात करो यदि (8, 1), (k, −4) और (2, −5) संरेख हैं।",
    ),
    "3",
    [
      ["−3", expand],
      ["5", expand],
    ],
  ),
} satisfies Record<string, Item>;

/** Collinear points have area 0: test it, or find k (Examples 13–14, Ex 7.3 Q2). */
export const collinearByArea = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.AreaOfATriangle],
});
