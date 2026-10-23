import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, frac, numItem } from "../../kit";

const oneMinus = (p: string, q: string) =>
  t(`That's P(E) again. P(not E) = 1 − ${p} = ${q}.`, `यह फिर P(E) है। P(E नहीं) = 1 − ${p} = ${q}।`);

/** Examples 3, 5 and 6, Exercise 15.1 Q1 (i), Q5, Q7, Q12 (iii, iv) and Q13 (iii): P(not E) = 1 − P(E). */
const items = {
  ex3: numItem(
    t(
      "Example 3. A die is thrown once. P(a number greater than 4) = 1/3. What is P(a number less than or equal to 4)?",
      "उदाहरण 3. एक पासा एक बार फेंका जाता है। P(4 से बड़ी संख्या) = 1/3। P(4 या उससे छोटी संख्या) क्या है?",
    ),
    frac(2, 3),
    [
      [frac(1, 3), oneMinus("1/3", "2/3")],
      [
        frac(1, 2),
        t(
          '"Less than or equal to 4" is 1, 2, 3, 4: four faces, 4/6 = 2/3.',
          '"4 या उससे छोटी" यानी 1, 2, 3, 4: चार फलक, 4/6 = 2/3।',
        ),
      ],
    ],
  ),
  ex5: numItem(
    t(
      "Example 5. In a tennis match, P(Sangeeta wins) = 0.62. What is P(Reshma wins)?",
      "उदाहरण 5. एक टेनिस मैच में P(संगीता जीतती है) = 0.62। P(रेशमा जीतती है) क्या है?",
    ),
    "0.38",
    [
      [
        "0.62",
        t("One of the two must win: 1 − 0.62 = 0.38.", "दोनों में से एक को जीतना है: 1 − 0.62 = 0.38।"),
      ],
      ["0.48", t("Check the subtraction: 1 − 0.62 = 0.38.", "घटाव जाँचो: 1 − 0.62 = 0.38।")],
    ],
  ),
  ex6: numItem(
    t(
      "Example 6. Ignoring leap years, what is the probability that Savita and Hamida have **different** birthdays?",
      "उदाहरण 6. लीप वर्ष छोड़कर, सविता और हमीदा के जन्मदिन **अलग** होने की प्रायिकता क्या है?",
    ),
    frac(364, 365),
    [
      [
        frac(1, 365),
        t(
          "1/365 is the same birthday. Different is the complement: 364/365.",
          "1/365 एक ही जन्मदिन है। अलग उसका पूरक है: 364/365।",
        ),
      ],
      [
        frac(364, 366),
        t(
          "Leap years are ignored: 365 days, 364 of them not Savita's.",
          "लीप वर्ष छोड़ दिए: 365 दिन, जिनमें 364 सविता के नहीं।",
        ),
      ],
    ],
  ),
  q1i: {
    prompt: t(
      "Exercise 15.1 Q1 (i). P(E) + P(not E) = …",
      "प्रश्नावली 15.1 प्रश्न 1 (i). P(E) + P(E नहीं) = …",
    ),
    right: t("1", "1"),
    wrong: [
      {
        label: t("0", "0"),
        why: t(
          "Either E happens or it doesn't: together they're sure, so 1.",
          "या तो E होती है या नहीं: मिलकर वे निश्चित हैं, तो 1।",
        ),
      },
      {
        label: t("½", "½"),
        why: t(
          "Only when E and not E are equally likely is each ½; their sum is always 1.",
          "केवल जब E और E नहीं समप्रायिक हों तब हर एक ½ है; उनका योग हमेशा 1 है।",
        ),
      },
    ],
  },
  q5: numItem(
    t(
      "Exercise 15.1 Q5. If P(E) = 0.05, what is P(not E)?",
      "प्रश्नावली 15.1 प्रश्न 5. यदि P(E) = 0.05 है, तो P(E नहीं) क्या है?",
    ),
    "0.95",
    [
      ["0.5", t("1 − 0.05 = 0.95, not 0.5.", "1 − 0.05 = 0.95, 0.5 नहीं।")],
      ["0.05", oneMinus("0.05", "0.95")],
    ],
  ),
  q7: numItem(
    t(
      "Exercise 15.1 Q7. P(2 students do **not** share a birthday) = 0.992. What is P(they share a birthday)?",
      "प्रश्नावली 15.1 प्रश्न 7. P(2 विद्यार्थियों का जन्मदिन एक **न** हो) = 0.992। P(उनका जन्मदिन एक हो) क्या है?",
    ),
    "0.008",
    [
      ["0.08", t("Line up the decimals: 1 − 0.992 = 0.008.", "दशमलव मिलाओ: 1 − 0.992 = 0.008।")],
      ["0.992", oneMinus("0.992", "0.008")],
    ],
  ),
  q12iii: numItem(
    t(
      "Exercise 15.1 Q12 (iii). An arrow stops at one of 1, 2, …, 8. What is P(a number greater than 2)?",
      "प्रश्नावली 15.1 प्रश्न 12 (iii). तीर 1, 2, …, 8 में से किसी पर रुकता है। P(2 से बड़ी संख्या) क्या है?",
    ),
    frac(3, 4),
    [
      [
        frac(1, 4),
        t(
          '1/4 is "2 or less" (1 and 2). Greater than 2: 1 − 1/4 = 3/4.',
          '1/4, "2 या कम" (1 और 2) है। 2 से बड़ी: 1 − 1/4 = 3/4।',
        ),
      ],
      [
        frac(7, 8),
        t(
          "2 itself isn't greater than 2: 3 to 8 is 6 numbers.",
          "2 ख़ुद 2 से बड़ा नहीं: 3 से 8 तक 6 संख्याएँ।",
        ),
      ],
    ],
  ),
  q12iv: numItem(
    t(
      "Exercise 15.1 Q12 (iv). The arrow stops at one of 1, 2, …, 8. What is P(a number less than 9)?",
      "प्रश्नावली 15.1 प्रश्न 12 (iv). तीर 1, 2, …, 8 में से किसी पर रुकता है। P(9 से छोटी संख्या) क्या है?",
    ),
    "1",
    [
      [
        frac(8, 9),
        t(
          "There are 8 outcomes, not 9, and all are less than 9.",
          "परिणाम 9 नहीं 8 हैं, और सब 9 से छोटे हैं।",
        ),
      ],
      [
        "0",
        t(
          "Every number on the board is less than 9: a sure event.",
          "बोर्ड की हर संख्या 9 से छोटी है: निश्चित घटना।",
        ),
      ],
    ],
  ),
  q13iii: numItem(
    t(
      "Exercise 15.1 Q13 (iii). A die is thrown once. P(an even number) = 1/2. What is P(an odd number)?",
      "प्रश्नावली 15.1 प्रश्न 13 (iii). एक पासा एक बार फेंका जाता है। P(सम संख्या) = 1/2। P(विषम संख्या) क्या है?",
    ),
    frac(1, 2),
    [
      [
        frac(1, 3),
        t("Odd is 1, 3, 5: three of six, 1 − 1/2 = 1/2.", "विषम 1, 3, 5: छह में तीन, 1 − 1/2 = 1/2।"),
      ],
      [frac(2, 3), t('Odd is "not even": 1 − 1/2 = 1/2.', 'विषम यानी "सम नहीं": 1 − 1/2 = 1/2।')],
    ],
  ),
} satisfies Record<string, Item>;

/** Use the complement: P(not E) = 1 − P(E). */
export const notE = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.ComplementaryEvents],
});
