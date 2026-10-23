import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const yes = t("Yes, collinear", "हाँ, संरेख");
const no = t("No, not collinear", "नहीं, संरेख नहीं");
const add = t(
  "Find the three distances and test whether the two shorter ones add up to the longest.",
  "तीनों दूरियाँ निकालो और देखो कि दो छोटी मिलकर सबसे बड़ी बनती हैं या नहीं।",
);
const squares = t(
  "Adding squares tests for a right angle. For a line, add the distances themselves.",
  "वर्ग जोड़ना समकोण की जाँच है। रेखा के लिए दूरियाँ ही जोड़ो।",
);

const items = {
  ex3: {
    prompt: t(
      "Example 3: are the desks A(3, 1), B(6, 4) and C(8, 6) collinear? (AB = 3√2, BC = 2√2, AC = 5√2)",
      "उदाहरण 3: क्या डेस्कें A(3, 1), B(6, 4) और C(8, 6) संरेख हैं? (AB = 3√2, BC = 2√2, AC = 5√2)",
    ),
    right: yes,
    wrong: [{ label: no, why: add }],
  },
  q3: {
    prompt: t(
      "Exercise 7.1 Q3: are (1, 5), (2, 3) and (−2, −11) collinear?",
      "प्रश्नावली 7.1 प्र3: क्या (1, 5), (2, 3) और (−2, −11) संरेख हैं?",
    ),
    right: no,
    wrong: [
      {
        label: yes,
        why: t(
          "The distances are √5 ≈ 2.24, √212 ≈ 14.56 and √265 ≈ 16.28; 2.24 + 14.56 ≠ 16.28.",
          "दूरियाँ √5 ≈ 2.24, √212 ≈ 14.56 और √265 ≈ 16.28 हैं; 2.24 + 14.56 ≠ 16.28।",
        ),
      },
    ],
  },
  fives: {
    prompt: t("Are (−1, 0), (2, 4) and (5, 8) collinear?", "क्या (−1, 0), (2, 4) और (5, 8) संरेख हैं?"),
    right: yes,
    wrong: [
      {
        label: no,
        why: t(
          "The distances are 5, 5 and 10, and 5 + 5 = 10.",
          "दूरियाँ 5, 5 और 10 हैं, और 5 + 5 = 10।",
        ),
      },
    ],
  },
  kite: {
    prompt: t("Are (0, 0), (3, 4) and (4, 3) collinear?", "क्या (0, 0), (3, 4) और (4, 3) संरेख हैं?"),
    right: no,
    wrong: [
      {
        label: yes,
        why: t(
          "The distances are 5, √2 and 5. No two add up to the third: 5 + √2 ≠ 5.",
          "दूरियाँ 5, √2 और 5 हैं। कोई दो मिलकर तीसरी नहीं बनतीं: 5 + √2 ≠ 5।",
        ),
      },
    ],
  },
  rule: {
    prompt: t(
      "AB = 4, BC = 6 and AC = 10. What can you say about A, B and C?",
      "AB = 4, BC = 6 और AC = 10। A, B और C के बारे में क्या कह सकते हो?",
    ),
    right: t("They are collinear, B between A and C", "वे संरेख हैं, B बीच में"),
    wrong: [
      {
        label: t("They form a right triangle", "वे समकोण त्रिभुज बनाते हैं"),
        why: squares,
      },
      {
        label: t("They form a thin triangle", "वे एक पतला त्रिभुज बनाते हैं"),
        why: t(
          "4 + 6 = 10 exactly, so there's no room for a triangle: the three points are in a line.",
          "4 + 6 ठीक 10 है, तो त्रिभुज की जगह ही नहीं: तीनों बिंदु एक रेखा में हैं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Collinear or not, by distances (Example 3, Ex 7.1 Q3). */
export const collinearCheck = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.UsingDistances],
});
