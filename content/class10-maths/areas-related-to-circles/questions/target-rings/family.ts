import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { bankFamily, numItem } from "../../kit";

const r = String.raw;

const wholeDisc = t(
  "That's the whole disc up to the ring's outer edge. A ring is outer disc minus inner disc.",
  "यह वलय के बाहरी किनारे तक की पूरी चकती है। वलय = बाहरी चकती − भीतरी चकती।",
);
const wrongRing = t(
  "That's a neighbouring band. Count the bands from the centre: Gold, Red, Blue, Black, White, each 10.5 cm wide.",
  "यह पड़ोसी पट्टी है। केंद्र से गिनो: सुनहरा, लाल, नीला, काला, सफ़ेद, हर एक 10.5 cm चौड़ी।",
);

/** Exercise 12.1 Q3: the archery target, Gold disc of diameter 21 cm and four 10.5 cm bands. */
const intro = (band: { en: string; hi: string }) =>
  t(
    `An archery target: a Gold disc of diameter 21 cm, then Red, Blue, Black and White bands, each 10.5 cm wide. Find the area of the ${band.en} region.`,
    `तीरंदाज़ी का लक्ष्य: 21 cm व्यास की सुनहरी चकती, फिर लाल, नीली, काली और सफ़ेद पट्टियाँ, हर एक 10.5 cm चौड़ी। ${band.hi} भाग का क्षेत्रफल ज्ञात करो।`,
  );

const items = {
  gold: numItem(intro({ en: "Gold", hi: "सुनहरे" }), "346.5 cm²", [
    [
      "1386 cm²",
      t(
        r`That uses 21 as the radius. Gold's radius is 10.5: $\frac{22}{7} \times 10.5^2$.`,
        r`इसमें 21 को त्रिज्या माना। सुनहरे की त्रिज्या 10.5 है: $\frac{22}{7} \times 10.5^2$।`,
      ),
    ],
    ["66 cm²", t("66 cm is Gold's circumference, a length.", "66 cm सुनहरे की परिधि है, एक लंबाई।")],
  ]),
  red: numItem(intro({ en: "Red", hi: "लाल" }), "1039.5 cm²", [
    ["1386 cm²", wholeDisc],
    ["1732.5 cm²", wrongRing],
  ]),
  blue: numItem(intro({ en: "Blue", hi: "नीले" }), "1732.5 cm²", [
    ["3118.5 cm²", wholeDisc],
    ["2425.5 cm²", wrongRing],
  ]),
  black: numItem(intro({ en: "Black", hi: "काले" }), "2425.5 cm²", [
    ["5544 cm²", wholeDisc],
    ["1732.5 cm²", wrongRing],
  ]),
  white: numItem(intro({ en: "White", hi: "सफ़ेद" }), "3118.5 cm²", [
    ["8662.5 cm²", wholeDisc],
    ["2425.5 cm²", wrongRing],
  ]),
} as const;

export const targetRings = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.CircumferenceAndArea],
});
