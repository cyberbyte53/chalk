import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, frac, numItem } from "../../kit";

/** Example 9, Exercise 15.1 Q22 (ii), Q23 and Q25 (i): two or three coins as ordered outcomes. */
const items = {
  ex9: numItem(
    t(
      "Example 9. Harpreet tosses two different coins together. What is P(at least one head)?",
      "उदाहरण 9. हरप्रीत दो अलग सिक्के एक साथ उछालती है। P(कम से कम एक चित) क्या है?",
    ),
    frac(3, 4),
    [
      [
        frac(2, 3),
        t(
          "HT and TH are different outcomes: HH, HT, TH of 4.",
          "HT और TH अलग परिणाम हैं: 4 में HH, HT, TH।",
        ),
      ],
      [
        frac(1, 4),
        t(
          "1/4 is no head at all (TT). At least one: 1 − 1/4.",
          "1/4 कोई चित नहीं (TT) है। कम से कम एक: 1 − 1/4।",
        ),
      ],
    ],
  ),
  ex9b: numItem(
    t(
      "Example 9. Harpreet tosses two different coins together. What is P(at most one head)?",
      "उदाहरण 9. हरप्रीत दो अलग सिक्के एक साथ उछालती है। P(अधिक से अधिक एक चित) क्या है?",
    ),
    frac(3, 4),
    [
      [
        frac(1, 2),
        t(
          '"At most one" includes no heads: HT, TH, TT, 3 of 4.',
          '"अधिक से अधिक एक" में कोई चित नहीं भी आता: HT, TH, TT, 4 में 3।',
        ),
      ],
      [
        frac(1, 4),
        t(
          "1/4 is two heads (HH). At most one: 1 − 1/4.",
          "1/4 दो चित (HH) है। अधिक से अधिक एक: 1 − 1/4।",
        ),
      ],
    ],
  ),
  q23: numItem(
    t(
      "Exercise 15.1 Q23. Hanif tosses a coin 3 times and wins if all three are the same. What is P(Hanif loses)?",
      "प्रश्नावली 15.1 प्रश्न 23. हनीफ़ सिक्का 3 बार उछालता है और तीनों एक जैसे आएँ तो जीतता है। P(हनीफ़ हारता है) क्या है?",
    ),
    frac(3, 4),
    [
      [
        frac(1, 4),
        t(
          "1/4 is winning: HHH, TTT of 8. He loses the other 6.",
          "1/4 जीतना है: 8 में HHH, TTT। बाक़ी 6 में वह हारता है।",
        ),
      ],
      [
        frac(1, 2),
        t(
          "Three tosses give 8 outcomes, and only 2 win.",
          "तीन उछाल 8 परिणाम देते हैं, और केवल 2 जीतते हैं।",
        ),
      ],
    ],
  ),
  q25i: {
    prompt: t(
      'Exercise 15.1 Q25 (i). "Two coins give two heads, two tails or one of each, so each has probability 1/3." Is this right?',
      'प्रश्नावली 15.1 प्रश्न 25 (i). "दो सिक्कों पर दो चित, दो पट या एक-एक आते हैं, तो हर एक की प्रायिकता 1/3 है।" क्या यह सही है?',
    ),
    right: t("No: one of each is 1/2", "नहीं: एक-एक की 1/2 है"),
    wrong: [
      {
        label: t("Yes: three outcomes, 1/3 each", "हाँ: तीन परिणाम, हर एक 1/3"),
        why: t(
          '"One of each" happens two ways, HT and TH: 2 of 4. Two heads is only 1/4.',
          '"एक-एक" दो तरह से होता है, HT और TH: 4 में 2। दो चित केवल 1/4 है।',
        ),
      },
      {
        label: t("No: two heads is 1/2", "नहीं: दो चित की 1/2 है"),
        why: t(
          'Two heads is only HH: 1 of 4. It\'s "one of each" that is 2 of 4.',
          'दो चित केवल HH है: 4 में 1। "एक-एक" 4 में 2 है।',
        ),
      },
    ],
  },
  q22ii: {
    prompt: t(
      'Exercise 15.1 Q22 (ii). "Two dice give 11 possible sums, 2 to 12, so each has probability 1/11." Do you agree?',
      'प्रश्नावली 15.1 प्रश्न 22 (ii). "दो पासे 2 से 12 तक 11 संभव योग देते हैं, तो हर एक की प्रायिकता 1/11 है।" क्या तुम सहमत हो?',
    ),
    right: t("No: sum 7 has 6 pairs, sum 2 has 1", "नहीं: योग 7 के 6 युग्म, योग 2 का 1"),
    wrong: [
      {
        label: t("Yes: there are 11 sums, 1/11 each", "हाँ: 11 योग हैं, हर एक 1/11"),
        why: t(
          "Sums aren't equally likely outcomes. Of the 36 pairs, 1 gives 2 and 6 give 7.",
          "योग समप्रायिक परिणाम नहीं हैं। 36 युग्मों में 1 से 2 और 6 से 7 बनता है।",
        ),
      },
      {
        label: t("No: there are 12 sums, 1/12 each", "नहीं: 12 योग हैं, हर एक 1/12"),
        why: t(
          "There are 11 sums (2 to 12), and they still aren't equally likely.",
          "योग 11 हैं (2 से 12), और वे फिर भी समप्रायिक नहीं।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** List the ordered outcomes of two or three coins, and spot the "unordered" slip. */
export const pairsAndCoins = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.TwoCoinsAndTwoDice],
});
