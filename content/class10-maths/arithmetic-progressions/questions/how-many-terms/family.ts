import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const r = String.raw;

const halve = t("Sₙ = n/2 (a + l): don't forget to halve.", "Sₙ = n/2 (a + l): आधा करना मत भूलो।");

/** Example 13, Exercise 5.3 Q4–Q11, Kabir's ₹4,000: sums that lead to n, or to a rule. */
const items = {
  ex13: numItem(
    t(
      "How many terms of 24, 21, 18, … must be taken to get a sum of 78?",
      "24, 21, 18, … के कितने पद लेने पर योग 78 होगा?",
    ),
    "4 or 13",
    [
      [
        "Only 4",
        t(
          "n² − 17n + 52 = 0 has roots 4 and 13, and both work: terms 5 to 13 add to 0.",
          "n² − 17n + 52 = 0 के मूल 4 और 13 हैं, और दोनों सही हैं: 5वें से 13वें पद का योग 0 है।",
        ),
      ],
      [
        "Only 13",
        t(
          "Both roots work: 24 + 21 + 18 + 15 = 78 too.",
          "दोनों मूल सही हैं: 24 + 21 + 18 + 15 = 78 भी।",
        ),
      ],
    ],
  ),
  q4: numItem(
    t("How many terms of 9, 17, 25, … give a sum of 636?", "9, 17, 25, … के कितने पद योग 636 देते हैं?"),
    "12",
    [
      [
        "71",
        t(
          "Not 636 ÷ 9: the terms grow. n/2 [18 + 8(n − 1)] = 636 gives 4n² + 5n − 636 = 0.",
          "636 ÷ 9 नहीं: पद बढ़ते हैं। n/2 [18 + 8(n − 1)] = 636 से 4n² + 5n − 636 = 0।",
        ),
      ],
      ["13", t("Check n = 12: 6[18 + 88] = 636.", "n = 12 जाँचो: 6[18 + 88] = 636।")],
    ],
  ),
  q5: numItem(
    t(
      "An AP has first term 5, last term 45 and sum 400. Find n and d.",
      "किसी AP का प्रथम पद 5, अंतिम पद 45 और योग 400 है। n और d ज्ञात करो।",
    ),
    r`$n = 16$, $d = \tfrac{8}{3}$`,
    [
      [r`$n = 8$, $d = \tfrac{40}{7}$`, halve],
      [
        r`$n = 16$, $d = \tfrac{5}{2}$`,
        t("45 = 5 + 15d: there are 15 steps for 16 terms.", "45 = 5 + 15d: 16 पदों के लिए 15 क़दम हैं।"),
      ],
    ],
  ),
  q6: numItem(
    t(
      "An AP starts at 17 and ends at 350, with d = 9. How many terms, and what is their sum?",
      "एक AP 17 से शुरू होकर 350 पर ख़त्म होती है, d = 9। कितने पद हैं, और उनका योग क्या है?",
    ),
    "38 terms, sum 6973",
    [
      [
        "37 terms, sum 6789.5",
        t(
          "350 = 17 + (n − 1) × 9 gives n − 1 = 37, so n = 38.",
          "350 = 17 + (n − 1) × 9 से n − 1 = 37, तो n = 38।",
        ),
      ],
      ["38 terms, sum 13946", halve],
    ],
  ),
  q7: numItem(
    t(
      "Find the sum of the first 22 terms of an AP with d = 7 and 22nd term 149.",
      "d = 7 और 22वें पद 149 वाली AP के पहले 22 पदों का योग ज्ञात करो।",
    ),
    "1661",
    [
      [
        "1584",
        t(
          "a = 149 − 21 × 7 = 2: 21 steps back, not 22.",
          "a = 149 − 21 × 7 = 2: 21 क़दम पीछे, 22 नहीं।",
        ),
      ],
      ["3322", halve],
    ],
  ),
  q8: numItem(
    t(
      "An AP's 2nd and 3rd terms are 14 and 18. Find the sum of its first 51 terms.",
      "किसी AP के दूसरे और तीसरे पद 14 और 18 हैं। उसके पहले 51 पदों का योग ज्ञात करो।",
    ),
    "5610",
    [
      [
        "5814",
        t("14 is the 2nd term; the first is 14 − 4 = 10.", "14 दूसरा पद है; पहला 14 − 4 = 10 है।"),
      ],
      [
        "210",
        t(
          "210 is the 51st term, 10 + 50 × 4. Add all 51.",
          "210, 51वाँ पद है, 10 + 50 × 4। सारे 51 जोड़ो।",
        ),
      ],
    ],
  ),
  q9: numItem(
    t(
      "The sum of the first 7 terms of an AP is 49 and of the first 17 is 289. The sum of the first n terms is",
      "किसी AP के पहले 7 पदों का योग 49 और पहले 17 का 289 है। पहले n पदों का योग है",
    ),
    r`$n^2$`,
    [
      [
        r`$2n - 1$`,
        t(
          "2n − 1 is the nth term (a = 1, d = 2). The sum is n/2 [2 + 2(n − 1)] = n².",
          "2n − 1, n वाँ पद है (a = 1, d = 2)। योग है n/2 [2 + 2(n − 1)] = n²।",
        ),
      ],
      [
        r`$\dfrac{n(n + 1)}{2}$`,
        t("Check n = 7: that gives 28, not 49.", "n = 7 जाँचो: इससे 28 आता है, 49 नहीं।"),
      ],
    ],
  ),
  q10i: numItem(
    t(
      "aₙ = 3 + 4n. Find the sum of the first 15 terms.",
      "aₙ = 3 + 4n। पहले 15 पदों का योग ज्ञात करो।",
    ),
    "525",
    [
      [
        "63",
        t(
          "63 is a₁₅. The terms are 7, 11, …, 63; add them: 15/2 (7 + 63).",
          "63, a₁₅ है। पद हैं 7, 11, …, 63; जोड़ो: 15/2 (7 + 63)।",
        ),
      ],
      ["495", t("The first term is a₁ = 3 + 4 = 7, not 3.", "प्रथम पद a₁ = 3 + 4 = 7 है, 3 नहीं।")],
    ],
  ),
  q10ii: numItem(
    t(
      "aₙ = 9 − 5n. Find the sum of the first 15 terms.",
      "aₙ = 9 − 5n। पहले 15 पदों का योग ज्ञात करो।",
    ),
    "−465",
    [
      ["−66", t("−66 is a₁₅. The sum is 15/2 (4 + (−66)).", "−66, a₁₅ है। योग है 15/2 (4 + (−66))।")],
      ["−390", t("The first term is a₁ = 9 − 5 = 4, not 9.", "प्रथम पद a₁ = 9 − 5 = 4 है, 9 नहीं।")],
    ],
  ),
  q11: numItem(
    t(
      r`The sum of the first $n$ terms of an AP is $4n - n^2$. Find its 10th term.`,
      r`किसी AP के पहले $n$ पदों का योग $4n - n^2$ है। इसका 10वाँ पद ज्ञात करो।`,
    ),
    "−15",
    [
      [
        "−60",
        t(
          "−60 is S₁₀. The 10th term is S₁₀ − S₉ = −60 − (−45).",
          "−60, S₁₀ है। 10वाँ पद है S₁₀ − S₉ = −60 − (−45)।",
        ),
      ],
      [
        "−13",
        t(
          "a₁₀ = S₁₀ − S₉ = −15. In general aₙ = 5 − 2n.",
          "a₁₀ = S₁₀ − S₉ = −15। सामान्य रूप में aₙ = 5 − 2n।",
        ),
      ],
    ],
  ),
  kabir: numItem(
    t(
      "Kabir saves ₹100, 105, 110, … each week. After which week does his box hold exactly ₹4,000?",
      "कबीर हर हफ़्ते ₹100, 105, 110, … बचाता है। किस हफ़्ते के बाद उसकी गुल्लक में ठीक ₹4,000 होंगे?",
    ),
    "Week 25",
    [
      [
        "Week 40",
        t(
          "4000 ÷ 100 assumes ₹100 every week, but the amount rises by 5.",
          "4000 ÷ 100 मानता है कि हर हफ़्ते ₹100, पर रक़म 5 से बढ़ती है।",
        ),
      ],
      [
        "Week 64",
        t(
          "n² + 39n − 1600 = 0 gives n = 25 or n = −64; a number of weeks can't be negative.",
          "n² + 39n − 1600 = 0 से n = 25 या n = −64; हफ़्तों की संख्या ऋणात्मक नहीं हो सकती।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Sums that give the number of terms (often through a quadratic), or the list's rule. */
export const howManyTerms = bankFamily(items, {
  level: Level.Hard,
  tests: [Concept.UsingTheSum],
});
