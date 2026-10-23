import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const r = String.raw;

const nSteps = t(
  "From the first term to the nth is n − 1 steps of d, not n.",
  "पहले पद से n वें तक d के n − 1 क़दम हैं, n नहीं।",
);
const sign = t("The terms go down, so d is negative.", "पद घटते हैं, इसलिए d ऋणात्मक है।");

/** Exercise 5.2 Q1–Q3, Example 3, Reena and Example 9: find a term with aₙ = a + (n − 1)d. */
const items = {
  ex3: numItem(
    t("Find the 10th term of the AP 2, 7, 12, ….", "AP 2, 7, 12, … का 10वाँ पद ज्ञात करो।"),
    "47",
    [
      ["52", nSteps],
      [
        "20",
        t(
          "That's 2 × 10. Use a + (n − 1)d = 2 + 9 × 5.",
          "यह 2 × 10 है। a + (n − 1)d = 2 + 9 × 5 लो।",
        ),
      ],
    ],
  ),
  q1i: numItem(
    t("In an AP, a = 7, d = 3. Find the 8th term.", "एक AP में a = 7, d = 3। 8वाँ पद ज्ञात करो।"),
    "28",
    [
      ["31", nSteps],
      [
        "24",
        t("That's 3 × 8. Start from a = 7: 7 + 7 × 3.", "यह 3 × 8 है। a = 7 से शुरू करो: 7 + 7 × 3।"),
      ],
    ],
  ),
  q1v: numItem(
    t(
      "In an AP, a = 3.5, d = 0. Find the 105th term.",
      "एक AP में a = 3.5, d = 0। 105वाँ पद ज्ञात करो।",
    ),
    "3.5",
    [
      [
        "367.5",
        t("With d = 0 every term is the same as the first.", "d = 0 पर हर पद पहले जैसा ही होता है।"),
      ],
      [
        "0",
        t(
          "d = 0 means nothing is added; the terms stay 3.5.",
          "d = 0 का मतलब कुछ नहीं जुड़ता; पद 3.5 ही रहते हैं।",
        ),
      ],
    ],
  ),
  q2i: numItem(t("The 30th term of the AP 10, 7, 4, … is", "AP 10, 7, 4, … का 30वाँ पद है"), "−77", [
    ["97", sign],
    ["−80", nSteps],
  ]),
  q2ii: numItem(
    t(
      r`The 11th term of the AP $-3, -\tfrac{1}{2}, 2, \dots$ is`,
      r`AP $-3, -\tfrac{1}{2}, 2, \dots$ का 11वाँ पद है`,
    ),
    "22",
    [
      [r`$24\tfrac{1}{2}$`, nSteps],
      [
        "−28",
        t(
          "d = −1/2 − (−3) = 5/2, which is positive: the terms go up.",
          "d = −1/2 − (−3) = 5/2, जो धनात्मक है: पद बढ़ते हैं।",
        ),
      ],
    ],
  ),
  q3i: numItem(t("Fill the box in the AP 2, □, 26.", "AP 2, □, 26 में ख़ाना भरो।"), "14", [
    [
      "24",
      t(
        "That's 26 − 2, the jump over two steps. Each step is half of it.",
        "यह 26 − 2 है, दो क़दमों का उछाल। हर क़दम उसका आधा है।",
      ),
    ],
    [
      "13",
      t(
        "The middle term is halfway between 2 and 26: (2 + 26) ÷ 2.",
        "बीच का पद 2 और 26 के बीच आधे रास्ते पर है: (2 + 26) ÷ 2।",
      ),
    ],
  ]),
  q3iv: numItem(
    t(
      "Fill the boxes in the AP −4, □, □, □, □, 6. What is the second term?",
      "AP −4, □, □, □, □, 6 के ख़ाने भरो। दूसरा पद क्या है?",
    ),
    "−2",
    [
      [
        "−3",
        t(
          "From −4 to 6 is 5 steps (the 6th term), so d = 10 ÷ 5 = 2.",
          "−4 से 6 तक 5 क़दम हैं (6वाँ पद), तो d = 10 ÷ 5 = 2।",
        ),
      ],
      ["−1.5", t("There are 5 steps, not 4: −4 + 5d = 6.", "4 नहीं, 5 क़दम हैं: −4 + 5d = 6।")],
    ],
  ),
  reena15: numItem(
    t(
      "Reena's salary starts at ₹8000 and rises by ₹500 a year. What is it in her 15th year?",
      "रीना का वेतन ₹8000 से शुरू होता है और हर साल ₹500 बढ़ता है। उसके 15वें साल में कितना है?",
    ),
    "₹15000",
    [
      ["₹15500", nSteps],
      [
        "₹7500",
        t(
          "That's 15 × 500. Add it to the starting ₹8000, with 14 rises.",
          "यह 15 × 500 है। इसे शुरुआती ₹8000 में जोड़ो, 14 बढ़ोतरियों के साथ।",
        ),
      ],
    ],
  ),
  ex9: numItem(
    t(
      "₹1000 at 8% simple interest a year: the interest after 1, 2, 3, … years is 80, 160, 240, …. What is it after 30 years?",
      "₹1000 पर 8% वार्षिक साधारण ब्याज: 1, 2, 3, … साल बाद ब्याज 80, 160, 240, … है। 30 साल बाद कितना?",
    ),
    "₹2400",
    [
      [
        "₹2320",
        t("a₃₀ = 80 + 29 × 80, which is 30 lots of 80.", "a₃₀ = 80 + 29 × 80, यानी 80 के 30 हिस्से।"),
      ],
      [
        "₹3400",
        t(
          "Use a = 80 and d = 80: 80 + 29 × 80 = 2400.",
          "a = 80 और d = 80 लो: 80 + 29 × 80 = 2400।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Find a term of an AP from its first term and common difference. */
export const findNthTerm = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.TheNthTerm],
});
