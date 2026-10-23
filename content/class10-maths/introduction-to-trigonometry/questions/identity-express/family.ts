import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const r = String.raw;

/** Exercise 8.4 Q1–Q2 and Example 12: every ratio through one. */
const items = {
  q1sin: numItem(
    t(
      r`Exercise 8.4 Q1: express $\sin A$ in terms of $\cot A$.`,
      r`प्रश्नावली 8.4 प्र1: $\sin A$ को $\cot A$ के रूप में लिखो।`,
    ),
    r`$\dfrac{1}{\sqrt{1 + \cot^2 A}}$`,
    [
      [
        r`$\sqrt{1 + \cot^2 A}$`,
        t(
          "That's cosec A, from 1 + cot²A = cosec²A. sin A is its reciprocal.",
          "यह cosec A है, 1 + cot²A = cosec²A से। sin A उसका व्युत्क्रम है।",
        ),
      ],
      [
        r`$\dfrac{1}{1 + \cot^2 A}$`,
        t("That's sin²A. Take the square root for sin A.", "यह sin²A है। sin A के लिए वर्गमूल लो।"),
      ],
    ],
  ),
  q1tan: numItem(
    t(
      r`Exercise 8.4 Q1: express $\tan A$ in terms of $\cot A$.`,
      r`प्रश्नावली 8.4 प्र1: $\tan A$ को $\cot A$ के रूप में लिखो।`,
    ),
    r`$\dfrac{1}{\cot A}$`,
    [
      [
        r`$\sqrt{1 + \cot^2 A}$`,
        t(
          "No identity needed: tan A and cot A are reciprocals.",
          "किसी सर्वसमिका की ज़रूरत नहीं: tan A और cot A व्युत्क्रम हैं।",
        ),
      ],
      [
        r`$1 - \cot A$`,
        t(
          "Ratios don't subtract like that. tan A × cot A = 1, so tan A = 1/cot A.",
          "अनुपात ऐसे नहीं घटते। tan A × cot A = 1, इसलिए tan A = 1/cot A।",
        ),
      ],
    ],
  ),
  q2: numItem(
    t(
      r`Exercise 8.4 Q2: write $\sec A$ in terms of $\sin A$.`,
      r`प्रश्नावली 8.4 प्र2: $\sec A$ को $\sin A$ के रूप में लिखो।`,
    ),
    r`$\dfrac{1}{\sqrt{1 - \sin^2 A}}$`,
    [
      [
        r`$\dfrac{1}{\sin A}$`,
        t(
          "That's cosec A. sec A = 1/cos A, and cos A = √(1 − sin²A).",
          "यह cosec A है। sec A = 1/cos A, और cos A = √(1 − sin²A)।",
        ),
      ],
      [
        r`$\sqrt{1 - \sin^2 A}$`,
        t("That's cos A itself. sec A is its reciprocal.", "यह तो cos A है। sec A उसका व्युत्क्रम है।"),
      ],
    ],
  ),
  where: {
    prompt: t(
      r`For which angles A does $1 + \tan^2 A = \sec^2 A$ hold?`,
      r`कोण A के किन मानों के लिए $1 + \tan^2 A = \sec^2 A$ सत्य है?`,
    ),
    right: t("0° ≤ A < 90°", "0° ≤ A < 90°"),
    wrong: [
      {
        label: t("0° ≤ A ≤ 90°", "0° ≤ A ≤ 90°"),
        why: t(
          "At 90°, tan A and sec A are not defined, so 90° is left out.",
          "90° पर tan A और sec A परिभाषित नहीं हैं, इसलिए 90° छोड़ा जाता है।",
        ),
      },
      {
        label: t("0° < A ≤ 90°", "0° < A ≤ 90°"),
        why: t(
          "That's the range for cot²A + 1 = cosec²A. tan and sec are fine at 0° but not at 90°.",
          "यह cot²A + 1 = cosec²A का परिसर है। tan और sec 0° पर ठीक हैं पर 90° पर नहीं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Write every ratio in terms of one, using the identities. */
export const identityExpress = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.TrigonometricIdentities],
});
