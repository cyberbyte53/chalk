import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { bankFamily, numItem } from "../../kit";

const r = String.raw;

const lengthForm = t(
  r`That has $2\pi R$ alone, which is a length (the arc). Area needs $R^2$.`,
  r`इसमें केवल $2\pi R$ है, जो लंबाई (चाप) है। क्षेत्रफल में $R^2$ चाहिए।`,
);

/** Exercise 12.2 Q14 and the sector formulas read the other way round. */
const items = {
  q14: numItem(
    t(
      "Tick the correct answer. Area of a sector of angle p (in degrees) of a circle with radius R is:",
      "सही उत्तर चुनो। R त्रिज्या वाले वृत्त के p (अंशों में) कोण वाले त्रिज्यखंड का क्षेत्रफल है:",
    ),
    r`$\frac{p}{720} \times 2\pi R^2$`,
    [
      [r`$\frac{p}{180} \times 2\pi R$`, lengthForm],
      [r`$\frac{p}{360} \times 2\pi R$`, lengthForm],
      [
        r`$\frac{p}{360} \times 2\pi R^2$`,
        t(
          r`That's double: $\frac{p}{360} \times \pi R^2$ is the area, and $\frac{2}{720} = \frac{1}{360}$.`,
          r`यह दुगुना है: क्षेत्रफल $\frac{p}{360} \times \pi R^2$ है, और $\frac{2}{720} = \frac{1}{360}$।`,
        ),
      ],
    ],
  ),
  halfLR: numItem(
    t(
      "A sector has arc length l and radius r. Its area is:",
      "एक त्रिज्यखंड की चाप-लंबाई l और त्रिज्या r है। उसका क्षेत्रफल है:",
    ),
    r`$\frac{1}{2} l r$`,
    [
      [
        r`$l r$`,
        t(
          r`A sector is like a triangle with base l and height r, so halve it: $\frac{\theta}{360}\pi r^2 = \frac{1}{2} \cdot \frac{\theta}{360} 2\pi r \cdot r$.`,
          r`त्रिज्यखंड l आधार, r ऊँचाई वाले त्रिभुज जैसा है, तो आधा करो।`,
        ),
      ],
      [
        r`$\frac{1}{2} l r^2$`,
        t("That has the wrong units: l × r² is a volume.", "इसकी इकाई ग़लत है: l × r² आयतन है।"),
      ],
    ],
  ),
  areaFromArc: numItem(
    t(
      "A sector of radius 10 cm has arc length 22 cm. Find its area.",
      "10 cm त्रिज्या वाले त्रिज्यखंड की चाप-लंबाई 22 cm है। उसका क्षेत्रफल ज्ञात करो।",
    ),
    "110 cm²",
    [
      [
        "220 cm²",
        t(r`Area is $\frac{1}{2} l r$, not $l r$.`, r`क्षेत्रफल $\frac{1}{2} l r$ है, $l r$ नहीं।`),
      ],
      [
        "11 cm²",
        t(
          r`That's $\frac{l}{2}$. Multiply by r too: $\frac{1}{2} \times 22 \times 10$.`,
          r`यह $\frac{l}{2}$ है। r से भी गुणा करो: $\frac{1}{2} \times 22 \times 10$।`,
        ),
      ],
    ],
  ),
  angleFromArea: numItem(
    t(
      "A sector of a circle of radius 21 cm has area 231 cm². What is its angle?",
      "21 cm त्रिज्या वाले वृत्त के एक त्रिज्यखंड का क्षेत्रफल 231 cm² है। उसका कोण क्या है?",
    ),
    "60°",
    [
      [
        "120°",
        t(
          r`The circle is 1386 cm², and $\frac{231}{1386} = \frac{1}{6}$, so 60°.`,
          r`वृत्त 1386 cm² है, और $\frac{231}{1386} = \frac{1}{6}$, तो 60°।`,
        ),
      ],
      [
        "30°",
        t(
          r`$\frac{231}{1386} = \frac{1}{6}$ of 360° is 60°.`,
          r`360° का $\frac{231}{1386} = \frac{1}{6}$ यानी 60°।`,
        ),
      ],
    ],
  ),
} as const;

export const sectorFormula = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.UsingSectors],
});
