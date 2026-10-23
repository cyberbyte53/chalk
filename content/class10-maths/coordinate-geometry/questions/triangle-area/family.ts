import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const half = t("Don't forget the ½ in front of the bracket.", "कोष्ठक के आगे का ½ मत भूलो।");
const negative = t(
  "An area is the numerical value: drop the minus sign.",
  "क्षेत्रफल संख्यात्मक मान है: ऋण चिह्न हटा दो।",
);
const signs = t(
  "Check each term's sign: x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂), with brackets round negatives.",
  "हर पद का चिह्न जाँचो: x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂), ऋणात्मकों के चारों ओर कोष्ठक लगाकर।",
);

const items = {
  ex11: numItem(
    t(
      "Example 11: find the area of the triangle with vertices (1, −1), (−4, 6) and (−3, −5).",
      "उदाहरण 11: शीर्ष (1, −1), (−4, 6) और (−3, −5) वाले त्रिभुज का क्षेत्रफल ज्ञात करो।",
    ),
    "24",
    [
      ["48", half],
      ["−24", negative],
      ["10", signs],
    ],
  ),
  ex12: numItem(
    t(
      "Example 12: find the area of the triangle A(5, 2), B(4, 7), C(7, −4).",
      "उदाहरण 12: त्रिभुज A(5, 2), B(4, 7), C(7, −4) का क्षेत्रफल ज्ञात करो।",
    ),
    "2",
    [
      ["−2", negative],
      ["4", half],
    ],
  ),
  q1a: numItem(
    t(
      "Exercise 7.3 Q1 (i): find the area of the triangle with vertices (2, 3), (−1, 0) and (2, −4).",
      "प्रश्नावली 7.3 प्र1 (i): शीर्ष (2, 3), (−1, 0) और (2, −4) वाले त्रिभुज का क्षेत्रफल ज्ञात करो।",
    ),
    "21/2",
    [
      ["21", half],
      ["7/2", signs],
    ],
  ),
  q1b: numItem(
    t(
      "Exercise 7.3 Q1 (ii): find the area of the triangle with vertices (−5, −1), (3, −5) and (5, 2).",
      "प्रश्नावली 7.3 प्र1 (ii): शीर्ष (−5, −1), (3, −5) और (5, 2) वाले त्रिभुज का क्षेत्रफल ज्ञात करो।",
    ),
    "32",
    [
      ["64", half],
      ["−32", negative],
    ],
  ),
  herbs: numItem(
    t(
      "Mom's herb patch has corners (2, 1), (8, 3) and (4, 7), in metres. Find its area in m².",
      "मम्मी की क्यारी के कोने (2, 1), (8, 3) और (4, 7) हैं, मीटर में। इसका क्षेत्रफल m² में ज्ञात करो।",
    ),
    "16",
    [
      ["32", half],
      ["8", signs],
    ],
  ),
} satisfies Record<string, Item>;

/** The area of a triangle from its vertices (Examples 11–12, Ex 7.3 Q1). */
export const triangleArea = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.AreaOfATriangle],
});
