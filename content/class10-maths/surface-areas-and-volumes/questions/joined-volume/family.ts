import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const takeAway = t(
  "A raised or hollowed part holds nothing: take its volume away.",
  "उभरा या खोखला भाग कुछ नहीं रखता: उसका आयतन घटाओ।",
);
const radius = t(
  "That used the diameter as the radius. Halve it first.",
  "इसमें व्यास को त्रिज्या लिया। पहले आधा करो।",
);
const partLength = t(
  "The ends use up part of the length: find the middle part's length first.",
  "सिरे लंबाई का कुछ भाग लेते हैं: पहले बीच के भाग की लंबाई निकालो।",
);

/** Examples 5–7 and Exercise 13.2 Q1–Q4: volumes of joined solids. */
const items = {
  ex5: numItem(
    t(
      "Example 5. A shed is a cuboid 15 m × 7 m × 8 m with a half cylinder (diameter 7 m, length 15 m) on top (π = 22/7). The air it holds is",
      "उदाहरण 5। एक शेड 15 m × 7 m × 8 m का घनाभ है जिसके ऊपर आधा बेलन (व्यास 7 m, लंबाई 15 m) है (π = 22/7)। उसमें हवा है",
    ),
    "1128.75 m³",
    [
      [
        "1417.50 m³",
        t("The roof is half a cylinder: take half of πr²h.", "छत आधा बेलन है: πr²h का आधा लो।"),
      ],
      ["1995.00 m³", radius],
    ],
  ),
  ex5air: numItem(
    t(
      "Example 5. The shed holds 1128.75 m³. Machinery takes 300 m³ and 20 workers take 0.08 m³ each. The air left is",
      "उदाहरण 5। शेड में 1128.75 m³ आता है। मशीनें 300 m³ लेती हैं और 20 मज़दूर 0.08 m³ हर एक। बची हवा है",
    ),
    "827.15 m³",
    [
      [
        "828.75 m³",
        t(
          "The workers take space too: 20 × 0.08 = 1.6 m³.",
          "मज़दूर भी जगह लेते हैं: 20 × 0.08 = 1.6 m³।",
        ),
      ],
      [
        "1127.15 m³",
        t("The machinery's 300 m³ must come off as well.", "मशीनों के 300 m³ भी घटाने हैं।"),
      ],
    ],
  ),
  ex6: numItem(
    t(
      "Example 6. A glass is a cylinder 10 cm high, 5 cm across inside, with a raised hemisphere in its bottom (π = 3.14). Its actual capacity is",
      "उदाहरण 6। एक गिलास 10 cm ऊँचा, अंदर से 5 cm चौड़ा बेलन है, तली में उभरा अर्धगोला (π = 3.14)। उसकी असली धारिता है",
    ),
    "163.54 cm³",
    [
      ["196.25 cm³", takeAway],
      [
        "130.83 cm³",
        t(
          "That took away a whole sphere. The raised part is a hemisphere: ⅔πr³.",
          "इसमें पूरा गोला घटाया। उभरा भाग अर्धगोला है: ⅔πr³।",
        ),
      ],
    ],
  ),
  ex7: numItem(
    t(
      "Example 7. A toy is a cone 2 cm high on a hemisphere 4 cm across; a cylinder just fits round it (π = 3.14). The cylinder's volume minus the toy's is",
      "उदाहरण 7। एक खिलौना 4 cm चौड़े अर्धगोले पर 2 cm ऊँचा शंकु है; एक बेलन उसके चारों ओर ठीक बैठता है (π = 3.14)। बेलन का आयतन घटा खिलौने का आयतन है",
    ),
    "25.12 cm³",
    [
      [
        "50.24 cm³",
        t(
          "That's the whole cylinder. Take the toy's volume away from it.",
          "यह पूरा बेलन है। उसमें से खिलौने का आयतन घटाओ।",
        ),
      ],
      [
        "8.37 cm³",
        t(
          "The toy has half a sphere, ⅔πr³, not a whole one.",
          "खिलौने में आधा गोला, ⅔πr³, है, पूरा नहीं।",
        ),
      ],
    ],
  ),
  q1: numItem(
    t(
      "Exercise 13.2 Q1. A cone stands on a hemisphere, both of radius 1 cm, the cone 1 cm high. The volume is",
      "प्रश्नावली 13.2 प्र1। एक शंकु अर्धगोले पर खड़ा है, दोनों की त्रिज्या 1 cm, शंकु 1 cm ऊँचा। आयतन है",
    ),
    "π cm³",
    [
      [
        "5π/3 cm³",
        t(
          "That used a whole sphere. The base is a hemisphere: ⅔πr³.",
          "इसमें पूरा गोला लिया। आधार अर्धगोला है: ⅔πr³।",
        ),
      ],
      [
        "π/3 cm³",
        t(
          "That's the cone alone. Volumes add: include the hemisphere.",
          "यह केवल शंकु है। आयतन जुड़ते हैं: अर्धगोला भी लो।",
        ),
      ],
    ],
  ),
  q2: numItem(
    t(
      "Exercise 13.2 Q2. A model is a cylinder with a cone at each end, 3 cm across, 12 cm long in all, each cone 2 cm high. The air inside is",
      "प्रश्नावली 13.2 प्र2। एक मॉडल बेलन है जिसके हर सिरे पर शंकु है, 3 cm चौड़ा, कुल 12 cm लंबा, हर शंकु 2 cm ऊँचा। अंदर हवा है",
    ),
    "66 cm³",
    [
      ["94 cm³", partLength],
      [
        "85 cm³",
        t("A cone holds a third of its cylinder: ⅓πr²h.", "शंकु में अपने बेलन का एक-तिहाई आता है: ⅓πr²h।"),
      ],
    ],
  ),
  q3: numItem(
    t(
      "Exercise 13.2 Q3. 45 gulab jamuns, each a cylinder with hemispherical ends, 5 cm long and 2.8 cm across, are 30% syrup. The syrup is about",
      "प्रश्नावली 13.2 प्र3। 45 गुलाब जामुन, हर एक अर्धगोलाकार सिरों वाला बेलन, 5 cm लंबा और 2.8 cm चौड़ा, 30% चाशनी हैं। चाशनी लगभग है",
    ),
    "338 cm³",
    [
      [
        "1127 cm³",
        t(
          "That's all 45 jamuns. Only 30% of it is syrup.",
          "यह सारे 45 जामुन हैं। उसका केवल 30% चाशनी है।",
        ),
      ],
      ["571 cm³", partLength],
    ],
  ),
  q4: numItem(
    t(
      "Exercise 13.2 Q4. A pen stand is a cuboid 15 cm × 10 cm × 3.5 cm with four conical holes, each radius 0.5 cm and depth 1.4 cm. The wood in it is",
      "प्रश्नावली 13.2 प्र4। एक पेन स्टैंड 15 cm × 10 cm × 3.5 cm का घनाभ है जिसमें चार शंक्वाकार गड्ढे हैं, हर एक त्रिज्या 0.5 cm और गहराई 1.4 cm। उसमें लकड़ी है",
    ),
    "523.53 cm³",
    [
      ["525.00 cm³", takeAway],
      [
        "520.60 cm³",
        t(
          "The holes are cones, a third of a cylinder: ⅓πr²h each.",
          "गड्ढे शंकु हैं, बेलन का एक-तिहाई: हर एक ⅓πr²h।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** The volume of a solid made of basic solids. */
export const joinedVolume = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.VolumeOfCombinations],
});
