import { PassOn, column, page, space, t } from "@chalk/author";
import { choiceQuestion, wordsOn } from "@chalk/content-source/patterns";
import { decimalExpansionDef } from "@chalk/prop-decimal";

const r = String.raw;

/** Three kinds of decimal, read backwards (NCERT Ex 1.4 Q3). */
const threeKinds = page("three-kinds", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Read a decimal backwards", "दशमलव को उल्टा पढ़ो")),
    w.body(
      t(
        r`**It ends.** $43.123456789 = \frac{43123456789}{10^9}$: rational, and in lowest terms its denominator has only 2s and 5s.`,
        r`**यह सांत है।** $43.123456789 = \frac{43123456789}{10^9}$: परिमेय, और न्यूनतम पदों में इसके हर में केवल 2 और 5 हैं।`,
      ),
    ),
    w.body(
      t(
        r`**It repeats.** $43.\overline{123456789}$ is rational too, but its denominator has some prime other than 2 and 5: if it had only 2s and 5s, it would end.`,
        r`**यह दोहराता है।** $43.\overline{123456789}$ भी परिमेय है, पर इसके हर में 2 और 5 के अलावा कोई और अभाज्य है: अगर केवल 2 और 5 होते, तो यह सांत होता।`,
      ),
    ),
    w.body(
      t(
        r`**It never settles.** $0.120120012000120000\ldots$ neither ends nor repeats a block, so it is not a fraction at all: it is **irrational**.`,
        r`**यह कभी नहीं रुकता।** $0.120120012000120000\ldots$ न सांत है न कोई खंड दोहराता है, इसलिए यह भिन्न है ही नहीं: यह **अपरिमेय** है।`,
      ),
    ),
    space(),
  ]);
});

/** Why a fraction must end or repeat: remainders, on the long division. */
const why = page("why", (b) => {
  const w = wordsOn(b);
  return column([
    w.title(t("Why a fraction ends or repeats", "भिन्न सांत या आवर्ती क्यों होती है")),
    w.body(
      t(
        r`Divide 3 by 7, digit by digit. Every remainder is less than 7, so there are only 6 possible non-zero remainders. Within 6 steps a remainder must come back, and from then on the digits repeat. If a remainder is ever 0, the decimal ends instead.`,
        r`3 को 7 से अंक-अंक भाग दो। हर शेषफल 7 से कम है, इसलिए केवल 6 शून्येतर शेषफल संभव हैं। 6 कदमों के अंदर कोई शेषफल लौटेगा, और तब से अंक दोहराते हैं। अगर कभी शेषफल 0 हो जाए, तो दशमलव सांत हो जाता है।`,
      ),
    ),
    b.prop(decimalExpansionDef, "division", { numerator: 3, denominator: 7, isClockShown: true }),
    w.note(
      t(
        "So every fraction ends or repeats; a decimal that does neither can't be a fraction.",
        "इसलिए हर भिन्न सांत या आवर्ती होती है; जो दशमलव दोनों में से कुछ नहीं करता वह भिन्न नहीं हो सकता।",
      ),
    ),
    space(),
  ]);
});

/** Your turn: 0.45 repeating. */
const yourTurn = page(
  "your-turn",
  (b) => {
    const w = wordsOn(b);
    const ask = choiceQuestion(b, {
      prompt: t(
        r`$0.\overline{45} = 0.454545\ldots$ What can you say about it?`,
        r`$0.\overline{45} = 0.454545\ldots$ इसके बारे में क्या कह सकते हो?`,
      ),
      options: [
        {
          id: "irrational",
          label: t("It is irrational: it never ends", "यह अपरिमेय है: यह कभी सांत नहीं होता"),
          feedback: t(
            r`Never ending isn't enough: it **repeats**, and a repeating decimal is a fraction ($0.\overline{45} = \frac{5}{11}$).`,
            r`कभी ख़त्म न होना काफ़ी नहीं: यह **दोहराता** है, और आवर्ती दशमलव एक भिन्न है ($0.\overline{45} = \frac{5}{11}$)।`,
          ),
        },
        {
          id: "twoFive",
          label: t("Rational, denominator only 2s and 5s", "परिमेय, हर में केवल 2 और 5"),
          feedback: t(
            r`With only 2s and 5s it would end. It doesn't, so another prime is there: $11$.`,
            r`केवल 2 और 5 होते तो यह सांत होता। यह सांत नहीं है, इसलिए कोई और अभाज्य है: $11$।`,
          ),
        },
        {
          id: "right",
          label: t("Rational, denominator has another prime", "परिमेय, हर में कोई और अभाज्य"),
        },
      ],
      answer: "right",
    });
    return column([w.title(t("Your turn", "अब तुम")), ask, space()]);
  },
  { passOn: PassOn.Rules },
);

/** The pages, in reading order. */
export const overview = [threeKinds, why, yourTurn];
