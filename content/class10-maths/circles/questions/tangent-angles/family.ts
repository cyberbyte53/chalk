import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const items = {
  q2: numItem(
    t(
      "Exercise 10.2 Q2: TP and TQ are tangents to a circle with centre O, and ∠POQ = 110°. Find ∠PTQ.",
      "प्रश्नावली 10.2 प्र2: TP और TQ केंद्र O वाले वृत्त की स्पर्श रेखाएँ हैं, और ∠POQ = 110°। ∠PTQ ज्ञात करो।",
    ),
    "70°",
    [
      [
        "110°",
        t(
          "The two angles are supplementary, not equal: 180° − 110°.",
          "दोनों कोण संपूरक हैं, बराबर नहीं: 180° − 110°।",
        ),
      ],
      [
        "55°",
        t(
          "That's half of 110°. In OPTQ, ∠P + ∠Q = 180°, so ∠T = 180° − 110°.",
          "यह 110° का आधा है। OPTQ में ∠P + ∠Q = 180°, इसलिए ∠T = 180° − 110°।",
        ),
      ],
      [
        "250°",
        t(
          "That's the reflex angle at O. Use 360° − 90° − 90° − 110°.",
          "वह O पर प्रतिवर्ती कोण है। 360° − 90° − 90° − 110° लो।",
        ),
      ],
    ],
  ),
  q3: numItem(
    t(
      "Exercise 10.2 Q3: the tangents PA and PB from P are inclined at 80°. Find ∠POA.",
      "प्रश्नावली 10.2 प्र3: P से स्पर्श रेखाएँ PA और PB 80° पर झुकी हैं। ∠POA ज्ञात करो।",
    ),
    "50°",
    [
      [
        "100°",
        t(
          "That's ∠AOB. OP bisects it, so ∠POA is half of 100°.",
          "वह ∠AOB है। OP उसे समद्विभाजित करती है, इसलिए ∠POA, 100° का आधा है।",
        ),
      ],
      [
        "40°",
        t(
          "That's ∠OPA. In triangle OAP, ∠POA = 90° − 40°.",
          "वह ∠OPA है। त्रिभुज OAP में ∠POA = 90° − 40°।",
        ),
      ],
      ["80°", t("80° is the angle at P, not at O.", "80° P पर का कोण है, O पर का नहीं।")],
    ],
  ),
  example2: numItem(
    t(
      "TP and TQ are tangents from T to a circle with centre O, and ∠PTQ = 50°. Find ∠OPQ.",
      "TP और TQ, T से केंद्र O वाले वृत्त की स्पर्श रेखाएँ हैं, और ∠PTQ = 50°। ∠OPQ ज्ञात करो।",
    ),
    "25°",
    [
      [
        "50°",
        t(
          "Example 2 shows ∠PTQ = 2∠OPQ, so halve 50°.",
          "उदाहरण 2 दिखाता है ∠PTQ = 2∠OPQ, इसलिए 50° का आधा लो।",
        ),
      ],
      [
        "65°",
        t(
          "That's ∠TPQ = (180° − 50°)/2. ∠OPQ = 90° − 65°.",
          "वह ∠TPQ = (180° − 50°)/2 है। ∠OPQ = 90° − 65°।",
        ),
      ],
    ],
  ),
  q9: numItem(
    t(
      "Exercise 10.2 Q9: XY and X′Y′ are parallel tangents, and a third tangent cuts them at A and B. Find ∠AOB.",
      "प्रश्नावली 10.2 प्र9: XY और X′Y′ समांतर स्पर्श रेखाएँ हैं, और एक तीसरी स्पर्श रेखा उन्हें A और B पर काटती है। ∠AOB ज्ञात करो।",
    ),
    "90°",
    [
      [
        "180°",
        t(
          "180° is ∠A + ∠B (co-interior). OA and OB take half of each, so ∠AOB = 180° − 90°.",
          "180°, ∠A + ∠B है (सह-अंतः)। OA और OB हर एक का आधा लेती हैं, इसलिए ∠AOB = 180° − 90°।",
        ),
      ],
      [
        "60°",
        t(
          "Nothing here makes the triangle equilateral. Halve the co-interior angles.",
          "यहाँ कुछ भी त्रिभुज को समबाहु नहीं बनाता। सह-अंतः कोणों को आधा करो।",
        ),
      ],
    ],
  ),
  bisect: {
    prompt: t(
      "PA and PB are tangents from P to a circle with centre O. Which is true?",
      "PA और PB, P से केंद्र O वाले वृत्त की स्पर्श रेखाएँ हैं। क्या सही है?",
    ),
    right: t("OP bisects ∠APB and ∠AOB", "OP, ∠APB और ∠AOB को समद्विभाजित करती है"),
    wrong: [
      {
        label: t("OP bisects ∠APB but not ∠AOB", "OP, ∠APB को समद्विभाजित करती है पर ∠AOB को नहीं"),
        why: t(
          "The congruent triangles OAP and OBP give both pairs of equal angles.",
          "सर्वांगसम त्रिभुज OAP और OBP दोनों जोड़ी बराबर कोण देते हैं।",
        ),
      },
      {
        label: t("OP bisects AB but ∠APB = ∠AOB", "OP, AB को समद्विभाजित करती है पर ∠APB = ∠AOB"),
        why: t(
          "∠APB and ∠AOB add up to 180°. They're equal only when both are 90°.",
          "∠APB और ∠AOB का योग 180° है। वे केवल तब बराबर हैं जब दोनों 90° हों।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Angles made by tangents: Example 2, Exercise 10.2 Q2, Q3, Q9, the bisector. */
export const tangentAngles = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.UsingTangentTheorems],
});
