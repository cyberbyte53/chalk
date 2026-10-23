import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, frac, numItem } from "../../kit";

const draw = (q: string, what: { en: string; hi: string }) =>
  t(
    `Exercise 15.1 Q14 (${q}). One card is drawn from a well-shuffled pack of 52. What is P(${what.en})?`,
    `प्रश्नावली 15.1 प्रश्न 14 (${q}). अच्छी तरह फेंटी गई 52 पत्तों की गड्डी से एक पत्ता निकाला जाता है। P(${what.hi}) क्या है?`,
  );
const faces = t(
  "Face cards are the jack, queen and king: 3 in each of 4 suits.",
  "फेस कार्ड गुलाम, बेगम और बादशाह हैं: 4 रंगों में हर एक में 3।",
);

/** Example 4, Exercise 15.1 Q14 and Q15: drawing cards. */
const items = {
  ex4: numItem(
    t(
      "Example 4. One card is drawn from a well-shuffled pack of 52. What is P(it is **not** an ace)?",
      "उदाहरण 4. अच्छी तरह फेंटी गई 52 पत्तों की गड्डी से एक पत्ता निकाला जाता है। P(वह इक्का **नहीं** है) क्या है?",
    ),
    frac(12, 13),
    [
      [
        frac(1, 13),
        t(
          "1/13 is P(ace). Not an ace: 1 − 1/13 = 12/13.",
          "1/13, P(इक्का) है। इक्का नहीं: 1 − 1/13 = 12/13।",
        ),
      ],
      [
        frac(3, 4),
        t(
          "There are 4 aces, not 4 suits to leave out: 48 of 52.",
          "4 इक्के हैं, 4 रंग नहीं छोड़ने: 52 में 48।",
        ),
      ],
    ],
  ),
  q14i: numItem(draw("i", { en: "a red king", hi: "लाल बादशाह" }), frac(1, 26), [
    [
      frac(1, 13),
      t(
        "1/13 is any king. Only 2 of the 4 kings are red: 2/52.",
        "1/13 कोई भी बादशाह है। 4 में केवल 2 लाल: 2/52।",
      ),
    ],
    [
      frac(1, 2),
      t(
        "1/2 is any red card. Red kings: hearts and diamonds, 2/52.",
        "1/2 कोई भी लाल पत्ता है। लाल बादशाह: पान और ईंट, 2/52।",
      ),
    ],
  ]),
  q14ii: numItem(draw("ii", { en: "a face card", hi: "फेस कार्ड" }), frac(3, 13), [
    [
      frac(4, 13),
      t(
        "The ace isn't a face card. J, Q, K × 4 = 12 of 52.",
        "इक्का फेस कार्ड नहीं। J, Q, K × 4 = 52 में 12।",
      ),
    ],
    [frac(3, 52), faces],
  ]),
  q14iii: numItem(draw("iii", { en: "a red face card", hi: "लाल फेस कार्ड" }), frac(3, 26), [
    [
      frac(3, 13),
      t(
        "3/13 is any face card. Red: half of the 12, so 6/52.",
        "3/13 कोई भी फेस कार्ड है। लाल: 12 का आधा, तो 6/52।",
      ),
    ],
    [frac(3, 52), t("Red is 2 suits: J, Q, K × 2 = 6 of 52.", "लाल 2 रंग हैं: J, Q, K × 2 = 52 में 6।")],
  ]),
  q14iv: numItem(draw("iv", { en: "the jack of hearts", hi: "पान का गुलाम" }), frac(1, 52), [
    [
      frac(1, 13),
      t(
        "1/13 is any jack. There's just one jack of hearts.",
        "1/13 कोई भी गुलाम है। पान का गुलाम केवल एक है।",
      ),
    ],
    [
      frac(1, 4),
      t(
        "1/4 is any heart. The jack of hearts is 1 card of 52.",
        "1/4 कोई भी पान है। पान का गुलाम 52 में 1 पत्ता है।",
      ),
    ],
  ]),
  q14v: numItem(draw("v", { en: "a spade", hi: "हुकुम" }), frac(1, 4), [
    [frac(1, 13), t("Each suit has 13 cards: 13 of 52 = 1/4.", "हर रंग में 13 पत्ते: 52 में 13 = 1/4।")],
    [
      frac(1, 2),
      t(
        "Spades are one suit of four, not one colour of two.",
        "हुकुम चार में से एक रंग है, दो में से एक नहीं।",
      ),
    ],
  ]),
  q14vi: numItem(draw("vi", { en: "the queen of diamonds", hi: "ईंट की बेगम" }), frac(1, 52), [
    [
      frac(1, 13),
      t(
        "1/13 is any queen. Only one is the queen of diamonds.",
        "1/13 कोई भी बेगम है। ईंट की बेगम केवल एक।",
      ),
    ],
    [
      frac(1, 26),
      t(
        "1/26 is a red queen (2 cards). This is 1 card of 52.",
        "1/26 लाल बेगम है (2 पत्ते)। यह 52 में 1 पत्ता है।",
      ),
    ],
  ]),
  q15i: numItem(
    t(
      "Exercise 15.1 Q15 (i). The ten, jack, queen, king and ace of diamonds are shuffled face down. One is picked. What is P(the queen)?",
      "प्रश्नावली 15.1 प्रश्न 15 (i). ईंट के दहला, गुलाम, बेगम, बादशाह और इक्का उलटे फेंटे जाते हैं। एक उठाया जाता है। P(बेगम) क्या है?",
    ),
    frac(1, 5),
    [
      [frac(1, 52), t("Only these 5 cards are in play, not 52.", "खेल में केवल ये 5 पत्ते हैं, 52 नहीं।")],
      [frac(1, 4), t("There are 5 cards: the ten counts too.", "पत्ते 5 हैं: दहला भी गिना जाता है।")],
    ],
  ),
  q15iia: numItem(
    t(
      "Exercise 15.1 Q15 (ii)(a). The queen is drawn and put aside. A second card is picked from the rest. What is P(an ace)?",
      "प्रश्नावली 15.1 प्रश्न 15 (ii)(a). बेगम निकालकर अलग रख दी जाती है। बाक़ी में से दूसरा पत्ता उठाया जाता है। P(इक्का) क्या है?",
    ),
    frac(1, 4),
    [
      [
        frac(1, 5),
        t("The queen is gone: 4 cards are left, one an ace.", "बेगम जा चुकी: 4 पत्ते बचे, एक इक्का।"),
      ],
      [
        frac(1, 3),
        t("Only the queen was removed: 4 cards remain.", "केवल बेगम हटाई गई: 4 पत्ते बचे हैं।"),
      ],
    ],
  ),
  q15iib: numItem(
    t(
      "Exercise 15.1 Q15 (ii)(b). With the queen put aside, a card is picked from the other 4. What is P(a queen)?",
      "प्रश्नावली 15.1 प्रश्न 15 (ii)(b). बेगम अलग रखकर बाक़ी 4 में से एक पत्ता उठाया जाता है। P(बेगम) क्या है?",
    ),
    "0",
    [
      [
        frac(1, 4),
        t("The only queen was put aside: impossible, 0.", "इकलौती बेगम अलग रख दी गई: असंभव, 0।"),
      ],
      [frac(1, 5), t("No queen is left among the 4: P = 0.", "4 में कोई बेगम नहीं बची: P = 0।")],
    ],
  ),
} satisfies Record<string, Item>;

/** Find probabilities when one card is drawn from a pack. */
export const cardDraws = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.CardsBagsAndChoosing],
});
