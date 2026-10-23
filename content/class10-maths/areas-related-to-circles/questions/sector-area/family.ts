import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { bankFamily, numItem } from "../../kit";

const r = String.raw;

const arcNotArea = t(
  r`That's the arc length, $\frac{\theta}{360} \times 2\pi r$. Area uses $\pi r^2$.`,
  r`यह चाप की लंबाई है, $\frac{\theta}{360} \times 2\pi r$। क्षेत्रफल में $\pi r^2$ लगता है।`,
);
const wholeCircle = t(
  r`That's the whole circle. Take only the fraction $\frac{\theta}{360}$ of it.`,
  r`यह पूरा वृत्त है। उसका केवल $\frac{\theta}{360}$ भाग लो।`,
);

/** Exercise 12.2 Q1, Q2, Q3, Q6 (sector), Q7 (sector), Q8; Example 2's sector. */
const items = {
  q1: numItem(
    t(
      "Find the area of a sector of a circle of radius 6 cm with angle 60°.",
      "6 cm त्रिज्या के वृत्त के 60° कोण वाले त्रिज्यखंड का क्षेत्रफल ज्ञात करो।",
    ),
    r`$\frac{132}{7}$ cm²`,
    [
      [r`$\frac{44}{7}$ cm²`, arcNotArea],
      [r`$\frac{792}{7}$ cm²`, wholeCircle],
    ],
  ),
  q2: numItem(
    t(
      "Find the area of a quadrant of a circle whose circumference is 22 cm.",
      "उस वृत्त के चतुर्थांश का क्षेत्रफल ज्ञात करो जिसकी परिधि 22 cm है।",
    ),
    r`$\frac{77}{8}$ cm²`,
    [
      [r`$\frac{77}{2}$ cm²`, wholeCircle],
      [
        r`$\frac{11}{2}$ cm²`,
        t(
          "That's a quarter of the circumference, a length. Find r = 3.5 first, then ¼πr².",
          "यह परिधि का चौथाई है, एक लंबाई। पहले r = 3.5 निकालो, फिर ¼πr²।",
        ),
      ],
    ],
  ),
  q3: numItem(
    t(
      "A clock's minute hand is 14 cm long. Find the area it sweeps in 5 minutes.",
      "घड़ी की मिनट की सुई 14 cm लंबी है। 5 मिनट में वह कितना क्षेत्रफल घेरती है?",
    ),
    r`$\frac{154}{3}$ cm²`,
    [
      [
        r`$\frac{770}{3}$ cm²`,
        t(
          "That uses 150°. One minute is 6°, so 5 minutes is 30°.",
          "इसमें 150° लिया। एक मिनट = 6°, तो 5 मिनट = 30°।",
        ),
      ],
      [r`$\frac{22}{3}$ cm²`, arcNotArea],
    ],
  ),
  q6sector: numItem(
    t(
      "A chord of a circle of radius 15 cm subtends 60° at the centre. Find the area of the minor sector (π = 3.14).",
      "15 cm त्रिज्या के वृत्त की एक जीवा केंद्र पर 60° बनाती है। लघु त्रिज्यखंड का क्षेत्रफल ज्ञात करो (π = 3.14)।",
    ),
    "117.75 cm²",
    [
      ["15.7 cm²", arcNotArea],
      [
        "588.75 cm²",
        t("That's the major sector, 300° of the circle.", "यह दीर्घ त्रिज्यखंड है, वृत्त का 300°।"),
      ],
    ],
  ),
  q7sector: numItem(
    t(
      "A chord of a circle of radius 12 cm subtends 120° at the centre. Find the area of the minor sector (π = 3.14).",
      "12 cm त्रिज्या के वृत्त की एक जीवा केंद्र पर 120° बनाती है। लघु त्रिज्यखंड का क्षेत्रफल ज्ञात करो (π = 3.14)।",
    ),
    "150.72 cm²",
    [
      ["25.12 cm²", arcNotArea],
      [
        "301.44 cm²",
        t(
          "That's two-thirds of the circle; 120° is one-third.",
          "यह वृत्त का दो-तिहाई है; 120° एक-तिहाई है।",
        ),
      ],
    ],
  ),
  q8: numItem(
    t(
      "A horse is tied by a 5 m rope to a corner peg of a 15 m square field. Find the area it can graze (π = 3.14).",
      "15 m भुजा वाले वर्गाकार खेत के एक कोने के खूँटे से घोड़ा 5 m रस्सी से बँधा है। वह कितना क्षेत्रफल चर सकता है (π = 3.14)?",
    ),
    "19.625 m²",
    [
      [
        "78.5 m²",
        t(
          "The corner is 90°, so the horse reaches only a quarter of the circle.",
          "कोना 90° का है, तो घोड़ा वृत्त के केवल चौथाई तक पहुँचता है।",
        ),
      ],
      ["7.85 m²", arcNotArea],
    ],
  ),
  ex2: numItem(
    t(
      "Find the area of a sector of radius 4 cm and angle 30° (π = 3.14).",
      "4 cm त्रिज्या और 30° कोण वाले त्रिज्यखंड का क्षेत्रफल ज्ञात करो (π = 3.14)।",
    ),
    "4.19 cm²",
    [
      ["46.05 cm²", t("That's the major sector, 330°.", "यह दीर्घ त्रिज्यखंड है, 330°।")],
      ["2.09 cm²", arcNotArea],
    ],
  ),
} as const;

export const sectorArea = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.SectorAndSegment],
});
