import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily } from "../../kit";

const items = {
  inside: {
    prompt: t(
      "P is 2 cm from the centre of a circle of radius 5 cm. How many tangents can be drawn from P?",
      "P, 5 cm त्रिज्या वाले वृत्त के केंद्र से 2 cm दूर है। P से कितनी स्पर्श रेखाएँ खींची जा सकती हैं?",
    ),
    right: t("None", "एक भी नहीं"),
    wrong: [
      {
        label: t("One", "एक"),
        why: t(
          "P is inside the circle (2 < 5). Every line through it cuts the circle twice.",
          "P वृत्त के अंदर है (2 < 5)। उससे जाने वाली हर रेखा वृत्त को दो बार काटती है।",
        ),
      },
      {
        label: t("Two", "दो"),
        why: t(
          "Two tangents come only from a point outside. P is inside.",
          "दो स्पर्श रेखाएँ केवल बाहर के बिंदु से आती हैं। P अंदर है।",
        ),
      },
    ],
  },
  on: {
    prompt: t(
      "P is 5 cm from the centre of a circle of radius 5 cm. How many tangents can be drawn from P?",
      "P, 5 cm त्रिज्या वाले वृत्त के केंद्र से 5 cm दूर है। P से कितनी स्पर्श रेखाएँ खींची जा सकती हैं?",
    ),
    right: t("Exactly one", "ठीक एक"),
    wrong: [
      {
        label: t("Exactly two", "ठीक दो"),
        why: t(
          "P is on the circle (distance = radius). There's one tangent at a point on the circle.",
          "P वृत्त पर है (दूरी = त्रिज्या)। वृत्त के बिंदु पर एक स्पर्श रेखा होती है।",
        ),
      },
      {
        label: t("None at all", "एक भी नहीं"),
        why: t(
          "Only a point inside has none. P is on the circle.",
          "केवल अंदर के बिंदु से कोई नहीं होती। P वृत्त पर है।",
        ),
      },
    ],
  },
  outside: {
    prompt: t(
      "P is 9 cm from the centre of a circle of radius 5 cm. How many tangents can be drawn from P?",
      "P, 5 cm त्रिज्या वाले वृत्त के केंद्र से 9 cm दूर है। P से कितनी स्पर्श रेखाएँ खींची जा सकती हैं?",
    ),
    right: t("Exactly two", "ठीक दो"),
    wrong: [
      {
        label: t("Exactly one", "ठीक एक"),
        why: t(
          "One is for a point on the circle. From outside there are two.",
          "एक, वृत्त पर के बिंदु के लिए है। बाहर से दो होती हैं।",
        ),
      },
      {
        label: t("Infinitely many", "अनगिनत"),
        why: t(
          "Of all the lines through P, only two just touch the circle.",
          "P से जाने वाली सारी रेखाओं में से केवल दो वृत्त को बस छूती हैं।",
        ),
      },
    ],
  },
  length: {
    prompt: t(
      "What is the 'length of the tangent' from an outside point P?",
      "बाहर के बिंदु P से 'स्पर्श रेखा की लंबाई' क्या है?",
    ),
    right: t("The distance from P to the point of contact", "P से स्पर्श बिंदु तक की दूरी"),
    wrong: [
      {
        label: t("The distance from P to the circle's centre", "P से वृत्त के केंद्र तक की दूरी"),
        why: t(
          "That's OP, the hypotenuse. The tangent's length ends at the point of contact.",
          "वह OP है, कर्ण। स्पर्श रेखा की लंबाई स्पर्श बिंदु पर ख़त्म होती है।",
        ),
      },
      {
        label: t("The distance between the two points of contact", "दोनों स्पर्श बिंदुओं के बीच की दूरी"),
        why: t(
          "That's the chord joining the points of contact. The tangent runs from P to one of them.",
          "वह स्पर्श बिंदुओं को जोड़ने वाली जीवा है। स्पर्श रेखा P से उनमें से एक तक जाती है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Inside, on, outside: how many tangents; the length of a tangent (Activity 3). */
export const tangentsFromAPoint = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.TangentsFromAPoint],
});
