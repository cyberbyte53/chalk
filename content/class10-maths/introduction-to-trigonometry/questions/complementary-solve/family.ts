import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const r = String.raw;

/** Example 10 and Exercise 8.3 Q3, Q5: solve for an angle. */
const items = {
  q5: numItem(
    t(
      r`Exercise 8.3 Q5: $\sec 4A = \operatorname{cosec}(A - 20^\circ)$, where 4A is acute. Find A.`,
      r`प्रश्नावली 8.3 प्र5: $\sec 4A = \operatorname{cosec}(A - 20^\circ)$, जहाँ 4A न्यून है। A निकालो।`,
    ),
    r`$22^\circ$`,
    [
      [
        r`$-\dfrac{20^\circ}{3}$`,
        t(
          "sec and cosec are different ratios. Write sec 4A = cosec(90° − 4A), then 90° − 4A = A − 20°.",
          "sec और cosec अलग अनुपात हैं। sec 4A = cosec(90° − 4A) लिखो, फिर 90° − 4A = A − 20°।",
        ),
      ],
      [
        r`$14^\circ$`,
        t(
          "90° − 4A = A − 20° gives 5A = 110°, so A = 22°.",
          "90° − 4A = A − 20° से 5A = 110°, तो A = 22°।",
        ),
      ],
    ],
  ),
  sin2a: numItem(
    t(
      r`$\sin 2A = \cos(A + 30^\circ)$, where both angles are acute. Find A.`,
      r`$\sin 2A = \cos(A + 30^\circ)$, जहाँ दोनों कोण न्यून हैं। A निकालो।`,
    ),
    r`$20^\circ$`,
    [
      [
        r`$30^\circ$`,
        t(
          "Setting 2A = A + 30° treats sin and cos as the same. Use 90° − 2A = A + 30°.",
          "2A = A + 30° रखना sin और cos को एक मानना है। 90° − 2A = A + 30° लो।",
        ),
      ],
      [
        r`$40^\circ$`,
        t(
          "90° − 2A = A + 30° gives 3A = 60°, so A = 20°.",
          "90° − 2A = A + 30° से 3A = 60°, तो A = 20°।",
        ),
      ],
    ],
  ),
  pair: {
    prompt: t(
      "sin A = cos B, where A and B are acute. Which must be true?",
      "sin A = cos B, जहाँ A और B न्यून हैं। क्या ज़रूर सत्य है?",
    ),
    right: t("A + B = 90°", "A + B = 90°"),
    wrong: [
      {
        label: t("A = B", "A = B"),
        why: t(
          "sin A = sin B would give A = B. Here cos B = sin(90° − B), so A = 90° − B.",
          "sin A = sin B से A = B मिलता। यहाँ cos B = sin(90° − B), इसलिए A = 90° − B।",
        ),
      },
      {
        label: t("A + B = 180°", "A + B = 180°"),
        why: t(
          "Both are acute, so A + B is less than 180°. Complementary angles add to 90°.",
          "दोनों न्यून हैं, इसलिए A + B, 180° से कम है। पूरक कोणों का योग 90° होता है।",
        ),
      },
    ],
  },
  which: numItem(
    t(r`Which is equal to $\tan 25^\circ$?`, r`इनमें से कौन $\tan 25^\circ$ के बराबर है?`),
    r`$\cot 65^\circ$`,
    [
      [
        r`$\tan 65^\circ$`,
        t(
          "The angle becomes 65°, and the ratio changes too: tan becomes cot.",
          "कोण 65° बनता है, और अनुपात भी बदलता है: tan, cot बनता है।",
        ),
      ],
      [
        r`$\cot 25^\circ$`,
        t(
          "cot 25° = 1/tan 25°, the reciprocal. The complementary pair is cot 65°.",
          "cot 25° = 1/tan 25°, व्युत्क्रम है। पूरक जोड़ी cot 65° है।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Solve for an angle using complementary angles. */
export const complementarySolve = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.ComplementaryAngles],
});
