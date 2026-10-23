import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem, wordItem } from "../../kit";

const r = String.raw;

const threeTerms = t(
  "The bracket has three terms: r₁² + r₂² + r₁r₂.",
  "कोष्ठक में तीन पद हैं: r₁² + r₂² + r₁r₂।",
);
const diameters = t(
  "Those are diameters: halve them for the radii.",
  "वे व्यास हैं: त्रिज्याओं के लिए आधा करो।",
);

/** Example 12 and Exercise 13.4 Q1–Q3: the frustum's formulas. */
const items = {
  ex12volume: numItem(
    t(
      "Example 12. A frustum 45 cm high has ends of radius 28 cm and 7 cm (π = 22/7). Its volume is",
      "उदाहरण 12। 45 cm ऊँचे छिन्नक के सिरों की त्रिज्याएँ 28 cm और 7 cm हैं (π = 22/7)। उसका आयतन है",
    ),
    "48510 cm³",
    [
      ["39270 cm³", threeTerms],
      [
        "49280 cm³",
        t("That's the whole big cone. Take the small cone off.", "यह पूरा बड़ा शंकु है। छोटा शंकु हटाओ।"),
      ],
    ],
  ),
  ex12curved: numItem(
    t(
      "Example 12. The same frustum (r₁ = 28, r₂ = 7, h = 45, all cm) has curved surface area",
      "उदाहरण 12। उसी छिन्नक (r₁ = 28, r₂ = 7, h = 45, सब cm) का वक्र पृष्ठीय क्षेत्रफल है",
    ),
    "5461.5 cm²",
    [
      [
        "4950.0 cm²",
        t(
          "The curved surface uses the slant height l = 49.65, not the height 45.",
          "वक्र पृष्ठ में तिर्यक ऊँचाई l = 49.65 आती है, ऊँचाई 45 नहीं।",
        ),
      ],
      [
        "3276.9 cm²",
        t(
          "It's π(r₁ + r₂)l: the sum of the radii, not the difference.",
          "यह π(r₁ + r₂)l है: त्रिज्याओं का योग, अंतर नहीं।",
        ),
      ],
    ],
  ),
  ex12total: numItem(
    t(
      "Example 12. The frustum's curved surface is 5461.5 cm² (r₁ = 28 cm, r₂ = 7 cm). Its total surface area is",
      "उदाहरण 12। छिन्नक का वक्र पृष्ठ 5461.5 cm² है (r₁ = 28 cm, r₂ = 7 cm)। उसका कुल पृष्ठीय क्षेत्रफल है",
    ),
    "8079.5 cm²",
    [
      [
        "7925.5 cm²",
        t(
          "A solid frustum has two flat ends: add the small one, πr₂², too.",
          "ठोस छिन्नक के दो सपाट सिरे हैं: छोटा, πr₂², भी जोड़ो।",
        ),
      ],
      ["5615.5 cm²", t("The large end, πr₁², is missing.", "बड़ा सिरा, πr₁², छूट गया।")],
    ],
  ),
  slant: wordItem(
    t(
      "A frustum has height h and end radii r₁ > r₂. Its slant height is",
      "एक छिन्नक की ऊँचाई h और सिरों की त्रिज्याएँ r₁ > r₂ हैं। उसकी तिर्यक ऊँचाई है",
    ),
    t(r`$\sqrt{h^2 + (r_1 - r_2)^2}$`, r`$\sqrt{h^2 + (r_1 - r_2)^2}$`),
    [
      [
        t(r`$\sqrt{h^2 + (r_1 + r_2)^2}$`, r`$\sqrt{h^2 + (r_1 + r_2)^2}$`),
        t(
          "Along the side, the right triangle's flat leg is how much wider one end is: r₁ − r₂.",
          "बगल के साथ, समकोण त्रिभुज की सपाट भुजा यह है कि एक सिरा कितना चौड़ा है: r₁ − r₂।",
        ),
      ],
      [
        t(r`$\sqrt{h^2 + r_1^2}$`, r`$\sqrt{h^2 + r_1^2}$`),
        t(
          "That's the slant of a whole cone of radius r₁. The frustum's side is shorter.",
          "यह त्रिज्या r₁ के पूरे शंकु की तिर्यक है। छिन्नक की भुजा छोटी है।",
        ),
      ],
    ],
  ),
  q1: numItem(
    t(
      "Exercise 13.4 Q1. A glass is a frustum 14 cm high, its ends 4 cm and 2 cm across. Its capacity is",
      "प्रश्नावली 13.4 प्र1। एक गिलास 14 cm ऊँचा छिन्नक है, सिरे 4 cm और 2 cm चौड़े। उसकी धारिता है",
    ),
    r`$102\tfrac{2}{3}$ cm³`,
    [
      [r`$410\tfrac{2}{3}$ cm³`, diameters],
      [r`$73\tfrac{1}{3}$ cm³`, threeTerms],
    ],
  ),
  q2: numItem(
    t(
      "Exercise 13.4 Q2. A frustum's slant height is 4 cm and its ends' circumferences are 18 cm and 6 cm. Its curved surface area is",
      "प्रश्नावली 13.4 प्र2। एक छिन्नक की तिर्यक ऊँचाई 4 cm है और सिरों की परिधियाँ 18 cm और 6 cm हैं। उसका वक्र पृष्ठीय क्षेत्रफल है",
    ),
    "48 cm²",
    [
      [
        "96 cm²",
        t("A circumference is 2πr, so πr is half of it.", "परिधि 2πr है, तो πr उसका आधा है।"),
      ],
      [
        "24 cm²",
        t(
          "Use the sum of the ends, π(r₁ + r₂), not the difference.",
          "सिरों का योग, π(r₁ + r₂), लो, अंतर नहीं।",
        ),
      ],
    ],
  ),
  q3: numItem(
    t(
      "Exercise 13.4 Q3. A fez is a frustum, open at the wide end (radius 10 cm), closed at the top (radius 4 cm), slant 15 cm. Its material is",
      "प्रश्नावली 13.4 प्र3। एक फ़ेज़ टोपी छिन्नक है, चौड़े सिरे (त्रिज्या 10 cm) पर खुली, ऊपर (त्रिज्या 4 cm) बंद, तिर्यक 15 cm। उसकी सामग्री है",
    ),
    r`$710\tfrac{2}{7}$ cm²`,
    [
      [
        r`$660$ cm²`,
        t("The top is closed: add the small circle, πr₂².", "ऊपर बंद है: छोटा वृत्त, πr₂², जोड़ो।"),
      ],
      [
        r`$1024\tfrac{4}{7}$ cm²`,
        t(
          "The wide end is open, where the head goes: no circle there.",
          "चौड़ा सिरा खुला है, जहाँ सिर जाता है: वहाँ कोई वृत्त नहीं।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** The frustum's volume, curved and total surface area. */
export const frustumFormulas = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.FrustumOfACone],
});
