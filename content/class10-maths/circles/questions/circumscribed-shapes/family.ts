import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const items = {
  q7: numItem(
    t(
      "Exercise 10.2 Q7: two concentric circles have radii 5 cm and 3 cm. Find the chord of the larger circle that touches the smaller one.",
      "प्रश्नावली 10.2 प्र7: दो संकेंद्रीय वृत्तों की त्रिज्याएँ 5 cm और 3 cm हैं। बड़े वृत्त की वह जीवा ज्ञात करो जो छोटे को छूती है।",
    ),
    "8 cm",
    [
      [
        "4 cm",
        t(
          "That's half the chord. The radius to the contact point bisects it, so double 4.",
          "यह जीवा का आधा है। स्पर्श बिंदु तक की त्रिज्या उसे समद्विभाजित करती है, इसलिए 4 को दोगुना करो।",
        ),
      ],
      [
        "2 cm",
        t(
          "That's 5 − 3. Use the right triangle: √(5² − 3²) = 4, then double.",
          "यह 5 − 3 है। समकोण त्रिभुज लो: √(5² − 3²) = 4, फिर दोगुना करो।",
        ),
      ],
      [
        "√34 cm",
        t(
          "You added the squares. The larger radius is the hypotenuse.",
          "तुमने वर्ग जोड़ दिए। बड़ी त्रिज्या कर्ण है।",
        ),
      ],
    ],
  ),
  q8: numItem(
    t(
      "Exercise 10.2 Q8: a quadrilateral ABCD circumscribes a circle. AB = 6 cm, BC = 7 cm, CD = 8 cm. Find AD.",
      "प्रश्नावली 10.2 प्र8: एक चतुर्भुज ABCD एक वृत्त के परिगत है। AB = 6 cm, BC = 7 cm, CD = 8 cm। AD ज्ञात करो।",
    ),
    "7 cm",
    [
      [
        "9 cm",
        t(
          "Opposite sides pair up: AB + CD = AD + BC, so AD = 14 − 7.",
          "सम्मुख भुजाएँ जोड़ी बनाती हैं: AB + CD = AD + BC, इसलिए AD = 14 − 7।",
        ),
      ],
      [
        "8 cm",
        t(
          "Adjacent sides needn't be equal. Use AB + CD = AD + BC.",
          "आसन्न भुजाएँ बराबर होना ज़रूरी नहीं। AB + CD = AD + BC लो।",
        ),
      ],
    ],
  ),
  q11: {
    prompt: t(
      "Exercise 10.2 Q11: a parallelogram circumscribes a circle. What must it be?",
      "प्रश्नावली 10.2 प्र11: एक समांतर चतुर्भुज एक वृत्त के परिगत है। यह क्या होना चाहिए?",
    ),
    right: t("A rhombus", "समचतुर्भुज"),
    wrong: [
      {
        label: t("A rectangle", "आयत"),
        why: t(
          "AB + CD = AD + BC with AB = CD and AD = BC gives AB = AD: all sides equal, not right angles.",
          "AB = CD और AD = BC के साथ AB + CD = AD + BC से AB = AD मिलता है: सभी भुजाएँ बराबर, समकोण नहीं।",
        ),
      },
      {
        label: t("A square", "वर्ग"),
        why: t(
          "A square works, but nothing forces right angles. Equal sides is all we get.",
          "वर्ग चलता है, पर समकोण ज़रूरी नहीं। केवल बराबर भुजाएँ मिलती हैं।",
        ),
      },
    ],
  },
  q12: numItem(
    t(
      "Exercise 10.2 Q12: a circle of radius 4 cm is inscribed in triangle ABC, touching BC at D with BD = 8 cm and DC = 6 cm. Find AB.",
      "प्रश्नावली 10.2 प्र12: 4 cm त्रिज्या वाला वृत्त त्रिभुज ABC के अंतर्गत है, BC को D पर छूता है, BD = 8 cm और DC = 6 cm। AB ज्ञात करो।",
    ),
    "15 cm",
    [
      ["13 cm", t("That's AC = 7 + 6. AB = 7 + 8.", "वह AC = 7 + 6 है। AB = 7 + 8।")],
      [
        "14 cm",
        t(
          "That's BC. Set the tangent from A as x, use area = r × s, and get x = 7.",
          "वह BC है। A से स्पर्श रेखा x लो, क्षेत्रफल = r × s से x = 7 मिलता है।",
        ),
      ],
    ],
  ),
  q13: {
    prompt: t(
      "Exercise 10.2 Q13: a quadrilateral circumscribes a circle with centre O. What do the angles at O made by opposite sides add up to?",
      "प्रश्नावली 10.2 प्र13: एक चतुर्भुज केंद्र O वाले वृत्त के परिगत है। सम्मुख भुजाओं द्वारा O पर बने कोणों का योग कितना है?",
    ),
    right: t("180°", "180°"),
    wrong: [
      {
        label: t("90°", "90°"),
        why: t(
          "The eight angles at O pair into four equal pairs adding to 360°. Each opposite pair takes half: 180°.",
          "O पर के आठ कोण चार बराबर जोड़ियों में बँटते हैं, जिनका योग 360° है। हर सम्मुख जोड़ी आधा लेती है: 180°।",
        ),
      },
      {
        label: t("360°", "360°"),
        why: t(
          "360° is all the angles at O. Opposite sides take exactly half.",
          "360°, O पर के सारे कोण हैं। सम्मुख भुजाएँ ठीक आधा लेती हैं।",
        ),
      },
    ],
  },
  example3: numItem(
    t(
      "Example 3: PQ is an 8 cm chord of a circle of radius 5 cm. The tangents at P and Q meet at T. Find TP.",
      "उदाहरण 3: PQ, 5 cm त्रिज्या वाले वृत्त की 8 cm जीवा है। P और Q पर स्पर्श रेखाएँ T पर मिलती हैं। TP ज्ञात करो।",
    ),
    "20/3 cm",
    [
      [
        "4 cm",
        t(
          "That's PR, half the chord. TP is the hypotenuse of triangle TRP.",
          "वह PR है, जीवा का आधा। TP त्रिभुज TRP का कर्ण है।",
        ),
      ],
      [
        "16/3 cm",
        t("That's TR. TP² = TR² + 4², giving 20/3.", "वह TR है। TP² = TR² + 4², जिससे 20/3 मिलता है।"),
      ],
    ],
  ),
  example1: {
    prompt: t(
      "Example 1: in two concentric circles, a chord of the larger touches the smaller at P. What does P do to the chord?",
      "उदाहरण 1: दो संकेंद्रीय वृत्तों में, बड़े वृत्त की एक जीवा छोटे को P पर छूती है। P जीवा के साथ क्या करता है?",
    ),
    right: t("P is its midpoint", "P उसका मध्य-बिंदु है"),
    wrong: [
      {
        label: t("P is one of its ends", "P उसका एक सिरा है"),
        why: t(
          "The ends are on the larger circle. P is on the smaller one.",
          "सिरे बड़े वृत्त पर हैं। P छोटे वृत्त पर है।",
        ),
      },
      {
        label: t("P divides it 1 : 2", "P उसे 1 : 2 में बाँटता है"),
        why: t(
          "OP ⊥ AB, and the perpendicular from the centre bisects a chord. So 1 : 1.",
          "OP ⊥ AB, और केंद्र से लंब जीवा को समद्विभाजित करता है। इसलिए 1 : 1।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Shapes around circles: Examples 1 and 3, Exercise 10.2 Q7, Q8, Q11, Q12, Q13. */
export const circumscribedShapes = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.UsingTangentTheorems],
});
