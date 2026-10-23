import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** Lengths, angles and reasons for the tangent constructions (Exercise 11.2). */
const items = {
  q1: numItem(
    t(
      "Exercise 11.2 Q1: radius 6 cm, P is 10 cm from the centre. How long is each tangent?",
      "प्रश्नावली 11.2 प्र.1: त्रिज्या 6 cm, P केंद्र से 10 cm दूर। हर स्पर्श रेखा कितनी लंबी है?",
    ),
    "8 cm",
    [
      [
        "4 cm",
        t(
          "10 − 6 is along PO. The tangent is a leg of a right triangle: √(10² − 6²).",
          "10 − 6, PO के साथ है। स्पर्श रेखा समकोण त्रिभुज की एक भुजा है: √(10² − 6²)।",
        ),
      ],
      [
        "16 cm",
        t(
          "That's 10 + 6. Use the right angle at the point of contact.",
          "वह 10 + 6 है। स्पर्श बिंदु पर का समकोण लो।",
        ),
      ],
    ],
  ),
  q2: numItem(
    t(
      "Exercise 11.2 Q2: a tangent to a circle of radius 4 cm from a point 6 cm from the centre. Its length is?",
      "प्रश्नावली 11.2 प्र.2: 4 cm त्रिज्या के वृत्त पर, केंद्र से 6 cm दूर के बिंदु से स्पर्श रेखा। उसकी लंबाई?",
    ),
    "2√5 cm",
    [
      [
        "2√13 cm",
        t(
          "That's √(6² + 4²). The 6 cm is the hypotenuse, so subtract the squares.",
          "वह √(6² + 4²) है। 6 cm कर्ण है, तो वर्ग घटाओ।",
        ),
      ],
      [
        "2 cm",
        t(
          "6 − 4 is the gap between the circles, not the tangent.",
          "6 − 4 वृत्तों के बीच की दूरी है, स्पर्श रेखा नहीं।",
        ),
      ],
    ],
  ),
  q4: numItem(
    t(
      "Exercise 11.2 Q4: tangents at A and B meet at P at 60°. What is ∠AOB?",
      "प्रश्नावली 11.2 प्र.4: A और B पर स्पर्श रेखाएँ P पर 60° पर मिलती हैं। ∠AOB क्या है?",
    ),
    "120°",
    [
      [
        "60°",
        t(
          "In OAPB the angles at A and B are 90°, so ∠AOB = 360 − 90 − 90 − 60.",
          "OAPB में A और B के कोण 90° हैं, तो ∠AOB = 360 − 90 − 90 − 60।",
        ),
      ],
      [
        "30°",
        t(
          "30° is half of 60°, but the quadrilateral's angles add to 360°: 120°.",
          "30°, 60° का आधा है, पर चतुर्भुज के कोणों का योग 360° है: 120°।",
        ),
      ],
    ],
  ),
  q5: numItem(
    t(
      "Exercise 11.2 Q5: AB = 8 cm; the circle at A has radius 4 cm. How long is the tangent to it from B?",
      "प्रश्नावली 11.2 प्र.5: AB = 8 cm; A वाले वृत्त की त्रिज्या 4 cm। B से उस पर स्पर्श रेखा कितनी लंबी है?",
    ),
    "4√3 cm",
    [
      [
        "√55 cm",
        t(
          "√(8² − 3²) uses the other circle's radius. The circle at A has radius 4.",
          "√(8² − 3²) दूसरे वृत्त की त्रिज्या लेता है। A वाले वृत्त की त्रिज्या 4 है।",
        ),
      ],
      ["4 cm", t("That's 8 − 4. Use √(8² − 4²) = √48.", "वह 8 − 4 है। √(8² − 4²) = √48 लो।")],
    ],
  ),
  why: {
    prompt: t("In Construction 11.3, why is ∠PQO = 90°?", "रचना 11.3 में ∠PQO = 90° क्यों है?"),
    right: t("It's an angle in a semicircle on PO", "यह PO पर अर्धवृत्त में बना कोण है"),
    wrong: [
      {
        label: t("PQ and OQ were drawn at 90° with a set square", "PQ और OQ गुनिया से 90° पर खींचे गए"),
        why: t(
          "Nothing is drawn at a measured angle. The circle on PO as diameter guarantees 90° at Q.",
          "कोई कोण नापकर नहीं खींचा जाता। PO को व्यास मानकर बना वृत्त Q पर 90° पक्का करता है।",
        ),
      },
      {
        label: t("Tangents from P are equal in length", "P से स्पर्श रेखाएँ बराबर लंबाई की हैं"),
        why: t(
          "That's true but it's about lengths. The right angle comes from the semicircle.",
          "यह सच है पर लंबाई के बारे में है। समकोण अर्धवृत्त से आता है।",
        ),
      },
    ],
  },
  inside: {
    prompt: t(
      "How many tangents can be drawn to a circle from a point inside it?",
      "वृत्त के अंदर के बिंदु से उस पर कितनी स्पर्श रेखाएँ खींची जा सकती हैं?",
    ),
    right: t("None", "एक भी नहीं"),
    wrong: [
      {
        label: t("One", "एक"),
        why: t(
          "Every line through an inside point cuts the circle twice. One tangent is for a point on the circle.",
          "अंदर के बिंदु से हर रेखा वृत्त को दो बार काटती है। एक स्पर्श रेखा वृत्त पर के बिंदु के लिए है।",
        ),
      },
      {
        label: t("Two", "दो"),
        why: t(
          "Two tangents are for a point outside. From inside, every line is a secant.",
          "दो स्पर्श रेखाएँ बाहर के बिंदु के लिए हैं। अंदर से हर रेखा छेदक है।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Lengths, angles and reasons for tangents. */
export const tangentFacts = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.TangentsByConstruction],
});
