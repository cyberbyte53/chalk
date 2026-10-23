import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const products = t(
  "Crossing chords multiply: AP · PB = CP · DP.",
  "काटती जीवाएँ गुणा होती हैं: AP · PB = CP · DP।",
);

/** Exercise 6.6 Q1 and Q7: the angle bisector and crossing chords. */
const items = {
  bisector: numItem(
    t(
      "In ∆ PQR, PQ = 6 cm, PR = 9 cm and QR = 10 cm. The bisector of ∠P meets QR at S. Find QS.",
      "∆ PQR में PQ = 6 cm, PR = 9 cm और QR = 10 cm। ∠P का समद्विभाजक QR से S पर मिलता है। QS ज्ञात करो।",
    ),
    "4 cm",
    [
      [
        "5 cm",
        t(
          "The bisector halves the angle, not the side. QS : SR = PQ : PR = 2 : 3.",
          "समद्विभाजक कोण को आधा करता है, भुजा को नहीं। QS : SR = PQ : PR = 2 : 3।",
        ),
      ],
      [
        "6 cm",
        t(
          "That's SR. Q is next to the shorter side PQ, so QS is the smaller part: 10 × 2/5.",
          "यह SR है। Q छोटी भुजा PQ के पास है, तो QS छोटा भाग है: 10 × 2/5।",
        ),
      ],
    ],
  ),
  chords: numItem(
    t(
      "Chords AB and CD of a circle cross at P. AP = 5 cm, PB = 8 cm and CP = 4 cm. Find DP.",
      "एक वृत्त की जीवाएँ AB और CD, P पर काटती हैं। AP = 5 cm, PB = 8 cm और CP = 4 cm। DP ज्ञात करो।",
    ),
    "10 cm",
    [
      ["9 cm", products],
      [
        "6.4 cm",
        t(
          "That sets AP/PB = CP/DP. The similar triangles give AP/DP = CP/PB.",
          "इसमें AP/PB = CP/DP लिया गया। समरूप त्रिभुज AP/DP = CP/PB देते हैं।",
        ),
      ],
    ],
  ),
  halves: numItem(
    t(
      "Chords AB and CD cross at P, with AP = PB = 6 cm and CP = 4 cm. Find DP.",
      "जीवाएँ AB और CD, P पर काटती हैं, जिसमें AP = PB = 6 cm और CP = 4 cm। DP ज्ञात करो।",
    ),
    "9 cm",
    [
      ["8 cm", products],
      [
        "6 cm",
        t(
          "DP needn't equal AP. 6 × 6 = 4 × DP, so DP = 36 ÷ 4.",
          "DP का AP के बराबर होना ज़रूरी नहीं। 6 × 6 = 4 × DP, तो DP = 36 ÷ 4।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** The angle bisector theorem and crossing chords. */
export const bisectorAndChords = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.ChallengeAndFinale],
});
