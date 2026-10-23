import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type StepsItem, stepsFamily } from "../../kit";

/** Construction 11.3 and its relatives: put the steps in order. */
const items = {
  fromPoint: {
    prompt: t(
      "Put the steps for the tangents from an outside point P in order (Construction 11.3).",
      "बाहर के बिंदु P से स्पर्श रेखाओं के चरण क्रम में लगाओ (रचना 11.3)।",
    ),
    steps: [
      { id: "join", label: t("Join P to the centre O.", "P को केंद्र O से मिलाओ।") },
      {
        id: "bisect",
        label: t("Bisect PO; call its midpoint M.", "PO को समद्विभाजित करो; मध्य-बिंदु M कहो।"),
        hint: t(
          "You can only bisect PO once it is drawn.",
          "PO खींचने के बाद ही उसे समद्विभाजित कर सकते हो।",
        ),
      },
      {
        id: "circle",
        label: t(
          "With centre M and radius MO, draw a circle cutting the given one at Q and R.",
          "केंद्र M और त्रिज्या MO से वृत्त खींचो, जो दिए गए वृत्त को Q और R पर काटे।",
        ),
        hint: t("The circle's centre is M, so find M first.", "वृत्त का केंद्र M है, तो पहले M ढूँढो।"),
      },
      {
        id: "tangents",
        label: t("Join PQ and PR.", "PQ और PR मिलाओ।"),
        hint: t("Q and R come from the circle on PO.", "Q और R, PO वाले वृत्त से मिलते हैं।"),
      },
    ],
  },
  noCentre: {
    prompt: t(
      "The centre of the circle isn't given (Exercise 11.2 Q7, a bangle). Put the steps in order.",
      "वृत्त का केंद्र नहीं दिया (प्रश्नावली 11.2 प्र.7, चूड़ी)। चरण क्रम में लगाओ।",
    ),
    steps: [
      {
        id: "chords",
        label: t("Draw two chords that aren't parallel.", "दो जीवाएँ खींचो जो समांतर न हों।"),
      },
      {
        id: "bisectors",
        label: t(
          "Draw their perpendicular bisectors; they meet at the centre O.",
          "उनके लंब समद्विभाजक खींचो; वे केंद्र O पर मिलते हैं।",
        ),
        hint: t(
          "You need the chords before you can bisect them.",
          "समद्विभाजित करने से पहले जीवाएँ चाहिए।",
        ),
      },
      {
        id: "mid",
        label: t(
          "Join P to O and find the midpoint M of PO.",
          "P को O से मिलाओ और PO का मध्य-बिंदु M ढूँढो।",
        ),
        hint: t("O comes from the bisectors.", "O समद्विभाजकों से मिलता है।"),
      },
      {
        id: "finish",
        label: t(
          "Draw the circle on PO as diameter and join P to where it meets the bangle's circle.",
          "PO को व्यास मानकर वृत्त खींचो और P को वहाँ से मिलाओ जहाँ यह चूड़ी के वृत्त से मिले।",
        ),
        hint: t("That circle needs M as its centre.", "उस वृत्त का केंद्र M होना चाहिए।"),
      },
    ],
  },
  atAngle: {
    prompt: t(
      "Exercise 11.2 Q4: tangents inclined at 60° to a circle of radius 5 cm. Put the steps in order.",
      "प्रश्नावली 11.2 प्र.4: 5 cm त्रिज्या के वृत्त पर 60° पर झुकी स्पर्श रेखाएँ। चरण क्रम में लगाओ।",
    ),
    steps: [
      {
        id: "circle",
        label: t("Draw a circle of radius 5 cm, centre O.", "केंद्र O, त्रिज्या 5 cm का वृत्त खींचो।"),
      },
      {
        id: "radii",
        label: t("Draw radii OA and OB with ∠AOB = 120°.", "त्रिज्याएँ OA और OB खींचो, ∠AOB = 120°।"),
        hint: t(
          "The radii are drawn in the circle, so draw it first.",
          "त्रिज्याएँ वृत्त में खींचते हैं, तो पहले वृत्त।",
        ),
      },
      {
        id: "perps",
        label: t(
          "At A and B draw lines perpendicular to OA and OB.",
          "A और B पर OA और OB पर लंब रेखाएँ खींचो।",
        ),
        hint: t("A and B are the ends of the radii.", "A और B त्रिज्याओं के सिरे हैं।"),
      },
      {
        id: "meet",
        label: t("They meet at P, at an angle of 60°.", "वे P पर 60° के कोण पर मिलती हैं।"),
        hint: t("P is where the two perpendiculars cross.", "P वहाँ है जहाँ दोनों लंब रेखाएँ कटती हैं।"),
      },
    ],
  },
} satisfies Record<string, StepsItem>;

/** Order the steps of constructing tangents. */
export const tangentSteps = stepsFamily(items, {
  level: Level.Medium,
  tests: [Concept.TangentsByConstruction],
});
