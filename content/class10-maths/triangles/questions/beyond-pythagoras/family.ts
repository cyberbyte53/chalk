import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const plain = t(
  "That's plain Pythagoras, true only at 90°.",
  "यह सीधा पाइथागोरस है, जो केवल 90° पर सही है।",
);

/** Exercise 6.6 Q3, Q4, Q6 and Q10: Pythagoras stretched. */
const items = {
  obtuse: numItem(
    t(
      "∠B of ∆ ABC is obtuse and AD ⊥ CB extended. AB = 3, BC = 4 and BD = 1. Find AC².",
      "∆ ABC का ∠B अधिक कोण है और AD ⊥ बढ़ाई गई CB। AB = 3, BC = 4 और BD = 1। AC² ज्ञात करो।",
    ),
    "33",
    [
      ["25", plain],
      [
        "17",
        t(
          "For an obtuse angle the extra 2 BC · BD is added: 9 + 16 + 8.",
          "अधिक कोण के लिए अतिरिक्त 2 BC · BD जुड़ता है: 9 + 16 + 8।",
        ),
      ],
    ],
  ),
  acute: numItem(
    t(
      "∠B of ∆ ABC is acute and AD ⊥ BC. AB = 5, BC = 6 and BD = 2. Find AC².",
      "∆ ABC का ∠B न्यून कोण है और AD ⊥ BC। AB = 5, BC = 6 और BD = 2। AC² ज्ञात करो।",
    ),
    "37",
    [
      ["61", plain],
      [
        "85",
        t(
          "For an acute angle 2 BC · BD is taken away: 25 + 36 − 24.",
          "न्यून कोण के लिए 2 BC · BD घटता है: 25 + 36 − 24।",
        ),
      ],
    ],
  ),
  parallelogram: numItem(
    t(
      "A parallelogram has sides 5 cm and 7 cm. Find the sum of the squares of its diagonals.",
      "एक समांतर चतुर्भुज की भुजाएँ 5 cm और 7 cm हैं। उसके विकर्णों के वर्गों का योग ज्ञात करो।",
    ),
    "148",
    [
      [
        "74",
        t(
          "That counts two sides. A parallelogram has four: 5² + 7² + 5² + 7².",
          "यह दो भुजाएँ गिनता है। समांतर चतुर्भुज की चार होती हैं: 5² + 7² + 5² + 7²।",
        ),
      ],
      [
        "24",
        t(
          "That adds the sides, not their squares: 2(25 + 49).",
          "यह भुजाओं को जोड़ता है, उनके वर्गों को नहीं: 2(25 + 49)।",
        ),
      ],
    ],
  ),
  fishing: numItem(
    t(
      "Nazima's rod tip is 1.8 m above the water, 1.2 m out from her. The fly is 2.4 m beyond the point under the tip, and she reels in 5 cm a second. After 12 s, how far is the fly from her?",
      "नाज़िमा की छड़ का सिरा पानी से 1.8 m ऊपर और उससे 1.2 m आगे है। मक्खी सिरे के नीचे वाले बिंदु से 2.4 m आगे है, और वह हर सेकंड 5 cm धागा खींचती है। 12 s बाद मक्खी उससे कितनी दूर है?",
    ),
    "2.79 m",
    [
      [
        "1.59 m",
        t(
          "That's from the point under the tip. Add the 1.2 m from Nazima to there.",
          "यह सिरे के नीचे वाले बिंदु से है। नाज़िमा से वहाँ तक के 1.2 m जोड़ो।",
        ),
      ],
      [
        "3.00 m",
        t(
          "3 m is the string before she reels in. After 12 s it's 2.4 m, so the fly is √(2.4² − 1.8²) + 1.2 from her.",
          "3 m खींचने से पहले का धागा है। 12 s बाद वह 2.4 m है, तो मक्खी उससे √(2.4² − 1.8²) + 1.2 दूर है।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Pythagoras beyond the right angle, and Nazima's fishing line. */
export const beyondPythagoras = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.ChallengeAndFinale],
});
