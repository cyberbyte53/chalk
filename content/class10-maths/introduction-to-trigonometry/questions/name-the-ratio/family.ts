import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const r = String.raw;

/** In ∆ ABC right-angled at B: which ratio is this side ÷ side, for which angle. */
const items = {
  sinA: numItem(
    t(
      r`In ∆ ABC right-angled at B, what is $\dfrac{BC}{AC}$ for angle A?`,
      r`∆ ABC में, जो B पर समकोण है, कोण A के लिए $\dfrac{BC}{AC}$ क्या है?`,
    ),
    r`$\sin A$`,
    [
      [
        r`$\cos A$`,
        t(
          "BC is across from A, so it's the opposite side: opposite ÷ hypotenuse is sin.",
          "BC, A के सामने है, इसलिए सम्मुख भुजा है: सम्मुख ÷ कर्ण sin है।",
        ),
      ],
      [
        r`$\tan A$`,
        t(
          "tan divides by the adjacent side AB. Here we divide by the hypotenuse AC.",
          "tan संलग्न भुजा AB से भाग देता है। यहाँ कर्ण AC से भाग दे रहे हैं।",
        ),
      ],
    ],
  ),
  cosA: numItem(
    t(
      r`In ∆ ABC right-angled at B, what is $\dfrac{AB}{AC}$ for angle A?`,
      r`∆ ABC में, जो B पर समकोण है, कोण A के लिए $\dfrac{AB}{AC}$ क्या है?`,
    ),
    r`$\cos A$`,
    [
      [
        r`$\sin A$`,
        t(
          "AB touches angle A, so it's adjacent: adjacent ÷ hypotenuse is cos.",
          "AB कोण A को छूती है, इसलिए संलग्न है: संलग्न ÷ कर्ण cos है।",
        ),
      ],
      [
        r`$\sec A$`,
        t(
          "sec is hypotenuse ÷ adjacent, the other way up: AC/AB.",
          "sec, कर्ण ÷ संलग्न है, उलटा: AC/AB।",
        ),
      ],
    ],
  ),
  tanC: numItem(
    t(
      r`In ∆ ABC right-angled at B, what is $\dfrac{AB}{BC}$ for angle C?`,
      r`∆ ABC में, जो B पर समकोण है, कोण C के लिए $\dfrac{AB}{BC}$ क्या है?`,
    ),
    r`$\tan C$`,
    [
      [
        r`$\cot C$`,
        t(
          "For angle C, AB is opposite and BC adjacent: opposite ÷ adjacent is tan.",
          "कोण C के लिए AB सम्मुख है और BC संलग्न: सम्मुख ÷ संलग्न tan है।",
        ),
      ],
      [
        r`$\sin C$`,
        t(
          "sin divides by the hypotenuse AC. AB/BC uses the two shorter sides.",
          "sin कर्ण AC से भाग देता है। AB/BC में दोनों छोटी भुजाएँ हैं।",
        ),
      ],
    ],
  ),
  cosecA: numItem(
    t(
      r`In ∆ ABC right-angled at B, what is $\dfrac{AC}{BC}$ for angle A?`,
      r`∆ ABC में, जो B पर समकोण है, कोण A के लिए $\dfrac{AC}{BC}$ क्या है?`,
    ),
    r`$\operatorname{cosec} A$`,
    [
      [
        r`$\sec A$`,
        t(
          "sec A = AC/AB uses the adjacent side. BC is opposite A, so this is cosec A = 1/sin A.",
          "sec A = AC/AB में संलग्न भुजा है। BC, A के सम्मुख है, इसलिए यह cosec A = 1/sin A है।",
        ),
      ],
      [
        r`$\sin A$`,
        t("sin A is BC/AC. AC/BC is its reciprocal.", "sin A, BC/AC है। AC/BC उसका व्युत्क्रम है।"),
      ],
    ],
  ),
  hyp: {
    prompt: t(
      "In a right triangle, which side is never the side opposite or adjacent to an acute angle?",
      "समकोण त्रिभुज में कौन-सी भुजा किसी न्यून कोण की न सम्मुख होती है न संलग्न?",
    ),
    right: t("The hypotenuse", "कर्ण"),
    wrong: [
      {
        label: t("The shortest side", "सबसे छोटी भुजा"),
        why: t(
          "The shortest side is opposite the smaller acute angle.",
          "सबसे छोटी भुजा छोटे न्यून कोण के सम्मुख होती है।",
        ),
      },
      {
        label: t("The base", "आधार"),
        why: t(
          "The base touches one acute angle, so it's adjacent to that one.",
          "आधार एक न्यून कोण को छूता है, इसलिए उसकी संलग्न भुजा है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Name the ratio a side ÷ side is, for a given angle. */
export const nameTheRatio = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.TrigonometricRatios],
});
