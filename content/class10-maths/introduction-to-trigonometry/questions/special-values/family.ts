import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const r = String.raw;

/** Exercise 8.2 Q1 and Q2: evaluate with the values of Table 8.1. */
const items = {
  q1ii: numItem(
    t(
      r`Exercise 8.2 Q1 (ii): evaluate $2\tan^2 45^\circ + \cos^2 30^\circ - \sin^2 60^\circ$.`,
      r`प्रश्नावली 8.2 प्र1 (ii): $2\tan^2 45^\circ + \cos^2 30^\circ - \sin^2 60^\circ$ का मान निकालो।`,
    ),
    r`$2$`,
    [
      [
        r`$\dfrac{5}{2}$`,
        t(
          "cos²30° and sin²60° are both 3/4, so they cancel: 2 × 1 = 2.",
          "cos²30° और sin²60° दोनों 3/4 हैं, इसलिए कट जाते हैं: 2 × 1 = 2।",
        ),
      ],
      [
        r`$\dfrac{3}{2}$`,
        t(
          "tan 45° = 1, so 2 tan²45° = 2, not 1. The other two terms cancel.",
          "tan 45° = 1, तो 2 tan²45° = 2, 1 नहीं। बाक़ी दो पद कट जाते हैं।",
        ),
      ],
    ],
  ),
  q2i: numItem(
    t(
      r`Exercise 8.2 Q2 (i): $\dfrac{2\tan 30^\circ}{1 + \tan^2 30^\circ}$ is equal to?`,
      r`प्रश्नावली 8.2 प्र2 (i): $\dfrac{2\tan 30^\circ}{1 + \tan^2 30^\circ}$ किसके बराबर है?`,
    ),
    r`$\sin 60^\circ$`,
    [
      [
        r`$\tan 60^\circ$`,
        t(
          "(2/√3) ÷ (4/3) = √3/2, which is sin 60°. tan 60° is √3.",
          "(2/√3) ÷ (4/3) = √3/2, जो sin 60° है। tan 60°, √3 है।",
        ),
      ],
      [
        r`$\sin 30^\circ$`,
        t(
          "sin 30° = 1/2. The value works out to √3/2, which is sin 60°.",
          "sin 30° = 1/2। मान √3/2 निकलता है, जो sin 60° है।",
        ),
      ],
    ],
  ),
  q2iii: numItem(
    t(
      r`Exercise 8.2 Q2 (iii): $\sin 2A = 2\sin A$ is true when A is?`,
      r`प्रश्नावली 8.2 प्र2 (iii): $\sin 2A = 2\sin A$ तब सत्य है जब A है?`,
    ),
    r`$0^\circ$`,
    [
      [
        r`$30^\circ$`,
        t(
          "sin 60° = √3/2 but 2 sin 30° = 1. Only at 0° are both sides 0.",
          "sin 60° = √3/2 पर 2 sin 30° = 1। केवल 0° पर दोनों पक्ष 0 हैं।",
        ),
      ],
      [
        r`$45^\circ$`,
        t(
          "sin 90° = 1 but 2 sin 45° = √2. Try 0°: sin 0° = 0 = 2 sin 0°.",
          "sin 90° = 1 पर 2 sin 45° = √2। 0° लो: sin 0° = 0 = 2 sin 0°।",
        ),
      ],
    ],
  ),
  q1iv: numItem(
    t(
      r`Evaluate $\sin 30^\circ + \cos 60^\circ$.`,
      r`$\sin 30^\circ + \cos 60^\circ$ का मान निकालो।`,
    ),
    r`$1$`,
    [
      [
        r`$\dfrac{1}{2}$`,
        t(
          "Each is 1/2, and there are two of them: 1/2 + 1/2 = 1.",
          "हर एक 1/2 है, और दो हैं: 1/2 + 1/2 = 1।",
        ),
      ],
      [
        r`$\sqrt3$`,
        t(
          "sin 30° is 1/2, not √3/2. Check the table: sin 30° = cos 60° = 1/2.",
          "sin 30°, 1/2 है, √3/2 नहीं। सारणी देखो: sin 30° = cos 60° = 1/2।",
        ),
      ],
    ],
  ),
  tan90: {
    prompt: t("Which of these is not defined?", "इनमें से कौन परिभाषित नहीं है?"),
    right: t("tan 90°", "tan 90°"),
    wrong: [
      {
        label: t("tan 0°", "tan 0°"),
        why: t(
          "tan 0° = 0 ÷ 1 = 0. It's at 90° that tan divides by 0.",
          "tan 0° = 0 ÷ 1 = 0। 90° पर tan शून्य से भाग देता है।",
        ),
      },
      {
        label: t("sin 90°", "sin 90°"),
        why: t(
          "sin 90° = 1. Only tan 90°, sec 90°, cot 0° and cosec 0° are not defined.",
          "sin 90° = 1। केवल tan 90°, sec 90°, cot 0° और cosec 0° परिभाषित नहीं हैं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Evaluate expressions with the ratios of 0°, 30°, 45°, 60°, 90°. */
export const specialValues = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.RatiosOfSpecificAngles],
});
