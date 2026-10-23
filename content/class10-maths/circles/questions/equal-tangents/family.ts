import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const lengths = t(
  "Subtract the squares, not the lengths: the distance to the centre is the hypotenuse.",
  "लंबाइयाँ नहीं, वर्ग घटाओ: केंद्र तक की दूरी कर्ण है।",
);
const added = t(
  "You added the squares. The distance to the centre is the hypotenuse, so subtract.",
  "तुमने वर्ग जोड़ दिए। केंद्र तक की दूरी कर्ण है, इसलिए घटाओ।",
);

const items = {
  q1: numItem(
    t(
      "Exercise 10.2 Q1: the tangent from Q is 24 cm and Q is 25 cm from the centre. Find the radius.",
      "प्रश्नावली 10.2 प्र1: Q से स्पर्श रेखा 24 cm है और Q केंद्र से 25 cm दूर है। त्रिज्या ज्ञात करो।",
    ),
    "7 cm",
    [
      ["1 cm", lengths],
      [
        "12 cm",
        t("That's half of 24. Use r² = 25² − 24² = 49.", "यह 24 का आधा है। r² = 25² − 24² = 49 लो।"),
      ],
      [
        "24.5 cm",
        t(
          "That's the average. Use the right angle at the point of contact.",
          "यह औसत है। स्पर्श बिंदु पर समकोण का उपयोग करो।",
        ),
      ],
    ],
  ),
  q6: numItem(
    t(
      "Exercise 10.2 Q6: A is 5 cm from the centre and the tangent from A is 4 cm. Find the radius.",
      "प्रश्नावली 10.2 प्र6: A केंद्र से 5 cm दूर है और A से स्पर्श रेखा 4 cm है। त्रिज्या ज्ञात करो।",
    ),
    "3 cm",
    [
      ["1 cm", lengths],
      ["√41 cm", added],
    ],
  ),
  other: numItem(
    t(
      "From P, the tangents PQ and PR touch a circle at Q and R. PQ = 9 cm. Find PR.",
      "P से स्पर्श रेखाएँ PQ और PR वृत्त को Q और R पर छूती हैं। PQ = 9 cm। PR ज्ञात करो।",
    ),
    "9 cm",
    [
      [
        "18 cm",
        t(
          "Theorem 10.2: tangents from one outside point are equal, not doubled.",
          "प्रमेय 10.2: एक बाहरी बिंदु से स्पर्श रेखाएँ बराबर होती हैं, दोगुनी नहीं।",
        ),
      ],
      [
        "4.5 cm",
        t(
          "They aren't halves: each tangent is a full 9 cm.",
          "ये आधे नहीं हैं: हर स्पर्श रेखा पूरी 9 cm है।",
        ),
      ],
    ],
  ),
  op: numItem(
    t(
      "The tangents from P are 8 cm long and the radius is 6 cm. How far is P from the centre?",
      "P से स्पर्श रेखाएँ 8 cm लंबी हैं और त्रिज्या 6 cm है। P केंद्र से कितनी दूर है?",
    ),
    "10 cm",
    [
      [
        "√28 cm",
        t(
          "Here OP is the hypotenuse we want: add the squares, 8² + 6² = 100.",
          "यहाँ OP वह कर्ण है जो चाहिए: वर्ग जोड़ो, 8² + 6² = 100।",
        ),
      ],
      ["14 cm", t("That's 8 + 6. Use squares: √(64 + 36).", "यह 8 + 6 है। वर्ग लो: √(64 + 36)।")],
    ],
  ),
} satisfies Record<string, Item>;

/** Theorem 10.2 and the right triangle OQP: equal tangents, radius, distance (Ex 10.2 Q1, Q6). */
export const equalTangents = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.TangentsFromAPoint],
});
