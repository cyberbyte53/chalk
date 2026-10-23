import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const r = String.raw;

/** Exercise 8.4 Q4: choose the value, using the identities. */
const items = {
  q4ii: numItem(
    t(
      r`Exercise 8.4 Q4 (ii): $(1 + \tan\theta + \sec\theta)(1 + \cot\theta - \operatorname{cosec}\theta)$ equals?`,
      r`प्रश्नावली 8.4 प्र4 (ii): $(1 + \tan\theta + \sec\theta)(1 + \cot\theta - \operatorname{cosec}\theta)$ बराबर है?`,
    ),
    r`$2$`,
    [
      [
        r`$1$`,
        t(
          "In sin and cos: [(cos + sin)² − 1] ÷ (sin cos) = 2 sin cos ÷ (sin cos) = 2.",
          "sin और cos में: [(cos + sin)² − 1] ÷ (sin cos) = 2 sin cos ÷ (sin cos) = 2।",
        ),
      ],
      [
        r`$0$`,
        t(
          "The brackets don't cancel each other. Write both in sin and cos and multiply.",
          "कोष्ठक एक-दूसरे को नहीं काटते। दोनों को sin और cos में लिखो और गुणा करो।",
        ),
      ],
    ],
  ),
  q4iii: numItem(
    t(
      r`Exercise 8.4 Q4 (iii): $(\sec A + \tan A)(1 - \sin A)$ equals?`,
      r`प्रश्नावली 8.4 प्र4 (iii): $(\sec A + \tan A)(1 - \sin A)$ बराबर है?`,
    ),
    r`$\cos A$`,
    [
      [
        r`$\sec A$`,
        t(
          "(1 + sin A)/cos A × (1 − sin A) = (1 − sin²A)/cos A = cos²A/cos A = cos A.",
          "(1 + sin A)/cos A × (1 − sin A) = (1 − sin²A)/cos A = cos²A/cos A = cos A।",
        ),
      ],
      [
        r`$\sin A$`,
        t(
          "1 − sin²A becomes cos²A, not sin²A. That leaves cos A.",
          "1 − sin²A, cos²A बनता है, sin²A नहीं। उससे cos A बचता है।",
        ),
      ],
    ],
  ),
  q4iv: numItem(
    t(
      r`Exercise 8.4 Q4 (iv): $\dfrac{1 + \tan^2 A}{1 + \cot^2 A}$ equals?`,
      r`प्रश्नावली 8.4 प्र4 (iv): $\dfrac{1 + \tan^2 A}{1 + \cot^2 A}$ बराबर है?`,
    ),
    r`$\tan^2 A$`,
    [
      [
        r`$\cot^2 A$`,
        t(
          "The top is sec²A and the bottom cosec²A: sec²/cosec² = sin²/cos² = tan²A.",
          "ऊपर sec²A और नीचे cosec²A: sec²/cosec² = sin²/cos² = tan²A।",
        ),
      ],
      [
        r`$1$`,
        t(
          "1 + tan²A and 1 + cot²A are different unless A = 45°.",
          "1 + tan²A और 1 + cot²A अलग हैं, जब तक A = 45° न हो।",
        ),
      ],
    ],
  ),
  sumsq: numItem(
    t(
      r`What is $\sin^2 37^\circ + \cos^2 37^\circ$?`,
      r`$\sin^2 37^\circ + \cos^2 37^\circ$ क्या है?`,
    ),
    r`$1$`,
    [
      [
        r`$2$`,
        t(
          "Each square is less than 1, and together they make exactly 1, for any angle.",
          "हर वर्ग 1 से कम है, और मिलकर ठीक 1 बनाते हैं, किसी भी कोण के लिए।",
        ),
      ],
      [
        r`$\sin 74^\circ$`,
        t(
          "This is the identity sin²A + cos²A = 1; no double angle is involved.",
          "यह सर्वसमिका sin²A + cos²A = 1 है; इसमें दुगुना कोण नहीं आता।",
        ),
      ],
    ],
  ),
  secTan: numItem(
    t(
      r`If $\sec A + \tan A = 3$, what is $\sec A - \tan A$?`,
      r`अगर $\sec A + \tan A = 3$, तो $\sec A - \tan A$ क्या है?`,
    ),
    r`$\dfrac{1}{3}$`,
    [
      [
        r`$-3$`,
        t(
          "sec²A − tan²A = 1, so (sec + tan)(sec − tan) = 1, and sec − tan = 1/3.",
          "sec²A − tan²A = 1, तो (sec + tan)(sec − tan) = 1, और sec − tan = 1/3।",
        ),
      ],
      [
        r`$3$`,
        t(
          "sec − tan isn't the same as sec + tan. Their product is 1, so it's 1/3.",
          "sec − tan, sec + tan जैसा नहीं है। उनका गुणनफल 1 है, इसलिए यह 1/3 है।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Simplify with sin² + cos² = 1 and the other two identities. */
export const identitySimplify = bankFamily(items, {
  level: Level.Hard,
  tests: [Concept.TrigonometricIdentities],
});
