import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const r = String.raw;

const lastTerm = t(
  "That's the last term, not the sum. The sum adds every term.",
  "यह अंतिम पद है, योग नहीं। योग में हर पद जुड़ता है।",
);
const countFirst = t(
  "Count the terms first with l = a + (n − 1)d, then use S = n/2 (a + l).",
  "पहले l = a + (n − 1)d से पद गिनो, फिर S = n/2 (a + l) लो।",
);
const bracket = t(
  "Inside the bracket use n − 1, not n: S = n/2 [2a + (n − 1)d].",
  "कोष्ठक में n − 1 लो, n नहीं: S = n/2 [2a + (n − 1)d]।",
);

/** Exercise 5.3 Q1–Q2, Examples 11 and 14, Shakila's box: find a sum. */
const items = {
  q1i: numItem(
    t("Find the sum of 2, 7, 12, … to 10 terms.", "2, 7, 12, … के 10 पदों का योग ज्ञात करो।"),
    "245",
    [
      ["47", lastTerm],
      ["270", bracket],
    ],
  ),
  q1ii: numItem(
    t(
      "Find the sum of −37, −33, −29, … to 12 terms.",
      "−37, −33, −29, … के 12 पदों का योग ज्ञात करो।",
    ),
    "−180",
    [
      ["−156", bracket],
      [
        "180",
        t(
          "Most of these terms are negative: 6[−74 + 44] = −180.",
          "इनमें से ज़्यादातर पद ऋणात्मक हैं: 6[−74 + 44] = −180।",
        ),
      ],
    ],
  ),
  q1iii: numItem(
    t(
      "Find the sum of 0.6, 1.7, 2.8, … to 100 terms.",
      "0.6, 1.7, 2.8, … के 100 पदों का योग ज्ञात करो।",
    ),
    "5505",
    [
      ["5560", bracket],
      ["109.5", lastTerm],
    ],
  ),
  q1iv: numItem(
    t(
      r`Find the sum of $\tfrac{1}{15}, \tfrac{1}{12}, \tfrac{1}{10}, \dots$ to 11 terms.`,
      r`$\tfrac{1}{15}, \tfrac{1}{12}, \tfrac{1}{10}, \dots$ के 11 पदों का योग ज्ञात करो।`,
    ),
    r`$\tfrac{33}{20}$`,
    [
      [
        r`$\tfrac{11}{60}$`,
        t(
          "d = 1/12 − 1/15 = 1/60. Then S = 11/2 [2/15 + 10/60] = 33/20.",
          "d = 1/12 − 1/15 = 1/60। फिर S = 11/2 [2/15 + 10/60] = 33/20।",
        ),
      ],
      [r`$\tfrac{7}{30}$`, lastTerm],
    ],
  ),
  q2i: numItem(
    t(
      r`Find $7 + 10\tfrac{1}{2} + 14 + \dots + 84$.`,
      r`$7 + 10\tfrac{1}{2} + 14 + \dots + 84$ ज्ञात करो।`,
    ),
    r`$1046\tfrac{1}{2}$`,
    [
      ["1001", countFirst],
      ["91", t("91 = 7 + 84 is one pair. There are 23 terms.", "91 = 7 + 84 एक जोड़ी है। 23 पद हैं।")],
    ],
  ),
  q2ii: numItem(t("Find 34 + 32 + 30 + … + 10.", "34 + 32 + 30 + … + 10 ज्ञात करो।"), "286", [
    ["264", countFirst],
    ["44", t("44 = 34 + 10 is one pair; there are 13 terms.", "44 = 34 + 10 एक जोड़ी है; 13 पद हैं।")],
  ]),
  q2iii: numItem(
    t("Find −5 + (−8) + (−11) + … + (−230).", "−5 + (−8) + (−11) + … + (−230) ज्ञात करो।"),
    "−8930",
    [
      ["−8812.5", countFirst],
      [
        "8930",
        t("Every term is negative, so the sum is negative.", "हर पद ऋणात्मक है, तो योग ऋणात्मक है।"),
      ],
    ],
  ),
  ex11: numItem(
    t(
      "Find the sum of the first 22 terms of 8, 3, −2, ….",
      "8, 3, −2, … के पहले 22 पदों का योग ज्ञात करो।",
    ),
    "−979",
    [
      ["−1034", bracket],
      [
        "979",
        t(
          "Only the first two terms are positive; the sum is negative.",
          "सिर्फ़ पहले दो पद धनात्मक हैं; योग ऋणात्मक है।",
        ),
      ],
    ],
  ),
  shakila: numItem(
    t(
      "Shakila puts ₹100 in a money box on her daughter's 1st birthday and ₹50 more each year. How much by the 21st birthday?",
      "शकीला बेटी के पहले जन्मदिन पर गुल्लक में ₹100 डालती है और हर साल ₹50 ज़्यादा। 21वें जन्मदिन तक कितना?",
    ),
    "₹12600",
    [
      ["₹1100", lastTerm],
      ["₹13125", bracket],
    ],
  ),
  kabir20: numItem(
    t(
      "Kabir saves ₹100, 105, 110, … each week. How much has he saved after 20 weeks?",
      "कबीर हर हफ़्ते ₹100, 105, 110, … बचाता है। 20 हफ़्तों बाद उसने कितना बचाया है?",
    ),
    "₹2950",
    [
      ["₹195", lastTerm],
      ["₹3000", bracket],
    ],
  ),
} satisfies Record<string, Item>;

/** The sum of the first n terms, with either form of the formula. */
export const sumOfAp = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.SumOfNTerms],
});
