import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const items = {
  ex15: {
    prompt: t(
      "Example 15: the diagonal BD splits the quadrilateral ABCD into ∆ABD = 53 and ∆BCD = 19 square units. The area of ABCD is…",
      "उदाहरण 15: विकर्ण BD चतुर्भुज ABCD को ∆ABD = 53 और ∆BCD = 19 वर्ग इकाई में बाँटता है। ABCD का क्षेत्रफल है…",
    ),
    right: t("72 square units", "72 वर्ग इकाई"),
    wrong: [
      {
        label: t("34 square units", "34 वर्ग इकाई"),
        why: t(
          "The triangles don't overlap: add, don't subtract.",
          "त्रिभुज एक-दूसरे पर नहीं चढ़ते: जोड़ो, घटाओ नहीं।",
        ),
      },
      {
        label: t("36 square units", "36 वर्ग इकाई"),
        why: t(
          "The triangle areas already include the ½: 53 + 19.",
          "त्रिभुजों के क्षेत्रफल में ½ पहले से है: 53 + 19।",
        ),
      },
    ],
  },
  q4: {
    prompt: t(
      "Exercise 7.3 Q4: the area of the quadrilateral with vertices (−4, −2), (−3, −5), (3, −2), (2, 3), in order, is…",
      "प्रश्नावली 7.3 प्र4: शीर्ष (−4, −2), (−3, −5), (3, −2), (2, 3) (क्रम से) वाले चतुर्भुज का क्षेत्रफल है…",
    ),
    right: t("28 square units", "28 वर्ग इकाई"),
    wrong: [
      {
        label: t("56 square units", "56 वर्ग इकाई"),
        why: t(
          "Each triangle needs its ½: 10.5 + 17.5 = 28.",
          "हर त्रिभुज को उसका ½ चाहिए: 10.5 + 17.5 = 28।",
        ),
      },
      {
        label: t("17.5 square units", "17.5 वर्ग इकाई"),
        why: t(
          "That's one of the two triangles. Add the other, 10.5.",
          "यह दो त्रिभुजों में से एक है। दूसरा, 10.5, जोड़ो।",
        ),
      },
    ],
  },
  q3: {
    prompt: t(
      "Exercise 7.3 Q3: the triangle (0, −1), (2, 1), (0, 3) has area 4. Its mid-point triangle has vertices (1, 0), (1, 2), (0, 1). The ratio of the small area to the big one is…",
      "प्रश्नावली 7.3 प्र3: त्रिभुज (0, −1), (2, 1), (0, 3) का क्षेत्रफल 4 है। उसके मध्य-बिंदुओं वाले त्रिभुज के शीर्ष (1, 0), (1, 2), (0, 1) हैं। छोटे क्षेत्रफल का बड़े से अनुपात है…",
    ),
    right: t("1 : 4", "1 : 4"),
    wrong: [
      {
        label: t("1 : 2", "1 : 2"),
        why: t(
          "The sides halve, so the area goes by (½)² = ¼. The small area is 1.",
          "भुजाएँ आधी होती हैं, तो क्षेत्रफल (½)² = ¼ से। छोटा क्षेत्रफल 1 है।",
        ),
      },
      {
        label: t("1 : 3", "1 : 3"),
        why: t(
          "The mid-points cut the triangle into 4 equal triangles, not 3.",
          "मध्य-बिंदु त्रिभुज को 4 बराबर त्रिभुजों में काटते हैं, 3 में नहीं।",
        ),
      },
    ],
  },
  q5: {
    prompt: t(
      "Exercise 7.3 Q5: in ∆ABC with A(4, −6), B(3, −2), C(5, 2), the median AD splits it into two triangles. Their areas are…",
      "प्रश्नावली 7.3 प्र5: ∆ABC में, जहाँ A(4, −6), B(3, −2), C(5, 2), माध्यिका AD इसे दो त्रिभुजों में बाँटती है। उनके क्षेत्रफल हैं…",
    ),
    right: t("3 and 3", "3 और 3"),
    wrong: [
      {
        label: t("6 and 6", "6 और 6"),
        why: t("6 is the whole triangle. Each half is 3.", "6 पूरा त्रिभुज है। हर आधा 3 है।"),
      },
      {
        label: t("2 and 4", "2 और 4"),
        why: t(
          "A median gives two triangles with equal bases (BD = DC) and the same height, so equal areas.",
          "माध्यिका से बराबर आधार (BD = DC) और एक ही ऊँचाई वाले दो त्रिभुज बनते हैं, तो क्षेत्रफल बराबर।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Areas of shapes built from triangles: quadrilaterals, the mid-point triangle, a median (Example 15, Ex 7.3 Q3–5). */
export const areaOfShapes = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.AreaOfATriangle],
});
