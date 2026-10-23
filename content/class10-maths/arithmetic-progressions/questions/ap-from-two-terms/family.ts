import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const subtract = t(
  "Write each term as a + (n − 1)d and subtract the two equations: a cancels and d is left.",
  "हर पद को a + (n − 1)d लिखो और दोनों समीकरण घटाओ: a कट जाता है और d बचता है।",
);

/** Example 5, Exercise 5.2 Q1 (ii, iii), Q7–Q10, Q12, Q16 and Q18: two facts fix the AP. */
const items = {
  ex5: numItem(
    t(
      "An AP's 3rd term is 5 and its 7th term is 9. What is the AP?",
      "किसी AP का तीसरा पद 5 और 7वाँ पद 9 है। AP क्या है?",
    ),
    "3, 4, 5, 6, …",
    [
      [
        "5, 6, 7, 8, …",
        t(
          "5 is the 3rd term, not the first. a + 2d = 5 and a + 6d = 9 give a = 3.",
          "5 तीसरा पद है, पहला नहीं। a + 2d = 5 और a + 6d = 9 से a = 3।",
        ),
      ],
      [
        "1, 2, 3, 4, …",
        t("Check: its 3rd term would be 3, not 5.", "जाँचो: इसका तीसरा पद 3 होता, 5 नहीं।"),
      ],
    ],
  ),
  q1ii: numItem(
    t(
      "In an AP, a = −18, the 10th term is 0. Find d.",
      "एक AP में a = −18, 10वाँ पद 0 है। d ज्ञात करो।",
    ),
    "2",
    [
      [
        "1.8",
        t(
          "From the 1st term to the 10th is 9 steps: 9d = 18.",
          "पहले से 10वें पद तक 9 क़दम हैं: 9d = 18।",
        ),
      ],
      [
        "−2",
        t("The terms rise from −18 to 0, so d is positive.", "पद −18 से 0 तक बढ़ते हैं, तो d धनात्मक है।"),
      ],
    ],
  ),
  q1iii: numItem(
    t(
      "In an AP, d = −3 and the 18th term is −5. Find a.",
      "एक AP में d = −3 और 18वाँ पद −5 है। a ज्ञात करो।",
    ),
    "46",
    [
      ["49", t("Use 17 steps, not 18: a = −5 + 17 × 3.", "18 नहीं, 17 क़दम लो: a = −5 + 17 × 3।")],
      [
        "−56",
        t(
          "Going back towards the first term undoes the −3s: add 51.",
          "पहले पद की ओर लौटना −3 को उलटता है: 51 जोड़ो।",
        ),
      ],
    ],
  ),
  q7: numItem(
    t(
      "An AP's 11th term is 38 and its 16th term is 73. Find its 31st term.",
      "किसी AP का 11वाँ पद 38 और 16वाँ पद 73 है। इसका 31वाँ पद ज्ञात करो।",
    ),
    "178",
    [
      [
        "213",
        t(
          "d = 35 ÷ 5 = 7 and a = 38 − 70 = −32. Then a₃₁ = −32 + 30 × 7.",
          "d = 35 ÷ 5 = 7 और a = 38 − 70 = −32। फिर a₃₁ = −32 + 30 × 7।",
        ),
      ],
      ["7", subtract],
    ],
  ),
  q8: numItem(
    t(
      "An AP has 50 terms; the 3rd is 12 and the last is 106. Find the 29th term.",
      "एक AP में 50 पद हैं; तीसरा 12 और अंतिम 106 है। 29वाँ पद ज्ञात करो।",
    ),
    "64",
    [
      [
        "66",
        t(
          "a + 2d = 12 and a + 49d = 106 give d = 2, a = 8. Then a₂₉ = 8 + 28 × 2.",
          "a + 2d = 12 और a + 49d = 106 से d = 2, a = 8। फिर a₂₉ = 8 + 28 × 2।",
        ),
      ],
      ["2", subtract],
    ],
  ),
  q9: numItem(
    t(
      "The 3rd and 9th terms of an AP are 4 and −8. Which term is zero?",
      "किसी AP के तीसरे और 9वें पद 4 और −8 हैं। कौन-सा पद शून्य है?",
    ),
    "5th",
    [
      [
        "4th",
        t(
          "d = −2, a = 8. 8 + (n − 1)(−2) = 0 gives n = 5.",
          "d = −2, a = 8। 8 + (n − 1)(−2) = 0 से n = 5।",
        ),
      ],
      ["6th", t("Count: 8, 6, 4, 2, 0. The 5th term is 0.", "गिनो: 8, 6, 4, 2, 0। 5वाँ पद 0 है।")],
    ],
  ),
  q10: numItem(
    t(
      "The 17th term of an AP is 7 more than its 10th term. Find d.",
      "किसी AP का 17वाँ पद उसके 10वें पद से 7 ज़्यादा है। d ज्ञात करो।",
    ),
    "1",
    [
      ["7", subtract],
      [
        "7/27",
        t(
          "Subtract the terms: (a + 16d) − (a + 9d) = 7d = 7.",
          "पद घटाओ: (a + 16d) − (a + 9d) = 7d = 7।",
        ),
      ],
    ],
  ),
  q12: numItem(
    t(
      "Two APs have the same d. Their 100th terms differ by 100. By how much do their 1000th terms differ?",
      "दो AP का d एक ही है। उनके 100वें पदों में 100 का अंतर है। उनके 1000वें पदों में कितना अंतर है?",
    ),
    "100",
    [
      [
        "1000",
        t(
          "Both add the same d each step, so the gap between them never changes: it is the gap between their first terms.",
          "दोनों हर क़दम पर वही d जोड़ती हैं, तो उनके बीच का अंतर कभी नहीं बदलता: यह उनके पहले पदों का अंतर है।",
        ),
      ],
      [
        "900",
        t(
          "The 999 steps of d are the same for both and cancel; only a₁ − a₂ = 100 is left.",
          "d के 999 क़दम दोनों के एक जैसे हैं और कट जाते हैं; सिर्फ़ a₁ − a₂ = 100 बचता है।",
        ),
      ],
    ],
  ),
  q16: numItem(
    t(
      "An AP's 3rd term is 16, and its 7th term is 12 more than its 5th. What is the AP?",
      "किसी AP का तीसरा पद 16 है, और 7वाँ पद 5वें से 12 ज़्यादा है। AP क्या है?",
    ),
    "4, 10, 16, 22, …",
    [
      [
        "16, 22, 28, 34, …",
        t(
          "16 is the 3rd term. 2d = 12 gives d = 6, so a = 16 − 12 = 4.",
          "16 तीसरा पद है। 2d = 12 से d = 6, तो a = 16 − 12 = 4।",
        ),
      ],
      [
        "−8, 4, 16, 28, …",
        t(
          "From the 5th to the 7th is 2 steps: 2d = 12, d = 6, not 12.",
          "5वें से 7वें तक 2 क़दम हैं: 2d = 12, d = 6, 12 नहीं।",
        ),
      ],
    ],
  ),
  q18: numItem(
    t(
      "In an AP the 4th and 8th terms add to 24, and the 6th and 10th add to 44. Find the first three terms.",
      "एक AP में चौथे और 8वें पदों का योग 24 है, और 6ठे और 10वें का 44। पहले तीन पद ज्ञात करो।",
    ),
    "−13, −8, −3",
    [
      [
        "13, 8, 3",
        t(
          "2a + 10d = 24 and 2a + 14d = 44 give d = 5 (positive) and a = −13.",
          "2a + 10d = 24 और 2a + 14d = 44 से d = 5 (धनात्मक) और a = −13।",
        ),
      ],
      [
        "2, 7, 12",
        t(
          "Subtract: 4d = 20, d = 5. Then 2a + 50 = 24, a = −13.",
          "घटाओ: 4d = 20, d = 5। फिर 2a + 50 = 24, a = −13।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Two facts about an AP fix a and d; then find what's asked. */
export const apFromTwoTerms = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.TheNthTerm],
});
