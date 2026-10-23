import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const r = String.raw;

const glued = t(
  "The two bases are glued together inside the double cone: no circles show.",
  "दोनों आधार दोहरे शंकु के अंदर चिपके हैं: कोई वृत्त नहीं दिखता।",
);

/** Exercise 13.5 Q1–Q5. */
const items = {
  q1length: numItem(
    t(
      "Exercise 13.5 Q1. Copper wire 3 mm across is wound side by side round a cylinder 12 cm long and 10 cm across. The wire's length is",
      "प्रश्नावली 13.5 प्र1। 3 mm चौड़ा तांबे का तार 12 cm लंबे और 10 cm चौड़े बेलन पर सटाकर लपेटा जाता है। तार की लंबाई है",
    ),
    "1257.14 cm",
    [
      [
        "2514.29 cm",
        t(
          "Each turn takes the wire's full thickness, 3 mm: 40 turns, not 80.",
          "हर चक्कर तार की पूरी मोटाई, 3 mm, लेता है: 40 चक्कर, 80 नहीं।",
        ),
      ],
      [
        "628.57 cm",
        t(
          "Each turn is the circumference, 2πr = π × 10, not πr.",
          "हर चक्कर परिधि है, 2πr = π × 10, πr नहीं।",
        ),
      ],
    ],
  ),
  q1mass: numItem(
    t(
      "Exercise 13.5 Q1. The wire (radius 0.15 cm, length 1257.14 cm, π = 3.14) is copper of 8.88 g per cm³. Its mass is about",
      "प्रश्नावली 13.5 प्र1। तार (त्रिज्या 0.15 cm, लंबाई 1257.14 cm, π = 3.14) 8.88 g प्रति cm³ का तांबा है। उसका द्रव्यमान लगभग है",
    ),
    "788 g",
    [
      [
        "89 g",
        t(
          "That's the volume in cm³. Multiply by 8.88 g for the mass.",
          "यह आयतन cm³ में है। द्रव्यमान के लिए 8.88 g से गुणा करो।",
        ),
      ],
      [
        "3155 g",
        t(
          "The wire is 3 mm across: its radius is 0.15 cm, not 0.3 cm.",
          "तार 3 mm चौड़ा है: त्रिज्या 0.15 cm है, 0.3 cm नहीं।",
        ),
      ],
    ],
  ),
  q2volume: numItem(
    t(
      "Exercise 13.5 Q2. A right triangle with sides 3 cm and 4 cm spins about its hypotenuse (π = 3.14). The double cone's volume is",
      "प्रश्नावली 13.5 प्र2। 3 cm और 4 cm भुजाओं वाला समकोण त्रिभुज अपने कर्ण के परितः घूमता है (π = 3.14)। दोहरे शंकु का आयतन है",
    ),
    "30.14 cm³",
    [
      [
        "47.10 cm³",
        t(
          "The radius is the height onto the hypotenuse, 12/5 = 2.4 cm, not a side.",
          "त्रिज्या कर्ण पर लंब है, 12/5 = 2.4 cm, कोई भुजा नहीं।",
        ),
      ],
      ["90.43 cm³", t("Each cone's volume has a ⅓.", "हर शंकु के आयतन में ⅓ है।")],
    ],
  ),
  q2surface: numItem(
    t(
      "Exercise 13.5 Q2. The double cone has radius 2.4 cm and slant heights 3 cm and 4 cm (π = 3.14). Its surface area is",
      "प्रश्नावली 13.5 प्र2। दोहरे शंकु की त्रिज्या 2.4 cm और तिर्यक ऊँचाइयाँ 3 cm और 4 cm हैं (π = 3.14)। उसका पृष्ठीय क्षेत्रफल है",
    ),
    "52.75 cm²",
    [
      ["70.83 cm²", glued],
      [
        "37.68 cm²",
        t(
          "The slant heights are the sides 3 and 4, not the hypotenuse 5.",
          "तिर्यक ऊँचाइयाँ भुजाएँ 3 और 4 हैं, कर्ण 5 नहीं।",
        ),
      ],
    ],
  ),
  q3: numItem(
    t(
      "Exercise 13.5 Q3. A cistern 150 cm × 120 cm × 110 cm has 129600 cm³ of water. Bricks 22.5 cm × 7.5 cm × 6.5 cm, each soaking up 1/17 of its volume, are put in till it's full. The number of bricks is",
      "प्रश्नावली 13.5 प्र3। 150 cm × 120 cm × 110 cm की टंकी में 129600 cm³ पानी है। 22.5 cm × 7.5 cm × 6.5 cm की ईंटें, हर एक अपने आयतन का 1/17 सोखती, भरने तक डाली जाती हैं। ईंटों की संख्या है",
    ),
    "1792",
    [
      [
        "1687",
        t(
          "Each brick soaks up some water, so it raises the level by only 16/17 of its volume.",
          "हर ईंट कुछ पानी सोखती है, तो वह स्तर को अपने आयतन के केवल 16/17 से उठाती है।",
        ),
      ],
      [
        "1917",
        t(
          "The cistern already holds 129600 cm³: only the empty part is for bricks.",
          "टंकी में पहले से 129600 cm³ है: ईंटों के लिए केवल ख़ाली भाग है।",
        ),
      ],
    ],
  ),
  q4: numItem(
    t(
      "Exercise 13.5 Q4. 10 cm of rain falls on a valley of 7280 km². The rain's volume is",
      "प्रश्नावली 13.5 प्र4। 7280 km² की घाटी में 10 cm वर्षा होती है। वर्षा का आयतन है",
    ),
    "0.728 km³",
    [
      [
        "7.280 km³",
        t("10 cm is 0.0001 km (100000 cm in a km).", "10 cm, 0.0001 km है (एक km में 100000 cm)।"),
      ],
      ["0.073 km³", t("10 cm is 0.0001 km: 7280 × 0.0001.", "10 cm, 0.0001 km है: 7280 × 0.0001।")],
    ],
  ),
  q5: numItem(
    t(
      "Exercise 13.5 Q5. An oil funnel is a cylinder 10 cm long, 8 cm across, with a frustum on top; 22 cm tall in all, 18 cm across at the top. The tin sheet is",
      "प्रश्नावली 13.5 प्र5। तेल की कीप 10 cm लंबा, 8 cm चौड़ा बेलन है, ऊपर छिन्नक; कुल 22 cm ऊँची, ऊपर 18 cm चौड़ी। टिन की चादर है",
    ),
    r`$782\tfrac{4}{7}$ cm²`,
    [
      [
        r`$1087\tfrac{3}{7}$ cm²`,
        t("A funnel is open at both ends: no circles.", "कीप दोनों सिरों पर खुली है: कोई वृत्त नहीं।"),
      ],
      [
        r`$531\tfrac{1}{7}$ cm²`,
        t(
          "That's the frustum alone: add the cylinder's curved side.",
          "यह केवल छिन्नक है: बेलन की वक्र दीवार जोड़ो।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Exercise 13.5: problems that mix the chapter's ideas. */
export const challengeMix = bankFamily(items, {
  level: Level.Hard,
  tests: [Concept.ChallengeAndFinale],
});
