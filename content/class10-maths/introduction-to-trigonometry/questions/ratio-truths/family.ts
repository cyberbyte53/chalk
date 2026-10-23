import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

/** Exercise 8.1 Q11 and the bounds: what a ratio can and can't be. */
const items = {
  secA: {
    prompt: t(
      "Exercise 8.1 Q11 (ii): sec A = 12/5 for some value of angle A. True or false?",
      "प्रश्नावली 8.1 प्र11 (ii): कोण A के किसी मान के लिए sec A = 12/5। सत्य या असत्य?",
    ),
    right: t("True: sec A is more than 1", "सत्य: sec A, 1 से ज़्यादा है"),
    wrong: [
      {
        label: t("False: no ratio is more than 1", "असत्य: कोई अनुपात 1 से ज़्यादा नहीं"),
        why: t(
          "Only sin and cos stay below 1. sec A = hypotenuse ÷ adjacent is always above 1.",
          "केवल sin और cos 1 से कम रहते हैं। sec A = कर्ण ÷ संलग्न हमेशा 1 से ज़्यादा है।",
        ),
      },
      {
        label: t("False: 12 and 5 aren't Pythagorean", "असत्य: 12 और 5 पाइथागोरी नहीं"),
        why: t(
          "Hypotenuse 12 and adjacent 5 give opposite √(144 − 25) = √119: a fine triangle.",
          "कर्ण 12 और संलग्न 5 से सम्मुख √(144 − 25) = √119: एक ठीक त्रिभुज।",
        ),
      },
    ],
  },
  cosecA: {
    prompt: t(
      "Exercise 8.1 Q11 (iii): cos A is the abbreviation used for the cosecant of angle A. True or false?",
      "प्रश्नावली 8.1 प्र11 (iii): कोण A के कोसेकेंट के लिए संक्षेप cos A है। सत्य या असत्य?",
    ),
    right: t("False: cos A is the cosine", "असत्य: cos A कोसाइन है"),
    wrong: [
      {
        label: t('True: both start with "cos"', 'सत्य: दोनों "cos" से शुरू होते हैं'),
        why: t(
          "The cosecant is written cosec A. cos A is the cosine, adjacent ÷ hypotenuse.",
          "कोसेकेंट cosec A लिखा जाता है। cos A कोसाइन है, संलग्न ÷ कर्ण।",
        ),
      },
      {
        label: t("True: they are the same ratio", "सत्य: दोनों एक ही अनुपात हैं"),
        why: t(
          "They are different: cosec A = 1/sin A, while cos A = adjacent ÷ hypotenuse.",
          "दोनों अलग हैं: cosec A = 1/sin A, जबकि cos A = संलग्न ÷ कर्ण।",
        ),
      },
    ],
  },
  sinBound: {
    prompt: t(
      "For an acute angle A, which of these must be true?",
      "न्यून कोण A के लिए, इनमें से क्या ज़रूर सत्य है?",
    ),
    right: t("sin A is less than 1", "sin A, 1 से कम है"),
    wrong: [
      {
        label: t("tan A is less than 1", "tan A, 1 से कम है"),
        why: t(
          "tan A passes 1 once A is more than 45°: opposite is then longer than adjacent.",
          "A के 45° से ज़्यादा होने पर tan A, 1 से आगे निकल जाता है: तब सम्मुख, संलग्न से लंबी होती है।",
        ),
      },
      {
        label: t("cosec A is less than 1", "cosec A, 1 से कम है"),
        why: t(
          "cosec A = hypotenuse ÷ opposite, and the hypotenuse is longest, so it's more than 1.",
          "cosec A = कर्ण ÷ सम्मुख, और कर्ण सबसे लंबा है, इसलिए यह 1 से ज़्यादा है।",
        ),
      },
    ],
  },
  sameSize: {
    prompt: t(
      "Two right triangles have the same angle A, but one is three times as big. How do their values of cos A compare?",
      "दो समकोण त्रिभुजों में वही कोण A है, पर एक तीन गुना बड़ा है। उनके cos A के मान कैसे हैं?",
    ),
    right: t("They are equal", "बराबर हैं"),
    wrong: [
      {
        label: t("The bigger one's is three times as big", "बड़े वाले का तीन गुना है"),
        why: t(
          "Both sides of the ratio grow three times, so the ratio doesn't change.",
          "अनुपात की दोनों भुजाएँ तीन गुना बढ़ती हैं, इसलिए अनुपात नहीं बदलता।",
        ),
      },
      {
        label: t("The bigger one's is a third as big", "बड़े वाले का एक-तिहाई है"),
        why: t(
          "The triangles are similar (AA), so their side ratios are the same.",
          "त्रिभुज समरूप हैं (AA), इसलिए उनकी भुजाओं के अनुपात वही हैं।",
        ),
      },
    ],
  },
  negRoot: {
    prompt: t(
      "With sin A = 1/3 we get AB² = 8k². Why do we take AB = 2√2 k and not −2√2 k?",
      "sin A = 1/3 से AB² = 8k² मिलता है। हम AB = 2√2 k क्यों लेते हैं, −2√2 k क्यों नहीं?",
    ),
    right: t("A length can't be negative", "लंबाई ऋणात्मक नहीं हो सकती"),
    wrong: [
      {
        label: t("Square roots are always negative", "वर्गमूल हमेशा ऋणात्मक होते हैं"),
        why: t(
          "Both ±2√2 k square to 8k². We choose the positive one because AB is a length.",
          "±2√2 k दोनों का वर्ग 8k² है। हम धनात्मक इसलिए चुनते हैं क्योंकि AB एक लंबाई है।",
        ),
      },
      {
        label: t("k is always less than 1", "k हमेशा 1 से कम होता है"),
        why: t(
          "k can be any positive number. The sign comes from AB being a length.",
          "k कोई भी धनात्मक संख्या हो सकती है। चिह्न इसलिए क्योंकि AB एक लंबाई है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** What a ratio can and cannot be. */
export const ratioTruths = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.RatiosFromOneRatio, Concept.TrigonometricRatios],
});
