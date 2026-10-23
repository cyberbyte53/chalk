import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const tsaNotCsa = t(
  "That added the flat ends: it's the total surface area. Curved means the side alone.",
  "इसमें सपाट सिरे जोड़े: यह कुल पृष्ठीय क्षेत्रफल है। वक्र का अर्थ है केवल बगल का भाग।",
);
const isVolume = t(
  "That's the volume, the space inside. The question asks for a surface.",
  "यह आयतन है, अंदर की जगह। प्रश्न पृष्ठ पूछता है।",
);
const isArea = t(
  "That's a surface area. The question asks how much space is inside.",
  "यह पृष्ठीय क्षेत्रफल है। प्रश्न पूछता है कि अंदर कितनी जगह है।",
);

/** The basic solids' formulas (Class IX, recalled in 13.1), one at a time. */
const items = {
  cylinderCsa: numItem(
    t(
      "A cylinder has radius 3.5 cm and height 10 cm. Its curved surface area is (π = 22/7)",
      "एक बेलन की त्रिज्या 3.5 cm और ऊँचाई 10 cm है। उसका वक्र पृष्ठीय क्षेत्रफल है (π = 22/7)",
    ),
    "220 cm²",
    [
      ["297 cm²", tsaNotCsa],
      ["385 cm²", isVolume],
    ],
  ),
  coneSlant: numItem(
    t(
      "A cone has radius 6 cm and height 8 cm. Its slant height is",
      "एक शंकु की त्रिज्या 6 cm और ऊँचाई 8 cm है। उसकी तिर्यक ऊँचाई है",
    ),
    "10 cm",
    [
      [
        "14 cm",
        t(
          "Lengths don't simply add. The slant is the hypotenuse: l = √(r² + h²).",
          "लंबाइयाँ सीधे नहीं जुड़तीं। तिर्यक कर्ण है: l = √(r² + h²)।",
        ),
      ],
      [
        "5.3 cm",
        t(
          "That's √(h² − r²). The slant is the longest side, so add the squares: √(36 + 64).",
          "यह √(h² − r²) है। तिर्यक सबसे लंबी भुजा है, तो वर्ग जोड़ो: √(36 + 64)।",
        ),
      ],
    ],
  ),
  sphereSa: numItem(
    t(
      "A sphere has radius 7 cm. Its surface area is (π = 22/7)",
      "एक गोले की त्रिज्या 7 cm है। उसका पृष्ठीय क्षेत्रफल है (π = 22/7)",
    ),
    "616 cm²",
    [
      [
        "462 cm²",
        t(
          "3πr² is a solid hemisphere's total. A whole sphere is 4πr².",
          "3πr² ठोस अर्धगोले का कुल है। पूरा गोला 4πr² है।",
        ),
      ],
      [
        "154 cm²",
        t(
          "πr² is one flat circle. A sphere's surface is four of those: 4πr².",
          "πr² एक सपाट वृत्त है। गोले का पृष्ठ ऐसे चार है: 4πr²।",
        ),
      ],
    ],
  ),
  hemisphereTsa: numItem(
    t(
      "A solid hemisphere has radius 7 cm. Its total surface area is (π = 22/7)",
      "एक ठोस अर्धगोले की त्रिज्या 7 cm है। उसका कुल पृष्ठीय क्षेत्रफल है (π = 22/7)",
    ),
    "462 cm²",
    [
      [
        "308 cm²",
        t(
          "That's the curved part, 2πr². A solid hemisphere also has its flat circle: add πr².",
          "यह वक्र भाग, 2πr², है। ठोस अर्धगोले का सपाट वृत्त भी है: πr² जोड़ो।",
        ),
      ],
      [
        "616 cm²",
        t(
          "That's a whole sphere, 4πr². Half the sphere's curve plus one circle: 2πr² + πr².",
          "यह पूरा गोला, 4πr², है। गोले का आधा वक्र और एक वृत्त: 2πr² + πr²।",
        ),
      ],
    ],
  ),
  hemisphereVolume: numItem(
    t(
      "A hemisphere has radius 21 cm. Its volume is (π = 22/7)",
      "एक अर्धगोले की त्रिज्या 21 cm है। उसका आयतन है (π = 22/7)",
    ),
    "19404 cm³",
    [
      [
        "38808 cm³",
        t(
          "That's the whole sphere, ⁴⁄₃πr³. A hemisphere is half: ⅔πr³.",
          "यह पूरा गोला, ⁴⁄₃πr³, है। अर्धगोला आधा है: ⅔πr³।",
        ),
      ],
      ["2772 cm³", isArea],
    ],
  ),
  coneVolume: numItem(
    t(
      "A cone has radius 3 cm and height 4 cm. Its volume, in terms of π, is",
      "एक शंकु की त्रिज्या 3 cm और ऊँचाई 4 cm है। उसका आयतन, π के रूप में, है",
    ),
    "12π cm³",
    [
      [
        "36π cm³",
        t(
          "That's a cylinder of the same base and height. A cone holds a third: ⅓πr²h.",
          "यह समान आधार और ऊँचाई का बेलन है। शंकु में एक-तिहाई आता है: ⅓πr²h।",
        ),
      ],
      [
        "15π cm³",
        t(
          "That's πrl with l = 5: the curved surface. The volume is ⅓πr²h.",
          "यह l = 5 के साथ πrl है: वक्र पृष्ठ। आयतन ⅓πr²h है।",
        ),
      ],
    ],
  ),
  cuboidTsa: numItem(
    t(
      "A closed box is a cuboid 6 cm × 4 cm × 3 cm. Its total surface area is",
      "एक बंद डिब्बा 6 cm × 4 cm × 3 cm का घनाभ है। उसका कुल पृष्ठीय क्षेत्रफल है",
    ),
    "108 cm²",
    [
      [
        "54 cm²",
        t(
          "lb + bh + hl counts each pair of faces once. A box has two of each: 2(lb + bh + hl).",
          "lb + bh + hl हर जोड़ी के फलक एक बार गिनता है। डिब्बे में हर एक दो हैं: 2(lb + bh + hl)।",
        ),
      ],
      ["72 cm²", isVolume],
    ],
  ),
} satisfies Record<string, Item>;

/** One basic solid's area, slant height or volume. */
export const basicFormulas = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.TheSolidsWeKnow],
});
