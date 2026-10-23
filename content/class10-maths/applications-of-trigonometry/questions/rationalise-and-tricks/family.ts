import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** The algebra these answers need: rationalising, and Q16's complementary angles. */
const items = {
  eight: numItem(
    t(
      "Simplify 8/(√3 − 1) by rationalising the denominator.",
      "हर का परिमेयकरण करके 8/(√3 − 1) को सरल करो।",
    ),
    "4(√3 + 1)",
    [
      [
        "4(√3 − 1)",
        t(
          "Multiply by (√3 + 1)/(√3 + 1): the top becomes 8(√3 + 1), so the sign is plus.",
          "(√3 + 1)/(√3 + 1) से गुणा करो: अंश 8(√3 + 1) बनता है, तो चिह्न धन है।",
        ),
      ],
      [
        "8(√3 + 1)",
        t(
          "The bottom becomes (√3)² − 1² = 2, so divide by 2.",
          "हर (√3)² − 1² = 2 बनता है, इसलिए 2 से भाग दो।",
        ),
      ],
    ],
  ),
  pedestal: numItem(
    t(
      "Simplify 1.6/(√3 − 1), the pedestal in Exercise 9.1 Q8.",
      "1.6/(√3 − 1) को सरल करो, प्रश्नावली 9.1 प्र8 का चबूतरा।",
    ),
    "0.8(√3 + 1)",
    [
      [
        "1.6(√3 + 1)",
        t(
          "(√3 − 1)(√3 + 1) = 2, so 1.6 is halved: 0.8(√3 + 1).",
          "(√3 − 1)(√3 + 1) = 2, तो 1.6 आधा हो जाता है: 0.8(√3 + 1)।",
        ),
      ],
      [
        "0.8(√3 − 1)",
        t(
          "Rationalising multiplies the top by √3 + 1, which turns the minus into a plus.",
          "परिमेयकरण में अंश को √3 + 1 से गुणा होता है, जो ऋण को धन बना देता है।",
        ),
      ],
    ],
  ),
  q16: numItem(
    t(
      "Exercise 9.1 Q16: a tower's top is at complementary angles from 4 m and 9 m away on the same line. How tall is it?",
      "प्रश्नावली 9.1 प्र16: एक ही रेखा पर 4 m और 9 m दूर से मीनार का शीर्ष पूरक कोणों पर है। वह कितनी ऊँची है?",
    ),
    "6 m",
    [
      [
        "6.5 m",
        t(
          "That averages 4 and 9. Complementary angles give (h/4)(h/9) = tan θ · cot θ = 1, so h² = 36.",
          "यह 4 और 9 का औसत है। पूरक कोणों से (h/4)(h/9) = tan θ · cot θ = 1, तो h² = 36।",
        ),
      ],
      [
        "√13 m",
        t(
          "√13 = √(4 + 9) adds; the product rule needs 4 × 9 = 36, so h = 6.",
          "√13 = √(4 + 9) में जोड़ा गया; गुणनफल वाले नियम में 4 × 9 = 36, तो h = 6।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Rationalising a denominator; the complementary-angle product. */
export const rationaliseAndTricks = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.HeightsAndDepthsFromAbove],
});
