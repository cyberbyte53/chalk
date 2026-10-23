import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { bankFamily, numItem } from "../../kit";

const r = String.raw;

const sectorOnly = t(
  "That's the sector. A segment is sector minus the triangle cut off by the chord.",
  "यह त्रिज्यखंड है। वृत्तखंड = त्रिज्यखंड − जीवा से बना त्रिभुज।",
);
const added = t(
  "The triangle was added. It sits inside the sector, so subtract it.",
  "त्रिभुज जोड़ दिया। वह त्रिज्यखंड के अंदर है, तो उसे घटाओ।",
);

/** Example 3; Exercise 12.2 Q4, Q5(iii), Q6, Q7. */
const items = {
  ex3: numItem(
    t(
      "A chord of a circle of radius 21 cm subtends 120° at the centre. Find the area of the minor segment.",
      "21 cm त्रिज्या के वृत्त की एक जीवा केंद्र पर 120° बनाती है। लघु वृत्तखंड का क्षेत्रफल ज्ञात करो।",
    ),
    r`$\left(462 - \frac{441\sqrt{3}}{4}\right)$ cm²`,
    [
      [r`$\left(462 + \frac{441\sqrt{3}}{4}\right)$ cm²`, added],
      [
        r`$\left(462 - \frac{441\sqrt{3}}{2}\right)$ cm²`,
        t(
          r`The triangle's area is $\frac{1}{2} r^2 \sin 120° = \frac{441\sqrt{3}}{4}$.`,
          r`त्रिभुज का क्षेत्रफल $\frac{1}{2} r^2 \sin 120° = \frac{441\sqrt{3}}{4}$ है।`,
        ),
      ],
    ],
  ),
  q4minor: numItem(
    t(
      "A chord of a circle of radius 10 cm subtends a right angle at the centre. Find the area of the minor segment (π = 3.14).",
      "10 cm त्रिज्या के वृत्त की एक जीवा केंद्र पर समकोण बनाती है। लघु वृत्तखंड का क्षेत्रफल ज्ञात करो (π = 3.14)।",
    ),
    "28.5 cm²",
    [
      ["78.5 cm²", sectorOnly],
      ["128.5 cm²", added],
    ],
  ),
  q4major: numItem(
    t(
      "Same circle, radius 10 cm, chord at 90°. Find the area of the major sector (π = 3.14).",
      "वही वृत्त, त्रिज्या 10 cm, जीवा 90° पर। दीर्घ त्रिज्यखंड का क्षेत्रफल ज्ञात करो (π = 3.14)।",
    ),
    "235.5 cm²",
    [
      [
        "78.5 cm²",
        t(
          "That's the minor sector. The major sector is the other 270°.",
          "यह लघु त्रिज्यखंड है। दीर्घ त्रिज्यखंड बाकी 270° है।",
        ),
      ],
      [
        "285.5 cm²",
        t(
          "That's the major segment. The major sector has no triangle added.",
          "यह दीर्घ वृत्तखंड है। दीर्घ त्रिज्यखंड में त्रिभुज नहीं जुड़ता।",
        ),
      ],
    ],
  ),
  q5seg: numItem(
    t(
      "In a circle of radius 21 cm, a chord subtends 60° at the centre. Find the area of the segment formed by the chord.",
      "21 cm त्रिज्या के वृत्त में एक जीवा केंद्र पर 60° बनाती है। जीवा से बने वृत्तखंड का क्षेत्रफल ज्ञात करो।",
    ),
    r`$\left(231 - \frac{441\sqrt{3}}{4}\right)$ cm²`,
    [
      [r`$\left(231 + \frac{441\sqrt{3}}{4}\right)$ cm²`, added],
      [
        r`$\left(231 - \frac{441\sqrt{3}}{2}\right)$ cm²`,
        t(
          r`The 60° triangle is equilateral of side 21: area $\frac{\sqrt{3}}{4} \times 21^2$.`,
          r`60° वाला त्रिभुज 21 भुजा का समबाहु है: क्षेत्रफल $\frac{\sqrt{3}}{4} \times 21^2$।`,
        ),
      ],
    ],
  ),
  q6minor: numItem(
    t(
      "A chord of a circle of radius 15 cm subtends 60° at the centre. Find the minor segment's area (π = 3.14, √3 = 1.73).",
      "15 cm त्रिज्या के वृत्त की एक जीवा केंद्र पर 60° बनाती है। लघु वृत्तखंड का क्षेत्रफल ज्ञात करो (π = 3.14, √3 = 1.73)।",
    ),
    "20.44 cm²",
    [
      ["117.75 cm²", sectorOnly],
      [
        "686.06 cm²",
        t(
          "That's the major segment: the circle minus the minor one.",
          "यह दीर्घ वृत्तखंड है: वृत्त − लघु वृत्तखंड।",
        ),
      ],
    ],
  ),
  q6major: numItem(
    t(
      "Same chord, radius 15 cm, 60°. Find the major segment's area (π = 3.14, √3 = 1.73).",
      "वही जीवा, त्रिज्या 15 cm, 60°। दीर्घ वृत्तखंड का क्षेत्रफल ज्ञात करो (π = 3.14, √3 = 1.73)।",
    ),
    "686.06 cm²",
    [
      [
        "588.75 cm²",
        t(
          "That's the major sector. The major segment also gets the triangle: circle − minor segment.",
          "यह दीर्घ त्रिज्यखंड है। दीर्घ वृत्तखंड में त्रिभुज भी आता है: वृत्त − लघु वृत्तखंड।",
        ),
      ],
      ["20.44 cm²", t("That's the minor segment.", "यह लघु वृत्तखंड है।")],
    ],
  ),
  q7: numItem(
    t(
      "A chord of a circle of radius 12 cm subtends 120° at the centre. Find the segment's area (π = 3.14, √3 = 1.73).",
      "12 cm त्रिज्या के वृत्त की एक जीवा केंद्र पर 120° बनाती है। वृत्तखंड का क्षेत्रफल ज्ञात करो (π = 3.14, √3 = 1.73)।",
    ),
    "88.44 cm²",
    [
      ["150.72 cm²", sectorOnly],
      ["213.00 cm²", added],
    ],
  ),
} as const;

export const segmentArea = bankFamily(items, {
  level: Level.Hard,
  tests: [Concept.SectorAndSegment],
});
