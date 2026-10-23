import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, frac, numItem } from "../../kit";

const r = String.raw;

const shop = (what: { en: string; hi: string }) =>
  t(
    `Exercise 15.2 Q1*. Shyam and Ekta each visit a shop on one day, Tuesday to Saturday, every day equally likely. What is P(they visit on ${what.en})?`,
    `प्रश्नावली 15.2 प्रश्न 1*. श्याम और एकता मंगलवार से शनिवार तक किसी एक दिन दुकान जाते हैं, हर दिन समप्रायिक। P(वे ${what.hi} जाएँ) क्या है?`,
  );
const odd = (what: { en: string; hi: string }) =>
  t(
    `Exercise 15.2 Q2*. A die numbered 1, 2, 2, 3, 3, 6 is thrown twice and the scores added. What is P(the total is ${what.en})?`,
    `प्रश्नावली 15.2 प्रश्न 2*. 1, 2, 2, 3, 3, 6 अंकित पासा दो बार फेंककर अंक जोड़े जाते हैं। P(कुल ${what.hi}) क्या है?`,
  );

/** Exercise 15.2 Q1–Q5* (optional): pairs of days, a strange die, and finding an unknown count. */
const items = {
  q1i: numItem(shop({ en: "the same day", hi: "एक ही दिन" }), frac(1, 5), [
    [
      frac(1, 25),
      t(
        "Any of the 5 days can be the shared one: 5 of 25.",
        "5 में से कोई भी दिन साझा हो सकता है: 25 में 5।",
      ),
    ],
    [
      frac(1, 10),
      t(
        "Pairs are ordered (Shyam, Ekta): 25 in all, 5 matching.",
        "युग्म क्रमित हैं (श्याम, एकता): कुल 25, मेल वाले 5।",
      ),
    ],
  ]),
  q1ii: numItem(shop({ en: "consecutive days", hi: "लगातार दिनों पर" }), frac(8, 25), [
    [
      frac(4, 25),
      t(
        "Either can go first: (Tue, Wed) and (Wed, Tue). 8 of 25.",
        "कोई भी पहले जा सकता है: (मंगल, बुध) और (बुध, मंगल)। 25 में 8।",
      ),
    ],
    [
      frac(2, 5),
      t(
        "Count the pairs: 4 neighbouring days × 2 orders = 8 of 25.",
        "युग्म गिनो: 4 पड़ोसी दिन × 2 क्रम = 25 में 8।",
      ),
    ],
  ]),
  q1iii: numItem(shop({ en: "different days", hi: "अलग दिनों पर" }), frac(4, 5), [
    [frac(1, 5), t("1/5 is the same day. Different: 1 − 1/5.", "1/5 एक ही दिन है। अलग: 1 − 1/5।")],
    [
      frac(12, 25),
      t(
        "12/25 leaves out the consecutive days, but those are different days too.",
        "12/25 लगातार दिन छोड़ता है, पर वे भी अलग दिन हैं।",
      ),
    ],
  ]),
  q2i: numItem(odd({ en: "even", hi: "सम हो" }), frac(1, 2), [
    [
      frac(2, 3),
      t("Odd + odd is even too: 9 + 9 = 18 of 36.", "विषम + विषम भी सम है: 36 में 9 + 9 = 18।"),
    ],
    [frac(1, 4), t("Even + even and odd + odd: 18 of 36.", "सम + सम और विषम + विषम: 36 में 18।")],
  ]),
  q2ii: numItem(odd({ en: "6", hi: "6 हो" }), frac(1, 9), [
    [
      frac(1, 36),
      t(
        "There are two 3s each throw: 2 × 2 = 4 pairs give 3 + 3.",
        "हर फेंक में दो 3 हैं: 2 × 2 = 4 युग्म 3 + 3 देते हैं।",
      ),
    ],
    [
      frac(5, 36),
      t(
        "That's an ordinary die. Here only 3 + 3 makes 6: 4 of 36.",
        "यह साधारण पासा है। यहाँ केवल 3 + 3 से 6 बनता है: 36 में 4।",
      ),
    ],
  ]),
  q2iii: numItem(odd({ en: "at least 6", hi: "कम से कम 6 हो" }), frac(5, 12), [
    [
      frac(11, 36),
      t(
        "Add the 4 pairs of 3 + 3 = 6: 11 + 4 = 15 of 36.",
        "3 + 3 = 6 वाले 4 युग्म जोड़ो: 36 में 11 + 4 = 15।",
      ),
    ],
    [
      frac(13, 18),
      t("That's an ordinary die. On this one, 15 of 36.", "यह साधारण पासा है। इस पर 36 में 15।"),
    ],
  ]),
  q3: numItem(
    t(
      "Exercise 15.2 Q3*. A bag has 5 red balls and some blue ones. P(blue) is double P(red). How many blue balls are there?",
      "प्रश्नावली 15.2 प्रश्न 3*. एक थैले में 5 लाल और कुछ नीली गेंदें हैं। P(नीली), P(लाल) की दुगुनी है। कितनी नीली गेंदें हैं?",
    ),
    "10",
    [
      ["15", t("15 is all the balls. Blue = 2 × red = 10.", "15 सारी गेंदें हैं। नीली = 2 × लाल = 10।")],
      ["7", t("Double means × 2, not + 2: 2 × 5 = 10.", "दुगुना मतलब × 2, + 2 नहीं: 2 × 5 = 10।")],
    ],
  ),
  q4: numItem(
    t(
      "Exercise 15.2 Q4*. A box has 12 balls, x black. Adding 6 more black balls doubles P(black). Find x.",
      "प्रश्नावली 15.2 प्रश्न 4*. एक डिब्बे में 12 गेंदें हैं, x काली। 6 काली गेंदें और डालने से P(काली) दुगुनी हो जाती है। x ज्ञात करो।",
    ),
    "x = 3",
    [
      [
        "x = 6",
        t(
          r`The box now has 18 balls: $\frac{x + 6}{18} = \frac{2x}{12}$.`,
          r`डिब्बे में अब 18 गेंदें हैं: $\frac{x + 6}{18} = \frac{2x}{12}$।`,
        ),
      ],
      [
        "x = 2",
        t(
          r`Check: 2/12 = 1/6 but 8/18 = 4/9, not double. $x = 3$.`,
          r`जाँचो: 2/12 = 1/6 पर 8/18 = 4/9, दुगुना नहीं। $x = 3$।`,
        ),
      ],
    ],
  ),
  q5: numItem(
    t(
      r`Exercise 15.2 Q5*. A jar has 24 marbles, green and blue. $P(\text{green}) = \frac{2}{3}$. How many are blue?`,
      r`प्रश्नावली 15.2 प्रश्न 5*. एक जार में 24 कंचे हैं, हरे और नीले। $P(\text{हरा}) = \frac{2}{3}$। कितने नीले हैं?`,
    ),
    "8",
    [
      [
        "16",
        t("16 is green (2/3 of 24). Blue: 24 − 16 = 8.", "16 हरे हैं (24 का 2/3)। नीले: 24 − 16 = 8।"),
      ],
      [
        "12",
        t("Green is 2/3, not 1/2: blue is 1/3 of 24 = 8.", "हरे 2/3 हैं, 1/2 नहीं: नीले 24 का 1/3 = 8।"),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Exercise 15.2 (optional): ordered pairs of days, a strange die, and finding an unknown count. */
export const unknownCounts = bankFamily(items, {
  level: Level.Hard,
  tests: [Concept.BeyondCounting],
});
