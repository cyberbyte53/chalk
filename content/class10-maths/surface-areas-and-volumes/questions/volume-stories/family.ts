import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem, wordItem } from "../../kit";

/** Exercise 13.2 Q5–Q8, and the rule that volumes add. */
const items = {
  q5: numItem(
    t(
      "Exercise 13.2 Q5. An inverted cone 8 cm high, radius 5 cm, is full of water. Lead shots of radius 0.5 cm are dropped in until a quarter of the water flows out. The number of shots is",
      "प्रश्नावली 13.2 प्र5। 8 cm ऊँचा, त्रिज्या 5 cm का उल्टा शंकु पानी से भरा है। त्रिज्या 0.5 cm के सीसे के छर्रे तब तक डाले जाते हैं जब तक चौथाई पानी बाहर न बह जाए। छर्रों की संख्या है",
    ),
    "100",
    [
      [
        "400",
        t(
          "That's the whole cone's water. Only a quarter flowed out, and that's what the shots fill.",
          "यह पूरे शंकु का पानी है। केवल चौथाई बाहर बहा, और छर्रे उतनी ही जगह भरते हैं।",
        ),
      ],
      [
        "300",
        t(
          "Three quarters of the water stayed in. The shots push out one quarter.",
          "तीन-चौथाई पानी अंदर रहा। छर्रे एक चौथाई बाहर धकेलते हैं।",
        ),
      ],
    ],
  ),
  q6: numItem(
    t(
      "Exercise 13.2 Q6. An iron pole is a cylinder 220 cm high, 24 cm across, with a cylinder 60 cm high, radius 8 cm on top; iron is 8 g per cm³ (π = 3.14). Its mass is",
      "प्रश्नावली 13.2 प्र6। लोहे का खंभा 220 cm ऊँचा, 24 cm चौड़ा बेलन है, ऊपर 60 cm ऊँचा, त्रिज्या 8 cm का बेलन; लोहा 8 g प्रति cm³ है (π = 3.14)। उसका द्रव्यमान है",
    ),
    "892.26 kg",
    [
      [
        "3279.66 kg",
        t("24 cm is the diameter: the radius is 12 cm.", "24 cm व्यास है: त्रिज्या 12 cm है।"),
      ],
      [
        "111.53 kg",
        t("Each cm³ is 8 g: multiply the volume by 8.", "हर cm³ 8 g है: आयतन को 8 से गुणा करो।"),
      ],
    ],
  ),
  q7: numItem(
    t(
      "Exercise 13.2 Q7. A cone 120 cm high on a hemisphere, both radius 60 cm, is stood in a cylinder of radius 60 cm and height 180 cm full of water. The water left is",
      "प्रश्नावली 13.2 प्र7। 120 cm ऊँचा शंकु एक अर्धगोले पर, दोनों त्रिज्या 60 cm, त्रिज्या 60 cm और ऊँचाई 180 cm के पानी भरे बेलन में खड़ा किया जाता है। बचा पानी है",
    ),
    "1131428.57 cm³",
    [
      [
        "2036571.43 cm³",
        t(
          "That's the cylinder full. The solid pushes its own volume of water out.",
          "यह भरा बेलन है। ठोस अपने आयतन जितना पानी बाहर धकेलता है।",
        ),
      ],
      [
        "1584000.00 cm³",
        t(
          "The hemisphere is part of the solid too: take both parts away.",
          "अर्धगोला भी ठोस का भाग है: दोनों भाग घटाओ।",
        ),
      ],
    ],
  ),
  q8: wordItem(
    t(
      "Exercise 13.2 Q8. A round flask (sphere 8.5 cm across) has a neck 8 cm long, 2 cm across (π = 3.14). A child says it holds 345 cm³. Is she correct?",
      "प्रश्नावली 13.2 प्र8। एक गोल फ़्लास्क (गोला 8.5 cm चौड़ा) की गर्दन 8 cm लंबी, 2 cm चौड़ी है (π = 3.14)। एक बच्ची कहती है इसमें 345 cm³ आता है। क्या वह सही है?",
    ),
    t("No: it holds 346.51 cm³", "नहीं: इसमें 346.51 cm³ आता है"),
    [
      [
        t("Yes: it holds 345.00 cm³", "हाँ: इसमें 345.00 cm³ आता है"),
        t("Work it out: sphere 321.39 plus neck 25.12.", "हल करो: गोला 321.39 और गर्दन 25.12।"),
      ],
      [
        t("No: it holds 321.39 cm³", "नहीं: इसमें 321.39 cm³ आता है"),
        t(
          "That's the sphere alone. Add the neck, a cylinder.",
          "यह केवल गोला है। गर्दन, एक बेलन, जोड़ो।",
        ),
      ],
    ],
  ),
  rule: wordItem(
    t(
      "Two solids are joined face to face. The volume of the new solid is",
      "दो ठोस फलक से फलक जोड़े जाते हैं। नए ठोस का आयतन है",
    ),
    t("The sum of the two volumes", "दोनों आयतनों का योग"),
    [
      [
        t("The sum, less the glued faces", "योग, चिपके फलक घटाकर"),
        t(
          "Faces are areas, not space. Joining hides faces, but no space is lost.",
          "फलक क्षेत्रफल हैं, जगह नहीं। जोड़ने से फलक छिपते हैं, पर जगह नहीं घटती।",
        ),
      ],
      [
        t("The larger of the two volumes", "दोनों आयतनों में बड़ा"),
        t("Both parts take up space, so both count.", "दोनों भाग जगह लेते हैं, तो दोनों गिने जाते हैं।"),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Volumes of joined solids in real problems: mass, water left, a capacity check. */
export const volumeStories = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.VolumeOfCombinations],
});
