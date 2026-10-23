import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { bankFamily, numItem } from "../../kit";

const r = String.raw;

const lengthNotArea = t(
  "That mixes a length into an area question. Wire and boundaries are lengths; sweeps and covers are areas.",
  "इसमें क्षेत्रफल के प्रश्न में लंबाई मिला दी। तार और सीमा लंबाइयाँ हैं; घेरा गया भाग और ढक्कन क्षेत्रफल।",
);
const count = t(
  "Count the pieces again: that answer uses the wrong number of sectors.",
  "टुकड़े फिर गिनो: इस उत्तर में त्रिज्यखंडों की संख्या ग़लत है।",
);

/** Exercise 12.2 Q8 (ii), Q9, Q10, Q11, Q12, Q13. */
const items = {
  q8more: numItem(
    t(
      "A horse tied to a square field's corner peg has a 5 m rope. How much more can it graze if the rope is 10 m (π = 3.14)?",
      "वर्गाकार खेत के कोने के खूँटे से बँधे घोड़े की रस्सी 5 m है। रस्सी 10 m हो तो वह कितना अधिक चर सकता है (π = 3.14)?",
    ),
    "58.875 m²",
    [
      [
        "78.5 m²",
        t(
          "That's the new grazing area. Subtract the old 19.625 m².",
          "यह नया चरने का क्षेत्रफल है। पुराना 19.625 m² घटाओ।",
        ),
      ],
      [
        "19.625 m²",
        t(
          "That's the old area. The rope doubled, so the area became four times.",
          "यह पुराना क्षेत्रफल है। रस्सी दुगुनी हुई, तो क्षेत्रफल चार गुना हुआ।",
        ),
      ],
    ],
  ),
  q9wire: numItem(
    t(
      "A brooch: a circle of diameter 35 mm with 5 wire diameters splitting it into 10 equal sectors. Total length of silver wire?",
      "एक ब्रोच: 35 mm व्यास का वृत्त, जिसके 5 तार-व्यास उसे 10 बराबर त्रिज्यखंडों में बाँटते हैं। चाँदी के तार की कुल लंबाई?",
    ),
    "285 mm",
    [
      [
        "460 mm",
        t(
          "That counts 10 diameters. Five diameters make the ten radii.",
          "इसमें 10 व्यास गिने। पाँच व्यास से ही दस त्रिज्याएँ बनती हैं।",
        ),
      ],
      [
        "175 mm",
        t(
          "That's only the 5 diameters. Add the rim, 110 mm.",
          "यह केवल 5 व्यास हैं। किनारा, 110 mm, जोड़ो।",
        ),
      ],
    ],
  ),
  q9area: numItem(
    t(
      "Same brooch, diameter 35 mm, 10 equal sectors. Find the area of each sector.",
      "वही ब्रोच, व्यास 35 mm, 10 बराबर त्रिज्यखंड। हर त्रिज्यखंड का क्षेत्रफल ज्ञात करो।",
    ),
    r`$\frac{385}{4}$ mm²`,
    [
      [r`$\frac{385}{2}$ mm²`, count],
      ["385 mm²", t("Diameter 35 means radius 17.5, not 35.", "व्यास 35 यानी त्रिज्या 17.5, 35 नहीं।")],
    ],
  ),
  q10: numItem(
    t(
      "An umbrella has 8 equally spaced ribs; treat it as a flat circle of radius 45 cm. Find the area between two consecutive ribs.",
      "एक छाते में 8 बराबर दूरी पर तीलियाँ हैं; उसे 45 cm त्रिज्या का समतल वृत्त मानो। दो क्रमागत तीलियों के बीच का क्षेत्रफल ज्ञात करो।",
    ),
    r`$\frac{22275}{28}$ cm²`,
    [
      [r`$\frac{22275}{14}$ cm²`, count],
      [r`$\frac{495}{14}$ cm²`, lengthNotArea],
    ],
  ),
  q11: numItem(
    t(
      "A car has two wipers that don't overlap. Each blade is 25 cm and sweeps 115°. Find the total area cleaned.",
      "एक कार में दो वाइपर हैं जो एक-दूसरे पर नहीं आते। हर ब्लेड 25 cm का है और 115° घूमता है। कुल साफ़ क्षेत्रफल ज्ञात करो।",
    ),
    r`$\frac{158125}{126}$ cm²`,
    [
      [r`$\frac{158125}{252}$ cm²`, t("That's one wiper. There are two.", "यह एक वाइपर है। दो हैं।")],
      [r`$\frac{6325}{63}$ cm²`, lengthNotArea],
    ],
  ),
  q12: numItem(
    t(
      "A lighthouse spreads red light over an 80° sector up to 16.5 km. Find the sea area warned (π = 3.14).",
      "एक प्रकाशस्तंभ 16.5 km तक 80° के त्रिज्यखंड में लाल रोशनी फैलाता है। चेताया गया समुद्री क्षेत्रफल ज्ञात करो (π = 3.14)।",
    ),
    "189.97 km²",
    [
      [
        "854.87 km²",
        t("That's the whole circle. 80° is 2/9 of it.", "यह पूरा वृत्त है। 80° उसका 2/9 है।"),
      ],
      ["23.03 km²", lengthNotArea],
    ],
  ),
  q13area: numItem(
    t(
      "A round table cover of radius 28 cm has 6 equal designs: the segments left outside an inscribed regular hexagon. Find the designs' area (√3 = 1.7).",
      "28 cm त्रिज्या वाले गोल मेज़पोश पर 6 बराबर डिज़ाइन हैं: अंतर्निहित समषट्भुज के बाहर बचे वृत्तखंड। डिज़ाइनों का क्षेत्रफल ज्ञात करो (√3 = 1.7)।",
    ),
    "464.8 cm²",
    [
      [
        "1999.2 cm²",
        t(
          "That's the hexagon, six equilateral triangles. The designs are circle minus hexagon.",
          "यह षट्भुज है, छह समबाहु त्रिभुज। डिज़ाइन = वृत्त − षट्भुज।",
        ),
      ],
      ["77.47 cm²", count],
    ],
  ),
  q13cost: numItem(
    t(
      "Those designs cover 464.8 cm². At ₹0.35 per cm², what do they cost?",
      "वे डिज़ाइन 464.8 cm² घेरते हैं। ₹0.35 प्रति cm² की दर से उनका ख़र्च क्या है?",
    ),
    "₹162.68",
    [
      [
        "₹1328",
        t("That divides by 0.35. Cost is area × rate.", "इसमें 0.35 से भाग दिया। ख़र्च = क्षेत्रफल × दर।"),
      ],
      ["₹27.11", count],
    ],
  ),
} as const;

export const sectorStories = bankFamily(items, {
  level: Level.Hard,
  tests: [Concept.UsingSectors],
});
