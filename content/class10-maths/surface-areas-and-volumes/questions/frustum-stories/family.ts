import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const openTop = t("The top is open: there's no circle there.", "ऊपर खुला है: वहाँ कोई वृत्त नहीं।");

/** Examples 13 and 14 and Exercise 13.4 Q4, Q5: frusta in real jobs. */
const items = {
  ex13: numItem(
    t(
      "Example 13. A jaggery mould is a frustum with faces 35 cm and 30 cm across, 14 cm high, holding 11641.7 cm³; molasses is 1.2 g per cm³. Each mould holds about",
      "उदाहरण 13। गुड़ का साँचा 35 cm और 30 cm चौड़े फलकों वाला, 14 cm ऊँचा छिन्नक है, जिसमें 11641.7 cm³ आता है; शीरा 1.2 g प्रति cm³ है। हर साँचे में लगभग आता है",
    ),
    "13.97 kg",
    [
      [
        "11.64 kg",
        t(
          "Each cm³ is 1.2 g, not 1 g: multiply by 1.2.",
          "हर cm³ 1.2 g है, 1 g नहीं: 1.2 से गुणा करो।",
        ),
      ],
      [
        "9.70 kg",
        t(
          "Mass = volume × mass of each cm³: multiply, don't divide.",
          "द्रव्यमान = आयतन × हर cm³ का द्रव्यमान: गुणा करो, भाग नहीं।",
        ),
      ],
    ],
  ),
  ex14sheet: numItem(
    t(
      "Example 14. An open bucket is a frustum (radii 22.5 cm and 12.5 cm, slant 35.44 cm) on a hollow cylindrical base 6 cm high (π = 22/7). The metal sheet is",
      "उदाहरण 14। एक खुली बाल्टी छिन्नक (त्रिज्याएँ 22.5 cm और 12.5 cm, तिर्यक 35.44 cm) है जो 6 cm ऊँचे खोखले बेलनाकार आधार पर है (π = 22/7)। धातु की चादर है",
    ),
    "4860.9 cm²",
    [
      ["6452.0 cm²", openTop],
      [
        "4389.5 cm²",
        t(
          "The base ring's curved side, 2πrh, is sheet too.",
          "आधार के छल्ले की वक्र दीवार, 2πrh, भी चादर है।",
        ),
      ],
    ],
  ),
  ex14water: numItem(
    t(
      "Example 14. The bucket is 40 cm tall in all, its base 6 cm; the frustum's radii are 22.5 cm and 12.5 cm (π = 22/7). It holds about",
      "उदाहरण 14। बाल्टी कुल 40 cm ऊँची है, आधार 6 cm; छिन्नक की त्रिज्याएँ 22.5 cm और 12.5 cm हैं (π = 22/7)। उसमें लगभग आता है",
    ),
    "33.62 litres",
    [
      [
        "39.55 litres",
        t(
          "The water sits in the frustum only: its height is 40 − 6 = 34 cm.",
          "पानी केवल छिन्नक में है: उसकी ऊँचाई 40 − 6 = 34 cm है।",
        ),
      ],
      [
        "3.36 litres",
        t(
          "1 litre is 1000 cm³: 33615 cm³ is 33.6 litres.",
          "1 लीटर 1000 cm³ है: 33615 cm³, 33.6 लीटर है।",
        ),
      ],
    ],
  ),
  q4milk: numItem(
    t(
      "Exercise 13.4 Q4. An open container is a frustum 16 cm high with radii 8 cm and 20 cm (π = 3.14). Milk to fill it, at ₹20 a litre, costs",
      "प्रश्नावली 13.4 प्र4। एक खुला बर्तन 16 cm ऊँचा छिन्नक है, त्रिज्याएँ 8 cm और 20 cm (π = 3.14)। उसे भरने का दूध, ₹20 प्रति लीटर, मूल्य है",
    ),
    "₹209",
    [
      [
        "₹155",
        t("The bracket has three terms: r₁² + r₂² + r₁r₂.", "कोष्ठक में तीन पद हैं: r₁² + r₂² + r₁r₂।"),
      ],
      [
        "₹627",
        t(
          "The volume has a ⅓ in front: ⅓πh(r₁² + r₂² + r₁r₂).",
          "आयतन के आगे ⅓ है: ⅓πh(r₁² + r₂² + r₁r₂)।",
        ),
      ],
    ],
  ),
  q4sheet: numItem(
    t(
      "Exercise 13.4 Q4. The same open container (h = 16, r₁ = 20, r₂ = 8, all cm, slant 20 cm). Metal sheet at ₹8 per 100 cm² costs",
      "प्रश्नावली 13.4 प्र4। वही खुला बर्तन (h = 16, r₁ = 20, r₂ = 8, सब cm, तिर्यक 20 cm)। ₹8 प्रति 100 cm² की धातु की चादर का मूल्य है",
    ),
    "₹156.75",
    [
      ["₹257.23", openTop],
      [
        "₹140.67",
        t(
          "The container has a bottom: add the small circle, πr₂².",
          "बर्तन की तली है: छोटा वृत्त, πr₂², जोड़ो।",
        ),
      ],
    ],
  ),
  q5: numItem(
    t(
      "Exercise 13.4 Q5. A metal cone 20 cm high, vertical angle 60°, is cut parallel to its base halfway up. The frustum is drawn into wire 1/16 cm across. The wire is",
      "प्रश्नावली 13.4 प्र5। 20 cm ऊँचा, शीर्ष कोण 60° का धातु का शंकु आधी ऊँचाई पर आधार के समांतर काटा जाता है। छिन्नक 1/16 cm चौड़े तार में खींचा जाता है। तार है",
    ),
    "7964.44 m",
    [
      [
        "1991.11 m",
        t("1/16 cm is the diameter: the radius is 1/32 cm.", "1/16 cm व्यास है: त्रिज्या 1/32 cm है।"),
      ],
      [
        "9102.22 m",
        t(
          "That's the whole cone. The small cone on top is cut off.",
          "यह पूरा शंकु है। ऊपर का छोटा शंकु कट जाता है।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Frusta in real jobs: moulds, buckets, containers, wire. */
export const frustumStories = bankFamily(items, {
  level: Level.Hard,
  tests: [Concept.FrustumOfACone],
});
