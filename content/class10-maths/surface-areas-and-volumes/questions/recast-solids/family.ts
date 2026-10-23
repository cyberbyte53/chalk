import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const r = String.raw;

const cubes = t(
  "Volumes add, not radii: add the cubes of the radii, then take the cube root.",
  "त्रिज्याएँ नहीं, आयतन जुड़ते हैं: त्रिज्याओं के घन जोड़ो, फिर घनमूल लो।",
);
const units = t(
  "Put every length in one unit first: 2 mm is 0.2 cm.",
  "पहले हर लंबाई एक इकाई में करो: 2 mm, 0.2 cm है।",
);

/** Examples 8 and 10, Exercise 13.3 Q1, Q2, Q5–Q7: a solid melted or reshaped into another. */
const items = {
  ex8: numItem(
    t(
      "Example 8. A clay cone 24 cm high, base radius 6 cm, is reshaped into a sphere. The sphere's radius is",
      "उदाहरण 8। 24 cm ऊँचा, आधार त्रिज्या 6 cm का मिट्टी का शंकु गोले में बदला जाता है। गोले की त्रिज्या है",
    ),
    "6.00 cm",
    [
      [
        "8.65 cm",
        t(
          "The cone's volume has a ⅓: it holds a third of its cylinder.",
          "शंकु के आयतन में ⅓ है: उसमें अपने बेलन का एक-तिहाई आता है।",
        ),
      ],
      [
        "3.78 cm",
        t(
          "The sphere is ⁴⁄₃πr³; the ⅓ belongs to the cone's side.",
          "गोला ⁴⁄₃πr³ है; ⅓ शंकु की ओर है।",
        ),
      ],
    ],
  ),
  ex10: numItem(
    t(
      "Example 10. A copper rod 1 cm across and 8 cm long is drawn into a wire 18 m long. The wire's thickness is",
      "उदाहरण 10। 1 cm चौड़ी और 8 cm लंबी तांबे की छड़ 18 m लंबे तार में खींची जाती है। तार की मोटाई है",
    ),
    r`$\tfrac{1}{15}$ cm`,
    [
      [
        r`$\tfrac{1}{30}$ cm`,
        t(
          "That's the radius. Thickness is across the wire: double it.",
          "यह त्रिज्या है। मोटाई तार के आर-पार है: दोगुना करो।",
        ),
      ],
      [
        r`$\tfrac{1}{900}$ cm`,
        t("That's r². Take the square root, then double.", "यह r² है। वर्गमूल लो, फिर दोगुना करो।"),
      ],
    ],
  ),
  q1: numItem(
    t(
      "Exercise 13.3 Q1. A metal sphere of radius 4.2 cm is recast into a cylinder of radius 6 cm. Its height is",
      "प्रश्नावली 13.3 प्र1। त्रिज्या 4.2 cm का धातु का गोला त्रिज्या 6 cm के बेलन में ढाला जाता है। उसकी ऊँचाई है",
    ),
    "2.74 cm",
    [
      ["2.06 cm", t("The sphere's volume has a ⁴⁄₃ in front.", "गोले के आयतन के आगे ⁴⁄₃ है।")],
      [
        "0.69 cm",
        t("The radius is 6 cm: divide by 6², not 12².", "त्रिज्या 6 cm है: 6² से भाग दो, 12² से नहीं।"),
      ],
    ],
  ),
  q2: numItem(
    t(
      "Exercise 13.3 Q2. Spheres of radii 6 cm, 8 cm and 10 cm are melted into one sphere. Its radius is",
      "प्रश्नावली 13.3 प्र2। त्रिज्या 6 cm, 8 cm और 10 cm के गोले पिघलाकर एक गोला बनता है। उसकी त्रिज्या है",
    ),
    "12 cm",
    [
      ["24 cm", cubes],
      ["14 cm", cubes],
    ],
  ),
  q5: numItem(
    t(
      "Exercise 13.3 Q5. Ice cream from a cylinder 12 cm across and 15 cm high fills cones 12 cm high, 6 cm across, each topped with a hemisphere. The number of cones is",
      "प्रश्नावली 13.3 प्र5। 12 cm चौड़े और 15 cm ऊँचे बेलन की आइसक्रीम 12 cm ऊँचे, 6 cm चौड़े कोनों में भरी जाती है, हर एक पर अर्धगोला। कोनों की संख्या है",
    ),
    "10",
    [
      [
        "15",
        t(
          "Each cone is topped with a hemisphere of ice cream too: add ⅔πr³.",
          "हर कोन पर आइसक्रीम का अर्धगोला भी है: ⅔πr³ जोड़ो।",
        ),
      ],
      ["7.5", t("The top is half a sphere, not a whole one.", "ऊपर आधा गोला है, पूरा नहीं।")],
    ],
  ),
  q6: numItem(
    t(
      "Exercise 13.3 Q6. Silver coins 1.75 cm across and 2 mm thick are melted into a cuboid 5.5 cm × 10 cm × 3.5 cm. The number of coins is",
      "प्रश्नावली 13.3 प्र6। 1.75 cm चौड़े और 2 mm मोटे चाँदी के सिक्के पिघलाकर 5.5 cm × 10 cm × 3.5 cm का घनाभ बनाया जाता है। सिक्कों की संख्या है",
    ),
    "400",
    [
      ["40", units],
      [
        "100",
        t("1.75 cm is the diameter: the radius is 0.875 cm.", "1.75 cm व्यास है: त्रिज्या 0.875 cm है।"),
      ],
    ],
  ),
  q7: numItem(
    t(
      "Exercise 13.3 Q7. A bucket 32 cm high, base radius 18 cm, full of sand is emptied into a conical heap 24 cm high. The heap's radius and slant height are",
      "प्रश्नावली 13.3 प्र7। 32 cm ऊँची, आधार त्रिज्या 18 cm की रेत भरी बाल्टी 24 cm ऊँचे शंक्वाकार ढेर में ख़ाली की जाती है। ढेर की त्रिज्या और तिर्यक ऊँचाई हैं",
    ),
    r`$r = 36$ cm, $l = 12\sqrt{13}$ cm`,
    [
      [
        r`$r = 36$ cm, $l = 60$ cm`,
        t("The slant is √(r² + h²), not r + h.", "तिर्यक √(r² + h²) है, r + h नहीं।"),
      ],
      [
        r`$r = 12\sqrt{3}$ cm, $l = 12\sqrt{7}$ cm`,
        t("The heap is a cone: its volume has a ⅓.", "ढेर शंकु है: उसके आयतन में ⅓ है।"),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** A solid melted, recast or reshaped: volume before = volume after. */
export const recastSolids = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.ConvertingSolids],
});
