import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const r = String.raw;

/** Examples 6–8 and Exercise 8.2 Q3–Q4: find angles and sides from the table. */
const items = {
  q3: numItem(
    t(
      r`Exercise 8.2 Q3: $\tan(A+B) = \sqrt3$ and $\tan(A-B) = \tfrac{1}{\sqrt3}$, with A > B. Find A.`,
      r`प्रश्नावली 8.2 प्र3: $\tan(A+B) = \sqrt3$ और $\tan(A-B) = \tfrac{1}{\sqrt3}$, जहाँ A > B। A निकालो।`,
    ),
    r`$45^\circ$`,
    [
      [
        r`$60^\circ$`,
        t(
          "A + B = 60° and A − B = 30°. Adding: 2A = 90°, so A = 45°.",
          "A + B = 60° और A − B = 30°। जोड़ने पर: 2A = 90°, तो A = 45°।",
        ),
      ],
      [
        r`$15^\circ$`,
        t(
          "15° is B. A is the larger one: (60° + 30°) ÷ 2 = 45°.",
          "15°, B है। A बड़ा वाला है: (60° + 30°) ÷ 2 = 45°।",
        ),
      ],
    ],
  ),
  ex6bc: numItem(
    t(
      "Example 6: ∆ ABC is right-angled at B, AB = 5 cm and ∠ACB = 30°. How long is BC?",
      "उदाहरण 6: ∆ ABC, B पर समकोण है, AB = 5 cm और ∠ACB = 30°। BC कितना लंबा है?",
    ),
    r`$5\sqrt3$ cm`,
    [
      [
        "10 cm",
        t(
          "10 cm is AC, the hypotenuse. BC is adjacent to C: tan 30° = AB/BC gives BC = 5√3.",
          "10 cm, AC है, कर्ण। BC, C के संलग्न है: tan 30° = AB/BC से BC = 5√3।",
        ),
      ],
      [
        r`$\dfrac{5}{\sqrt3}$ cm`,
        t(
          "AB/BC = 1/√3 means BC = 5 × √3, not 5 ÷ √3.",
          "AB/BC = 1/√3 का अर्थ BC = 5 × √3, 5 ÷ √3 नहीं।",
        ),
      ],
    ],
  ),
  sin60: numItem(
    t(
      r`$\sin A = \dfrac{\sqrt3}{2}$ for an acute angle A. What is A?`,
      r`न्यून कोण A के लिए $\sin A = \tfrac{\sqrt3}{2}$। A क्या है?`,
    ),
    r`$60^\circ$`,
    [
      [
        r`$30^\circ$`,
        t(
          "cos 30° = √3/2, but sin 30° = 1/2. sin reaches √3/2 at 60°.",
          "cos 30° = √3/2, पर sin 30° = 1/2। sin 60° पर √3/2 होता है।",
        ),
      ],
      [
        r`$45^\circ$`,
        t("sin 45° = 1/√2 ≈ 0.71, while √3/2 ≈ 0.87.", "sin 45° = 1/√2 ≈ 0.71, जबकि √3/2 ≈ 0.87।"),
      ],
    ],
  ),
  ex7: numItem(
    t(
      "Example 7: ∆ PQR is right-angled at Q, PQ = 3 cm and PR = 6 cm. What is ∠PRQ?",
      "उदाहरण 7: ∆ PQR, Q पर समकोण है, PQ = 3 cm और PR = 6 cm। ∠PRQ क्या है?",
    ),
    r`$30^\circ$`,
    [
      [
        r`$60^\circ$`,
        t(
          "60° is ∠QPR. ∠PRQ = 90° − 60° = 30°, or sin R = PQ/PR = 1/2.",
          "60°, ∠QPR है। ∠PRQ = 90° − 60° = 30°, या sin R = PQ/PR = 1/2।",
        ),
      ],
      [
        r`$45^\circ$`,
        t(
          "The two shorter sides aren't equal (QR = 3√3), so it isn't 45°.",
          "दोनों छोटी भुजाएँ बराबर नहीं (QR = 3√3), इसलिए यह 45° नहीं है।",
        ),
      ],
    ],
  ),
  q4: {
    prompt: t(
      "Exercise 8.2 Q4 (v): sin θ = cos θ for all values of θ. True or false?",
      "प्रश्नावली 8.2 प्र4 (v): θ के सभी मानों के लिए sin θ = cos θ। सत्य या असत्य?",
    ),
    right: t("False: only at θ = 45°", "असत्य: केवल θ = 45° पर"),
    wrong: [
      {
        label: t("True: their rows hold the same numbers", "सत्य: उनकी पंक्तियों में वही संख्याएँ हैं"),
        why: t(
          "Same numbers, but in reverse order: sin 30° = 1/2 while cos 30° = √3/2.",
          "वही संख्याएँ, पर उलटे क्रम में: sin 30° = 1/2 जबकि cos 30° = √3/2।",
        ),
      },
      {
        label: t("False: they are never equal", "असत्य: वे कभी बराबर नहीं होते"),
        why: t(
          "At 45° the two shorter sides are equal, so sin 45° = cos 45° = 1/√2.",
          "45° पर दोनों छोटी भुजाएँ बराबर होती हैं, इसलिए sin 45° = cos 45° = 1/√2।",
        ),
      },
    ],
  },
} satisfies Record<string, Item>;

/** Find angles or sides with the special values. */
export const findTheAngle = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.RatiosOfSpecificAngles],
});
