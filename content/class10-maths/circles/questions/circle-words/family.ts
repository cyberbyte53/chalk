import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const items = {
  diameter: {
    prompt: t(
      "A chord passes through the centre of a circle of radius 7 cm. How long is it?",
      "एक जीवा 7 cm त्रिज्या वाले वृत्त के केंद्र से होकर जाती है। वह कितनी लंबी है?",
    ),
    right: t("14 cm", "14 cm"),
    wrong: [
      {
        label: t("7 cm", "7 cm"),
        why: t(
          "A chord through the centre is a diameter, twice the radius.",
          "केंद्र से जाने वाली जीवा व्यास है, त्रिज्या की दोगुनी।",
        ),
      },
      {
        label: t("3.5 cm", "3.5 cm"),
        why: t("That's half the radius. A diameter is 2 × 7.", "यह त्रिज्या का आधा है। व्यास 2 × 7 है।"),
      },
    ],
  },
  bisect: numItem(
    t(
      "The perpendicular from the centre O meets a chord AB of length 10 cm at M. Find AM.",
      "केंद्र O से लंब, 10 cm लंबी जीवा AB से M पर मिलता है। AM ज्ञात करो।",
    ),
    "5 cm",
    [
      [
        "10 cm",
        t(
          "The perpendicular from the centre bisects the chord, so AM is half of AB.",
          "केंद्र से लंब जीवा को समद्विभाजित करता है, इसलिए AM, AB का आधा है।",
        ),
      ],
      [
        "2.5 cm",
        t(
          "That's a quarter of AB. The chord is cut in half: 10 ÷ 2.",
          "यह AB का चौथाई है। जीवा आधी कटती है: 10 ÷ 2।",
        ),
      ],
    ],
  ),
  circle: {
    prompt: t("What is a circle?", "वृत्त क्या है?"),
    right: t(
      "All points in a plane at a fixed distance from a fixed point",
      "तल के वे सभी बिंदु जो एक स्थिर बिंदु से स्थिर दूरी पर हों",
    ),
    wrong: [
      {
        label: t(
          "All points in a plane inside a fixed distance from a point",
          "तल के वे सभी बिंदु जो एक बिंदु से स्थिर दूरी के अंदर हों",
        ),
        why: t(
          "That fills in the whole disc. The circle is only the boundary, at exactly the radius.",
          "इससे पूरी चकती भर जाती है। वृत्त केवल किनारा है, ठीक त्रिज्या की दूरी पर।",
        ),
      },
      {
        label: t(
          "All points in a plane on a curve with no corners at all",
          "तल के वे सभी बिंदु जो बिना कोनों वाले किसी वक्र पर हों",
        ),
        why: t(
          "An oval has no corners either. A circle needs every point at the same distance from the centre.",
          "अंडाकार के भी कोने नहीं होते। वृत्त में हर बिंदु केंद्र से बराबर दूरी पर होना चाहिए।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Class 9 circle words this chapter leans on: circle, chord, diameter, the bisecting perpendicular. */
export const circleWords = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.LinesAndCircles],
});
