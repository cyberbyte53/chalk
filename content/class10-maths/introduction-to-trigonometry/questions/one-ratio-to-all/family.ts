import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const r = String.raw;

/** Exercise 8.1 Q3–Q5, Q7–Q10: one ratio given, find another. */
const items = {
  q3tan: numItem(
    t(
      r`Exercise 8.1 Q3: $\sin A = \tfrac{3}{4}$. What is $\tan A$?`,
      r`प्रश्नावली 8.1 प्र3: $\sin A = \tfrac{3}{4}$। $\tan A$ क्या है?`,
    ),
    r`$\dfrac{3}{\sqrt 7}$`,
    [
      [
        r`$\dfrac{3}{4}$`,
        t(
          "That's sin A. tan A = opposite ÷ adjacent, and the adjacent side is √(16 − 9) k = √7 k.",
          "यह sin A है। tan A = सम्मुख ÷ संलग्न, और संलग्न भुजा √(16 − 9) k = √7 k है।",
        ),
      ],
      [
        r`$\dfrac{\sqrt 7}{3}$`,
        t(
          "That's adjacent ÷ opposite, cot A. Flip it for tan A.",
          "यह संलग्न ÷ सम्मुख है, cot A। tan A के लिए उलटो।",
        ),
      ],
    ],
  ),
  q4sin: numItem(
    t(
      r`Exercise 8.1 Q4: $15 \cot A = 8$. What is $\sin A$?`,
      r`प्रश्नावली 8.1 प्र4: $15 \cot A = 8$। $\sin A$ क्या है?`,
    ),
    r`$\dfrac{15}{17}$`,
    [
      [
        r`$\dfrac{8}{17}$`,
        t(
          "cot A = 8/15 puts 8 on the adjacent side. sin A uses the opposite side, 15.",
          "cot A = 8/15 से 8 संलग्न भुजा पर आता है। sin A में सम्मुख भुजा, 15, आती है।",
        ),
      ],
      [
        r`$\dfrac{15}{8}$`,
        t(
          "That's tan A. sin A divides by the hypotenuse, √(8² + 15²) = 17.",
          "यह tan A है। sin A कर्ण, √(8² + 15²) = 17, से भाग देता है।",
        ),
      ],
    ],
  ),
  q5: numItem(
    t(
      r`Exercise 8.1 Q5: $\sec \theta = \tfrac{13}{12}$. What is $\tan \theta$?`,
      r`प्रश्नावली 8.1 प्र5: $\sec \theta = \tfrac{13}{12}$। $\tan \theta$ क्या है?`,
    ),
    r`$\dfrac{5}{12}$`,
    [
      [
        r`$\dfrac{12}{5}$`,
        t(
          "That's cot θ. sec θ = 13/12 makes 12 the adjacent side and 5 the opposite.",
          "यह cot θ है। sec θ = 13/12 से 12 संलग्न भुजा और 5 सम्मुख बनती है।",
        ),
      ],
      [
        r`$\dfrac{5}{13}$`,
        t(
          "That's sin θ. tan θ divides by the adjacent side, 12.",
          "यह sin θ है। tan θ संलग्न भुजा, 12, से भाग देता है।",
        ),
      ],
    ],
  ),
  q7: numItem(
    t(
      r`Exercise 8.1 Q7: $\cot\theta = \tfrac{7}{8}$. What is $\dfrac{(1+\sin\theta)(1-\sin\theta)}{(1+\cos\theta)(1-\cos\theta)}$?`,
      r`प्रश्नावली 8.1 प्र7: $\cot\theta = \tfrac{7}{8}$। $\dfrac{(1+\sin\theta)(1-\sin\theta)}{(1+\cos\theta)(1-\cos\theta)}$ क्या है?`,
    ),
    r`$\dfrac{49}{64}$`,
    [
      [
        r`$\dfrac{7}{8}$`,
        t(
          "The top is 1 − sin²θ = cos²θ and the bottom is sin²θ, so it's cot²θ, squared.",
          "ऊपर 1 − sin²θ = cos²θ और नीचे sin²θ है, इसलिए यह cot²θ है, वर्ग।",
        ),
      ],
      [
        r`$\dfrac{64}{49}$`,
        t(
          "That's tan²θ. The top is cos²θ and the bottom sin²θ, which gives cot²θ.",
          "यह tan²θ है। ऊपर cos²θ और नीचे sin²θ है, जिससे cot²θ मिलता है।",
        ),
      ],
    ],
  ),
  q8: numItem(
    t(
      r`Exercise 8.1 Q8: $3 \cot A = 4$. What is $\dfrac{1 - \tan^2 A}{1 + \tan^2 A}$?`,
      r`प्रश्नावली 8.1 प्र8: $3 \cot A = 4$। $\dfrac{1 - \tan^2 A}{1 + \tan^2 A}$ क्या है?`,
    ),
    r`$\dfrac{7}{25}$`,
    [
      [
        r`$\dfrac{1}{7}$`,
        t(
          "tan A = 3/4, so tan²A = 9/16: (1 − 9/16) ÷ (1 + 9/16) = 7/25.",
          "tan A = 3/4, तो tan²A = 9/16: (1 − 9/16) ÷ (1 + 9/16) = 7/25।",
        ),
      ],
      [
        r`$-\dfrac{7}{25}$`,
        t(
          "tan A is 3/4, not 4/3: cot A = 4/3 is its reciprocal. With 3/4, the top is positive.",
          "tan A, 3/4 है, 4/3 नहीं: cot A = 4/3 उसका व्युत्क्रम है। 3/4 से ऊपर का भाग धनात्मक है।",
        ),
      ],
    ],
  ),
  q9: numItem(
    t(
      r`Exercise 8.1 Q9: in ∆ ABC right-angled at B, $\tan A = \tfrac{1}{\sqrt3}$. What is $\sin A \cos C + \cos A \sin C$?`,
      r`प्रश्नावली 8.1 प्र9: ∆ ABC में, जो B पर समकोण है, $\tan A = \tfrac{1}{\sqrt3}$। $\sin A \cos C + \cos A \sin C$ क्या है?`,
    ),
    r`$1$`,
    [
      [
        r`$\dfrac{1}{2}$`,
        t(
          "sin A = 1/2, cos C = 1/2, cos A = √3/2, sin C = √3/2: 1/4 + 3/4 = 1.",
          "sin A = 1/2, cos C = 1/2, cos A = √3/2, sin C = √3/2: 1/4 + 3/4 = 1।",
        ),
      ],
      [
        r`$\dfrac{\sqrt3}{2}$`,
        t(
          "Multiply each pair before adding: (1/2)(1/2) + (√3/2)(√3/2) = 1.",
          "जोड़ने से पहले हर जोड़ी का गुणा करो: (1/2)(1/2) + (√3/2)(√3/2) = 1।",
        ),
      ],
    ],
  ),
  q10: numItem(
    t(
      "Exercise 8.1 Q10: in ∆ PQR right-angled at Q, PR + QR = 25 cm and PQ = 5 cm. What is sin P?",
      "प्रश्नावली 8.1 प्र10: ∆ PQR में, जो Q पर समकोण है, PR + QR = 25 cm और PQ = 5 cm। sin P क्या है?",
    ),
    r`$\dfrac{12}{13}$`,
    [
      [
        r`$\dfrac{5}{13}$`,
        t(
          "QR = 12, PR = 13. 5/13 is PQ/PR, cos P. sin P uses QR, opposite P.",
          "QR = 12, PR = 13। 5/13, PQ/PR है, cos P। sin P में QR, P की सम्मुख, आती है।",
        ),
      ],
      [
        r`$\dfrac{12}{5}$`,
        t(
          "That's tan P = QR/PQ. sin P divides by the hypotenuse, 13.",
          "यह tan P = QR/PQ है। sin P कर्ण, 13, से भाग देता है।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** One ratio given: find the others, or an expression in them. */
export const oneRatioToAll = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.RatiosFromOneRatio],
});
