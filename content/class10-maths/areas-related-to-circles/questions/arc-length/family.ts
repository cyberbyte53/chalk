import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { bankFamily, numItem } from "../../kit";

const r = String.raw;

const areaNotArc = t(
  r`That's the sector's area. The arc is a length: $\frac{\theta}{360} \times 2\pi r$.`,
  r`यह त्रिज्यखंड का क्षेत्रफल है। चाप एक लंबाई है: $\frac{\theta}{360} \times 2\pi r$।`,
);
const halfArc = t(
  r`That uses $\pi r$ in place of $2\pi r$, so it's half the arc.`,
  r`इसमें $2\pi r$ की जगह $\pi r$ लिया, तो यह आधा चाप है।`,
);

/** Exercise 12.2 Q5(i), the mudguard, and arc ↔ angle. */
const items = {
  q5arc: numItem(
    t(
      "In a circle of radius 21 cm, an arc subtends 60° at the centre. Find the length of the arc.",
      "21 cm त्रिज्या वाले वृत्त में एक चाप केंद्र पर 60° बनाता है। चाप की लंबाई ज्ञात करो।",
    ),
    "22 cm",
    [
      ["11 cm", halfArc],
      ["231 cm", areaNotArc],
    ],
  ),
  mudguard: numItem(
    t(
      "A mudguard follows a 90° arc of a wheel of radius 35 cm. How long is its edge?",
      "एक मडगार्ड 35 cm त्रिज्या वाले पहिये के 90° चाप पर चलता है। उसका किनारा कितना लंबा है?",
    ),
    "55 cm",
    [
      ["27.5 cm", halfArc],
      [
        "220 cm",
        t(
          "220 cm is the whole wheel's rim. 90° is a quarter of it.",
          "220 cm पूरे पहिये का किनारा है। 90° उसका चौथाई है।",
        ),
      ],
    ],
  ),
  arc45: numItem(
    t(
      "Find the length of an arc of angle 45° in a circle of radius 14 cm.",
      "14 cm त्रिज्या वाले वृत्त में 45° कोण के चाप की लंबाई ज्ञात करो।",
    ),
    "11 cm",
    [
      ["77 cm", areaNotArc],
      ["5.5 cm", halfArc],
    ],
  ),
  angle: numItem(
    t(
      "An arc of length 44 cm lies on a circle of radius 21 cm. What angle does it subtend at the centre?",
      "21 cm त्रिज्या वाले वृत्त पर 44 cm लंबा एक चाप है। वह केंद्र पर कितना कोण बनाता है?",
    ),
    "120°",
    [
      ["240°", halfArc],
      [
        "60°",
        t(
          r`The whole rim is 132 cm. $\frac{44}{132} = \frac{1}{3}$ of 360° is 120°.`,
          r`पूरा किनारा 132 cm है। 360° का $\frac{44}{132} = \frac{1}{3}$ यानी 120°।`,
        ),
      ],
    ],
  ),
} as const;

export const arcLength = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.SectorAndSegment],
});
