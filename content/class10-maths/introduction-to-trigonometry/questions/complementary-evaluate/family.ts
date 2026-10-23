import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const r = String.raw;

/** Exercise 8.3 Q1, Q2, Q7: evaluate using complementary angles. */
const items = {
  q1i: numItem(
    t(
      r`Exercise 8.3 Q1 (i): evaluate $\dfrac{\sin 18^\circ}{\cos 72^\circ}$.`,
      r`प्रश्नावली 8.3 प्र1 (i): $\dfrac{\sin 18^\circ}{\cos 72^\circ}$ का मान निकालो।`,
    ),
    r`$1$`,
    [
      [
        r`$\dfrac{1}{4}$`,
        t(
          "Ratios don't divide like their angles. cos 72° = sin 18°, so the fraction is 1.",
          "अनुपात कोणों की तरह भाग नहीं होते। cos 72° = sin 18°, इसलिए भिन्न 1 है।",
        ),
      ],
      [
        r`$\tan 18^\circ$`,
        t(
          "tan 18° = sin 18° ÷ cos 18°. Here the bottom is cos 72°, which equals sin 18°.",
          "tan 18° = sin 18° ÷ cos 18°। यहाँ नीचे cos 72° है, जो sin 18° के बराबर है।",
        ),
      ],
    ],
  ),
  q1iii: numItem(
    t(
      r`Exercise 8.3 Q1 (iii): evaluate $\cos 48^\circ - \sin 42^\circ$.`,
      r`प्रश्नावली 8.3 प्र1 (iii): $\cos 48^\circ - \sin 42^\circ$ का मान निकालो।`,
    ),
    r`$0$`,
    [
      [
        r`$\cos 6^\circ$`,
        t(
          "Angles don't subtract inside ratios. cos 48° = sin 42°, so the difference is 0.",
          "अनुपातों के अंदर कोण नहीं घटते। cos 48° = sin 42°, इसलिए अंतर 0 है।",
        ),
      ],
      [
        r`$1$`,
        t(
          "1 would be sin² + cos² of one angle. Here the two terms are equal and cancel.",
          "1, किसी एक कोण का sin² + cos² होता। यहाँ दोनों पद बराबर हैं और कट जाते हैं।",
        ),
      ],
    ],
  ),
  q1iv: numItem(
    t(
      r`Exercise 8.3 Q1 (iv): evaluate $\operatorname{cosec} 31^\circ - \sec 59^\circ$.`,
      r`प्रश्नावली 8.3 प्र1 (iv): $\operatorname{cosec} 31^\circ - \sec 59^\circ$ का मान निकालो।`,
    ),
    r`$0$`,
    [
      [
        r`$\sec 28^\circ$`,
        t(
          "31° + 59° = 90°, so sec 59° = cosec 31°: the difference is 0.",
          "31° + 59° = 90°, इसलिए sec 59° = cosec 31°: अंतर 0 है।",
        ),
      ],
      [
        r`$2\operatorname{cosec} 31^\circ$`,
        t(
          "They subtract, not add: cosec 31° − cosec 31° = 0.",
          "ये घटते हैं, जुड़ते नहीं: cosec 31° − cosec 31° = 0।",
        ),
      ],
    ],
  ),
  q7: numItem(
    t(
      r`Exercise 8.3 Q7: write $\sin 67^\circ + \cos 75^\circ$ using ratios of angles between 0° and 45°.`,
      r`प्रश्नावली 8.3 प्र7: $\sin 67^\circ + \cos 75^\circ$ को 0° और 45° के बीच के कोणों के अनुपातों में लिखो।`,
    ),
    r`$\cos 23^\circ + \sin 15^\circ$`,
    [
      [
        r`$\sin 23^\circ + \cos 15^\circ$`,
        t(
          "Changing the angle to its complement also swaps sin and cos.",
          "कोण को उसके पूरक में बदलने से sin और cos भी आपस में बदलते हैं।",
        ),
      ],
      [
        r`$\cos 15^\circ + \sin 23^\circ$`,
        t(
          "90° − 67° = 23° goes with the sin term, and 90° − 75° = 15° with the cos term.",
          "90° − 67° = 23°, sin वाले पद के साथ जाता है, और 90° − 75° = 15°, cos वाले के साथ।",
        ),
      ],
    ],
  ),
  q2: numItem(
    t(
      r`Exercise 8.3 Q2 (i): $\tan 48^\circ \tan 23^\circ \tan 42^\circ \tan 67^\circ$ equals?`,
      r`प्रश्नावली 8.3 प्र2 (i): $\tan 48^\circ \tan 23^\circ \tan 42^\circ \tan 67^\circ$ बराबर है?`,
    ),
    r`$1$`,
    [
      [
        r`$0$`,
        t(
          "None of the tans is 0. tan 48° = cot 42°, and cot × tan = 1 for each pair.",
          "कोई tan शून्य नहीं है। tan 48° = cot 42°, और हर जोड़ी में cot × tan = 1।",
        ),
      ],
      [
        r`$\tan 180^\circ$`,
        t(
          "Ratios don't add their angles when multiplied. Pair them: tan 48° tan 42° = 1.",
          "गुणा करने पर अनुपात अपने कोण नहीं जोड़ते। जोड़ियाँ बनाओ: tan 48° tan 42° = 1।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Evaluate with sin(90° − A) = cos A and the other pairs. */
export const complementaryEvaluate = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.ComplementaryAngles],
});
