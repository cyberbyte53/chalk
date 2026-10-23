import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const glued = t(
  "The faces that touch go inside the solid: they aren't part of the surface any more.",
  "छूने वाले फलक ठोस के अंदर चले जाते हैं: वे अब पृष्ठ का हिस्सा नहीं।",
);
const covered = t(
  "The small solid covers a circle of the big face: take that circle away.",
  "छोटा ठोस बड़े फलक का एक वृत्त ढक लेता है: वह वृत्त घटाओ।",
);
const partMissing = t(
  "A part that shows was left out. List every surface you can see, then add.",
  "दिखने वाला एक भाग छूट गया। हर दिखने वाला पृष्ठ लिखो, फिर जोड़ो।",
);

/** Examples 1–4 and Exercise 13.1 Q1–Q4, Q6, Q7: surface areas of joined solids. */
const items = {
  ex1: numItem(
    t(
      "Example 1. A top is a cone on a hemisphere, 5 cm high in all and 3.5 cm across (π = 22/7). The area to colour is about",
      "उदाहरण 1। एक लट्टू अर्धगोले पर शंकु है, कुल 5 cm ऊँचा और 3.5 cm चौड़ा (π = 22/7)। रंगने का क्षेत्रफल लगभग है",
    ),
    "39.6 cm²",
    [
      [
        "48.4 cm²",
        t(
          "The cone isn't 5 cm high: the hemisphere takes 1.75 cm, so the cone is 3.25 cm.",
          "शंकु 5 cm ऊँचा नहीं: अर्धगोला 1.75 cm लेता है, तो शंकु 3.25 cm है।",
        ),
      ],
      ["49.2 cm²", glued],
    ],
  ),
  ex2: numItem(
    t(
      "Example 2. A cube of edge 5 cm has a hemisphere 4.2 cm across on top (π = 22/7). The block's surface area is",
      "उदाहरण 2। 5 cm किनारे वाले घन पर 4.2 cm चौड़ा अर्धगोला है (π = 22/7)। ब्लॉक का पृष्ठीय क्षेत्रफल है",
    ),
    "163.86 cm²",
    [
      ["177.72 cm²", covered],
      [
        "136.14 cm²",
        t(
          "The covered circle went, but the hemisphere's curved surface, 2πr², must be added.",
          "ढका वृत्त गया, पर अर्धगोले का वक्र पृष्ठ, 2πr², जोड़ना है।",
        ),
      ],
    ],
  ),
  ex3orange: numItem(
    t(
      "Example 3. A rocket's cone (r = 2.5 cm, l = 6.5 cm) sits on a cylinder of radius 1.5 cm. The orange area (cone and the ring of its base that shows, π = 3.14) is",
      "उदाहरण 3। रॉकेट का शंकु (r = 2.5 cm, l = 6.5 cm) त्रिज्या 1.5 cm के बेलन पर है। नारंगी क्षेत्रफल (शंकु और उसके आधार का दिखने वाला छल्ला, π = 3.14) है",
    ),
    "63.585 cm²",
    [
      ["70.650 cm²", covered],
      [
        "51.025 cm²",
        t(
          "The cone's base is wider than the cylinder, so a ring of it shows: add πr² − πr′².",
          "शंकु का आधार बेलन से चौड़ा है, तो उसका एक छल्ला दिखता है: πr² − πr′² जोड़ो।",
        ),
      ],
    ],
  ),
  ex3yellow: numItem(
    t(
      "Example 3. The rocket's cylinder is 20 cm high, radius 1.5 cm, its top under the cone. The yellow area (side and bottom, π = 3.14) is",
      "उदाहरण 3। रॉकेट का बेलन 20 cm ऊँचा है, त्रिज्या 1.5 cm, ऊपरी सिरा शंकु के नीचे। पीला क्षेत्रफल (बगल और तली, π = 3.14) है",
    ),
    "195.465 cm²",
    [
      ["202.530 cm²", glued],
      ["188.400 cm²", partMissing],
    ],
  ),
  ex4: numItem(
    t(
      "Example 4. A bird-bath is a cylinder 1.45 m high, radius 30 cm, with a hemispherical hollow in its top (π = 22/7). Its total surface area is",
      "उदाहरण 4। चिड़ियों का स्नान-पात्र 1.45 m ऊँचा, त्रिज्या 30 cm का बेलन है, ऊपर अर्धगोलाकार गड्ढा (π = 22/7)। उसका कुल पृष्ठीय क्षेत्रफल है",
    ),
    "33000 cm²",
    [
      [
        "27343 cm²",
        t(
          "The inside of the hollow is surface too: add its curved surface, 2πr².",
          "गड्ढे का अंदरूनी भाग भी पृष्ठ है: उसका वक्र पृष्ठ, 2πr², जोड़ो।",
        ),
      ],
      [
        "21686 cm²",
        t(
          "A hollow adds surface, it doesn't take it away. Add 2πr².",
          "गड्ढा पृष्ठ जोड़ता है, घटाता नहीं। 2πr² जोड़ो।",
        ),
      ],
    ],
  ),
  q1: numItem(
    t(
      "Exercise 13.1 Q1. Two cubes of volume 64 cm³ each are joined end to end. The cuboid's surface area is",
      "प्रश्नावली 13.1 प्र1। 64 cm³ आयतन के दो घन सिरे से सिरा जोड़े जाते हैं। घनाभ का पृष्ठीय क्षेत्रफल है",
    ),
    "160 cm²",
    [
      ["192 cm²", glued],
      [
        "176 cm²",
        t(
          "Each cube loses a face where they meet: two faces of 16 cm², not one.",
          "मिलने की जगह हर घन एक फलक खोता है: 16 cm² के दो फलक, एक नहीं।",
        ),
      ],
    ],
  ),
  q2: numItem(
    t(
      "Exercise 13.1 Q2. A vessel is a hollow hemisphere with a hollow cylinder on it, 14 cm across and 13 cm tall in all. Its inner surface area is",
      "प्रश्नावली 13.1 प्र2। एक बर्तन खोखला अर्धगोला है जिस पर खोखला बेलन है, 14 cm चौड़ा और कुल 13 cm ऊँचा। उसका आंतरिक पृष्ठीय क्षेत्रफल है",
    ),
    "572 cm²",
    [
      [
        "726 cm²",
        t(
          "The vessel is open at the top: there is no lid circle to add.",
          "बर्तन ऊपर से खुला है: जोड़ने को कोई ढक्कन वृत्त नहीं।",
        ),
      ],
      [
        "418 cm²",
        t("A hemisphere's curved surface is 2πr², not πr².", "अर्धगोले का वक्र पृष्ठ 2πr² है, πr² नहीं।"),
      ],
    ],
  ),
  q3: numItem(
    t(
      "Exercise 13.1 Q3. A toy is a cone of radius 3.5 cm on a hemisphere of the same radius, 15.5 cm tall in all. Its total surface area is",
      "प्रश्नावली 13.1 प्र3। एक खिलौना त्रिज्या 3.5 cm का शंकु है जो उसी त्रिज्या के अर्धगोले पर है, कुल 15.5 cm ऊँचा। उसका कुल पृष्ठीय क्षेत्रफल है",
    ),
    "214.5 cm²",
    [
      ["253.0 cm²", glued],
      ["137.5 cm²", partMissing],
    ],
  ),
  q4: numItem(
    t(
      "Exercise 13.1 Q4. A cube of side 7 cm has the largest hemisphere that fits on top. The solid's surface area is",
      "प्रश्नावली 13.1 प्र4। 7 cm भुजा वाले घन पर सबसे बड़ा अर्धगोला रखा है जो आ सके। ठोस का पृष्ठीय क्षेत्रफल है",
    ),
    "332.5 cm²",
    [
      ["371.0 cm²", covered],
      ["255.5 cm²", partMissing],
    ],
  ),
  q6: numItem(
    t(
      "Exercise 13.1 Q6. A capsule is 14 mm long and 5 mm across: a cylinder with a hemisphere on each end. Its surface area is",
      "प्रश्नावली 13.1 प्र6। एक कैप्सूल 14 mm लंबा और 5 mm चौड़ा है: बेलन जिसके हर सिरे पर अर्धगोला। उसका पृष्ठीय क्षेत्रफल है",
    ),
    "220 mm²",
    [
      [
        "299 mm²",
        t(
          "The cylinder isn't 14 mm: the two ends take 2.5 mm each, leaving 9 mm.",
          "बेलन 14 mm नहीं: दोनों सिरे 2.5 mm लेते हैं, 9 mm बचता है।",
        ),
      ],
      ["181 mm²", partMissing],
    ],
  ),
  q7: numItem(
    t(
      "Exercise 13.1 Q7. A tent is a cylinder 2.1 m high and 4 m across with a cone of slant 2.8 m on top, no floor. Canvas at ₹500 per m² costs",
      "प्रश्नावली 13.1 प्र7। एक तंबू 2.1 m ऊँचा और 4 m चौड़ा बेलन है, ऊपर 2.8 m तिर्यक वाला शंकु, फ़र्श नहीं। ₹500 प्रति m² की दर से कैनवस का मूल्य है",
    ),
    "₹22000",
    [
      [
        "₹28286",
        t("The tent has no floor: leave the base circle out.", "तंबू में फ़र्श नहीं: आधार का वृत्त छोड़ो।"),
      ],
      ["₹13200", partMissing],
    ],
  ),
} satisfies Record<string, Item>;

/** The surface area of a solid made of two or more basic solids. */
export const joinedSurface = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.SurfaceAreaOfCombinations],
});
