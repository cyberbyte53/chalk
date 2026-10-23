import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const r = String.raw;

const addOne = t("You found n − 1. Add 1 to get n.", "तुम्हें n − 1 मिला। n पाने के लिए 1 जोड़ो।");
const notWhole = (n: string) =>
  t(
    `Solving gives n = ${n}, which is not a whole number, so it is not a term.`,
    `हल करने पर n = ${n} मिलता है, जो पूर्ण संख्या नहीं, इसलिए यह पद नहीं है।`,
  );
const no = (n: string) => t(`It is not a term (n = ${n})`, `यह पद नहीं है (n = ${n})`);

/** Example 4, Example 6, Exercise 5.2 Q1 (iv), Q4–Q6 and Q11: find n, or show there is none. */
const items = {
  ex4: numItem(
    t("Which term of the AP 21, 18, 15, … is −81?", "AP 21, 18, 15, … का कौन-सा पद −81 है?"),
    "35th",
    [
      ["34th", addOne],
      [
        "27th",
        t(
          "That's −81 ÷ −3. Solve −81 = 21 + (n − 1)(−3).",
          "यह −81 ÷ −3 है। −81 = 21 + (n − 1)(−3) हल करो।",
        ),
      ],
    ],
  ),
  ex4zero: numItem(
    t(
      "Is any term of the AP 21, 18, 15, … zero? Which?",
      "क्या AP 21, 18, 15, … का कोई पद शून्य है? कौन-सा?",
    ),
    "The 8th",
    [
      ["The 7th", addOne],
      [
        "None",
        t(
          "21 + (n − 1)(−3) = 0 gives n = 8, a whole number: the 8th term is 0.",
          "21 + (n − 1)(−3) = 0 से n = 8, एक पूर्ण संख्या: 8वाँ पद 0 है।",
        ),
      ],
    ],
  ),
  q4: numItem(
    t("Which term of the AP 3, 8, 13, 18, … is 78?", "AP 3, 8, 13, 18, … का कौन-सा पद 78 है?"),
    "16th",
    [
      ["15th", addOne],
      [
        "26th",
        t("That's 78 ÷ 3. Use 78 = 3 + (n − 1) × 5.", "यह 78 ÷ 3 है। 78 = 3 + (n − 1) × 5 लो।"),
      ],
    ],
  ),
  q5i: numItem(
    t("How many terms are in the AP 7, 13, 19, …, 205?", "AP 7, 13, 19, …, 205 में कितने पद हैं?"),
    "34",
    [
      ["33", addOne],
      [
        "35",
        t(
          "205 = 7 + (n − 1) × 6 gives n − 1 = 33, so n = 34.",
          "205 = 7 + (n − 1) × 6 से n − 1 = 33, तो n = 34।",
        ),
      ],
    ],
  ),
  q5ii: numItem(
    t(
      r`How many terms are in the AP $18, 15\tfrac{1}{2}, 13, \dots, -47$?`,
      r`AP $18, 15\tfrac{1}{2}, 13, \dots, -47$ में कितने पद हैं?`,
    ),
    "27",
    [
      ["26", addOne],
      [
        "19",
        t(
          "d = −2½. −47 = 18 + (n − 1)(−2.5) gives n − 1 = 26.",
          "d = −2½। −47 = 18 + (n − 1)(−2.5) से n − 1 = 26।",
        ),
      ],
    ],
  ),
  q6: {
    prompt: t("Is −150 a term of the AP 11, 8, 5, 2, …?", "क्या −150, AP 11, 8, 5, 2, … का पद है?"),
    right: no("164/3"),
    wrong: [
      { label: t("Yes, the 54th term", "हाँ, 54वाँ पद"), why: notWhole("164/3") },
      { label: t("Yes, the 55th term", "हाँ, 55वाँ पद"), why: notWhole("164/3") },
    ],
  },
  ex6: {
    prompt: t("Is 301 a term of 5, 11, 17, 23, …?", "क्या 301, 5, 11, 17, 23, … का पद है?"),
    right: no("151/3"),
    wrong: [
      { label: t("Yes, the 50th term", "हाँ, 50वाँ पद"), why: notWhole("151/3") },
      { label: t("Yes, the 51st term", "हाँ, 51वाँ पद"), why: notWhole("151/3") },
    ],
  },
  q1iv: numItem(
    t(
      "In an AP, a = −18.9, d = 2.5 and aₙ = 3.6. Find n.",
      "एक AP में a = −18.9, d = 2.5 और aₙ = 3.6। n ज्ञात करो।",
    ),
    "10",
    [
      ["9", addOne],
      [
        r`$1\tfrac{11}{25}$`,
        t(
          "Add 18.9 to 3.6 first: n − 1 = 22.5 ÷ 2.5 = 9.",
          "पहले 3.6 में 18.9 जोड़ो: n − 1 = 22.5 ÷ 2.5 = 9।",
        ),
      ],
    ],
  ),
  q11: numItem(
    t(
      "Which term of the AP 3, 15, 27, 39, … is 132 more than its 54th term?",
      "AP 3, 15, 27, 39, … का कौन-सा पद उसके 54वें पद से 132 ज़्यादा है?",
    ),
    "65th",
    [
      [
        "64th",
        t(
          "132 ÷ 12 = 11 more steps after the 54th: the 65th.",
          "132 ÷ 12 = 54वें के बाद 11 क़दम और: 65वाँ।",
        ),
      ],
      [
        "186th",
        t(
          "132 is a difference in value, not in position. Each step adds 12.",
          "132 मान का अंतर है, स्थान का नहीं। हर क़दम 12 जोड़ता है।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Find which term a value is, or show it isn't a term (n must be a positive whole number). */
export const whichTerm = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.TheNthTerm],
});
