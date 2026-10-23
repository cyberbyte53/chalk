import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem, wordItem } from "../../kit";

const diameter = t(
  "The diameter was used as the radius: halve it first.",
  "व्यास को त्रिज्या लिया: पहले आधा करो।",
);

/** Examples 9 and 11, Exercise 13.3 Q3, Q4, Q8, Q9: water pumped, earth dug, water flowing. */
const items = {
  ex9: numItem(
    t(
      "Example 9. A full cuboid sump 1.57 m × 1.44 m × 95 cm fills a cylindrical tank of radius 60 cm, height 95 cm (π = 3.14). The water left in the sump stands",
      "उदाहरण 9। 1.57 m × 1.44 m × 95 cm का भरा घनाभ हौज़ त्रिज्या 60 cm, ऊँचाई 95 cm की बेलनाकार टंकी भरता है (π = 3.14)। हौज़ में बचा पानी खड़ा है",
    ),
    "47.5 cm",
    [
      [
        "95 cm",
        t(
          "The tank's water came out of the sump: take it away.",
          "टंकी का पानी हौज़ से निकला: उसे घटाओ।",
        ),
      ],
      ["0.475 cm", t("0.475 is in metres: that's 47.5 cm.", "0.475 मीटर में है: वह 47.5 cm है।")],
    ],
  ),
  ex9ratio: wordItem(
    t(
      "Example 9. The tank holds 3.14 × 0.6² × 0.95 m³ and the sump 1.57 × 1.44 × 0.95 m³. The tank holds",
      "उदाहरण 9। टंकी में 3.14 × 0.6² × 0.95 m³ आता है और हौज़ में 1.57 × 1.44 × 0.95 m³। टंकी में आता है",
    ),
    t("Half what the sump holds", "हौज़ का आधा"),
    [
      [
        t("Twice what the sump holds", "हौज़ का दोगुना"),
        t(
          "The sump still has water after filling the tank, so the tank is smaller.",
          "टंकी भरने के बाद भी हौज़ में पानी है, तो टंकी छोटी है।",
        ),
      ],
      [
        t("Just what the sump holds", "हौज़ के बराबर"),
        t(
          "Then the sump would be empty, but 47.5 cm is left.",
          "तब हौज़ ख़ाली होता, पर 47.5 cm बचा है।",
        ),
      ],
    ],
  ),
  ex11: numItem(
    t(
      "Example 11. A full hemispherical tank 3 m across is emptied at 3 4/7 litres a second (π = 22/7). Emptying half of it takes",
      "उदाहरण 11। 3 m चौड़ी भरी अर्धगोलाकार टंकी 3 4/7 लीटर प्रति सेकंड से ख़ाली होती है (π = 22/7)। उसका आधा ख़ाली होने में लगता है",
    ),
    "16.5 minutes",
    [
      [
        "33 minutes",
        t(
          "That empties the whole tank. Only half is asked.",
          "यह पूरी टंकी ख़ाली करता है। केवल आधा पूछा है।",
        ),
      ],
      ["990 minutes", t("990 is seconds: divide by 60.", "990 सेकंड है: 60 से भाग दो।")],
    ],
  ),
  q3: numItem(
    t(
      "Exercise 13.3 Q3. Earth from a well 20 m deep and 7 m across is spread into a platform 22 m by 14 m. Its height is",
      "प्रश्नावली 13.3 प्र3। 20 m गहरे और 7 m चौड़े कुएँ की मिट्टी 22 m × 14 m के चबूतरे में फैलाई जाती है। उसकी ऊँचाई है",
    ),
    "2.5 m",
    [
      ["10 m", diameter],
      ["0.8 m", t("The well is a cylinder: its volume needs π.", "कुआँ बेलन है: उसके आयतन में π है।")],
    ],
  ),
  q4: numItem(
    t(
      "Exercise 13.3 Q4. Earth from a well 3 m across and 14 m deep is spread evenly in a ring 4 m wide all round it. The embankment's height is",
      "प्रश्नावली 13.3 प्र4। 3 m चौड़े और 14 m गहरे कुएँ की मिट्टी उसके चारों ओर 4 m चौड़े छल्ले में बराबर फैलाई जाती है। तटबंध की ऊँचाई है",
    ),
    "1.125 m",
    [
      [
        "1.969 m",
        t(
          "The ring starts at the well's edge: its outer radius is 1.5 + 4 = 5.5 m.",
          "छल्ला कुएँ के किनारे से शुरू होता है: बाहरी त्रिज्या 1.5 + 4 = 5.5 m है।",
        ),
      ],
      [
        "1.041 m",
        t(
          "The well's own circle is a hole in the ring: take it away.",
          "कुएँ का अपना वृत्त छल्ले में छेद है: उसे घटाओ।",
        ),
      ],
    ],
  ),
  q8: numItem(
    t(
      "Exercise 13.3 Q8. A canal 6 m wide and 1.5 m deep flows at 10 km/h. If 8 cm of standing water is needed, in 30 minutes it irrigates",
      "प्रश्नावली 13.3 प्र8। 6 m चौड़ी और 1.5 m गहरी नहर 10 km/h से बहती है। अगर 8 cm खड़ा पानी चाहिए, तो 30 मिनट में वह सींचती है",
    ),
    "562500 m²",
    [
      [
        "45000 m²",
        t(
          "That's the water's volume in m³. Spread it 0.08 m deep.",
          "यह पानी का आयतन m³ में है। इसे 0.08 m गहरा फैलाओ।",
        ),
      ],
      [
        "1125000 m²",
        t("In 30 minutes the water moves 5 km, not 10.", "30 मिनट में पानी 5 km चलता है, 10 नहीं।"),
      ],
    ],
  ),
  q9: numItem(
    t(
      "Exercise 13.3 Q9. A pipe 20 cm across fills a tank 10 m across and 2 m deep; the water flows at 3 km/h. Filling takes",
      "प्रश्नावली 13.3 प्र9। 20 cm चौड़ा पाइप 10 m चौड़ी और 2 m गहरी टंकी भरता है; पानी 3 km/h से बहता है। भरने में लगता है",
    ),
    "100 minutes",
    [
      ["25 minutes", t("The pipe's radius is 10 cm, not 20.", "पाइप की त्रिज्या 10 cm है, 20 नहीं।")],
      ["400 minutes", t("The tank's radius is 5 m, not 10.", "टंकी की त्रिज्या 5 m है, 10 नहीं।")],
    ],
  ),
} satisfies Record<string, Item>;

/** Water pumped, earth dug and spread, water flowing at a rate. */
export const digAndFlow = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.ConvertingSolids],
});
