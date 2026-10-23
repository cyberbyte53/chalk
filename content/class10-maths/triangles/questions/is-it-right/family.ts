import { t } from "@chalk/author";
import { Level, type Localized } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const yesHyp = (side: string): Localized => t(`Yes, hypotenuse ${side} cm`, `हाँ, कर्ण ${side} cm`);
const no = t("No, not right-angled", "नहीं, समकोण नहीं");

/** Exercise 6.5 Q1: is the triangle right-angled, and if so, which side is the hypotenuse? */
const items = {
  q1i: {
    prompt: t(
      "Sides 7 cm, 24 cm and 25 cm. Is it a right triangle?",
      "भुजाएँ 7 cm, 24 cm और 25 cm। क्या यह समकोण त्रिभुज है?",
    ),
    right: yesHyp("25"),
    wrong: [
      {
        label: yesHyp("24"),
        why: t("The hypotenuse is always the longest side.", "कर्ण हमेशा सबसे लंबी भुजा होती है।"),
      },
      {
        label: no,
        why: t("7² + 24² = 49 + 576 = 625 = 25².", "7² + 24² = 49 + 576 = 625 = 25²।"),
      },
    ],
  },
  q1ii: {
    prompt: t(
      "Sides 3 cm, 8 cm and 6 cm. Is it a right triangle?",
      "भुजाएँ 3 cm, 8 cm और 6 cm। क्या यह समकोण त्रिभुज है?",
    ),
    right: no,
    wrong: [
      {
        label: yesHyp("8"),
        why: t("3² + 6² = 45, but 8² = 64.", "3² + 6² = 45, पर 8² = 64।"),
      },
      {
        label: yesHyp("6"),
        why: t(
          "The hypotenuse would be the longest side, 8 cm, and 3² + 6² ≠ 8².",
          "कर्ण सबसे लंबी भुजा, 8 cm, होती, और 3² + 6² ≠ 8²।",
        ),
      },
    ],
  },
  q1iii: {
    prompt: t(
      "Sides 50 cm, 80 cm and 100 cm. Is it a right triangle?",
      "भुजाएँ 50 cm, 80 cm और 100 cm। क्या यह समकोण त्रिभुज है?",
    ),
    right: no,
    wrong: [
      {
        label: yesHyp("100"),
        why: t("50² + 80² = 8900, but 100² = 10000.", "50² + 80² = 8900, पर 100² = 10000।"),
      },
      {
        label: yesHyp("80"),
        why: t(
          "The hypotenuse would be 100 cm, the longest, and even that fails: 8900 ≠ 10000.",
          "कर्ण 100 cm, सबसे लंबी, होती, और वह भी नहीं बनता: 8900 ≠ 10000।",
        ),
      },
    ],
  },
  q1iv: {
    prompt: t(
      "Sides 13 cm, 12 cm and 5 cm. Is it a right triangle?",
      "भुजाएँ 13 cm, 12 cm और 5 cm। क्या यह समकोण त्रिभुज है?",
    ),
    right: yesHyp("13"),
    wrong: [
      {
        label: yesHyp("12"),
        why: t("The hypotenuse is the longest side, 13 cm.", "कर्ण सबसे लंबी भुजा है, 13 cm।"),
      },
      {
        label: no,
        why: t("5² + 12² = 25 + 144 = 169 = 13².", "5² + 12² = 25 + 144 = 169 = 13²।"),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Use the converse of the Pythagoras theorem to spot a right triangle. */
export const isItRight = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.PythagorasTheorem],
});
