import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const r = String.raw;

/** Exercise 8.1 Q1, Q2: find the third side, then the ratios. */
const items = {
  q1sin: numItem(
    t(
      r`Exercise 8.1 Q1: in ∆ ABC right-angled at B, AB = 24 cm and BC = 7 cm. What is $\sin A$?`,
      r`प्रश्नावली 8.1 प्र1: ∆ ABC में, जो B पर समकोण है, AB = 24 cm और BC = 7 cm। $\sin A$ क्या है?`,
    ),
    r`$\dfrac{7}{25}$`,
    [
      [
        r`$\dfrac{7}{24}$`,
        t(
          "That's BC/AB, tan A. Find AC = √(24² + 7²) = 25 and divide by it.",
          "यह BC/AB है, tan A। AC = √(24² + 7²) = 25 निकालो और उससे भाग दो।",
        ),
      ],
      [
        r`$\dfrac{24}{25}$`,
        t(
          "24/25 is AB/AC, cos A. Sine uses BC, the side opposite A.",
          "24/25, AB/AC है, cos A। साइन में BC, A की सम्मुख भुजा, आती है।",
        ),
      ],
    ],
  ),
  q1cosC: numItem(
    t(
      r`Same triangle (AB = 24, BC = 7, ∠B = 90°). What is $\cos C$?`,
      r`वही त्रिभुज (AB = 24, BC = 7, ∠B = 90°)। $\cos C$ क्या है?`,
    ),
    r`$\dfrac{7}{25}$`,
    [
      [
        r`$\dfrac{24}{25}$`,
        t(
          "For angle C the adjacent side is BC = 7, not AB.",
          "कोण C के लिए संलग्न भुजा BC = 7 है, AB नहीं।",
        ),
      ],
      [
        r`$\dfrac{7}{24}$`,
        t("cos divides by the hypotenuse, AC = 25.", "cos कर्ण, AC = 25, से भाग देता है।"),
      ],
    ],
  ),
  q2: numItem(
    t(
      r`Exercise 8.1 Q2: in ∆ PQR right-angled at Q, PQ = 12 cm and PR = 13 cm. What is $\tan P - \cot R$?`,
      r`प्रश्नावली 8.1 प्र2: ∆ PQR में, जो Q पर समकोण है, PQ = 12 cm और PR = 13 cm। $\tan P - \cot R$ क्या है?`,
    ),
    r`$0$`,
    [
      [
        r`$\dfrac{119}{60}$`,
        t(
          "QR = 5. tan P = QR/PQ = 5/12 and cot R = QR/PQ = 5/12 too: they cancel.",
          "QR = 5। tan P = QR/PQ = 5/12 और cot R = QR/PQ = 5/12 भी: दोनों कट जाते हैं।",
        ),
      ],
      [
        r`$\dfrac{5}{12}$`,
        t(
          "cot R is not 0. It equals QR/PQ = 5/12, the same as tan P.",
          "cot R शून्य नहीं। यह QR/PQ = 5/12 है, tan P जितना ही।",
        ),
      ],
    ],
  ),
  q2side: numItem(
    t(
      "In ∆ PQR right-angled at Q, PQ = 12 cm and PR = 13 cm. How long is QR?",
      "∆ PQR में, जो Q पर समकोण है, PQ = 12 cm और PR = 13 cm। QR कितना लंबा है?",
    ),
    "5 cm",
    [
      [
        "17.7 cm",
        t(
          "PR is the hypotenuse, so subtract the squares: √(169 − 144) = 5.",
          "PR कर्ण है, इसलिए वर्गों को घटाओ: √(169 − 144) = 5।",
        ),
      ],
      [
        "1 cm",
        t(
          "Sides don't subtract directly: use 13² − 12² = 25, so QR = 5.",
          "भुजाएँ सीधे नहीं घटतीं: 13² − 12² = 25 लो, तो QR = 5।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Two sides of a right triangle given: find the third and read off ratios. */
export const ratiosFromSides = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.TrigonometricRatios],
});
