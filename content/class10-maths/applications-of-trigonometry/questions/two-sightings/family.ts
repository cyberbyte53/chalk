import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** Two angles, two right triangles: Examples 4–5, Exercise 9.1 Q6–Q11 and Q14. */
const items = {
  ex4flag: numItem(
    t(
      "Example 4: from P, a 10 m building's top is at 30° and the top of a flagstaff on it at 45°. How long is the flagstaff?",
      "उदाहरण 4: P से 10 m ऊँची इमारत का शीर्ष 30° पर और उस पर लगे झंडे के खंभे का शीर्ष 45° पर है। खंभा कितना लंबा है?",
    ),
    "10(√3 − 1) m",
    [
      [
        "10√3 m",
        t(
          "10√3 is the distance AP, and also the height to the flag top. Take away the 10 m building.",
          "10√3 दूरी AP है, और झंडे के शीर्ष तक की ऊँचाई भी। 10 m की इमारत घटाओ।",
        ),
      ],
      [
        "10(√3 + 1) m",
        t(
          "The flagstaff is the top part only: 10√3 − 10, a minus.",
          "खंभा केवल ऊपर का हिस्सा है: 10√3 − 10, ऋण।",
        ),
      ],
    ],
  ),
  ex4dist: numItem(
    t(
      "Example 4 again: how far is the 10 m building from P, if its top is at 30°?",
      "फिर उदाहरण 4: अगर 10 m ऊँची इमारत का शीर्ष 30° पर है, तो वह P से कितनी दूर है?",
    ),
    "10√3 m",
    [
      [
        "10/√3 m",
        t(
          "tan 30° = 10/AP gives AP = 10/tan 30° = 10√3.",
          "tan 30° = 10/AP से AP = 10/tan 30° = 10√3।",
        ),
      ],
      [
        "20 m",
        t(
          "20 = 10/sin 30° is the line of sight PB, not the ground distance PA.",
          "20 = 10/sin 30° दृष्टि रेखा PB है, ज़मीन की दूरी PA नहीं।",
        ),
      ],
    ],
  ),
  ex5: numItem(
    t(
      "Example 5: a tower's shadow is 40 m longer when the Sun's altitude is 30° than when it is 60°. How tall is the tower?",
      "उदाहरण 5: सूर्य का उन्नतांश 30° होने पर मीनार की परछाई 60° की तुलना में 40 m ज़्यादा लंबी है। मीनार कितनी ऊँची है?",
    ),
    "20√3 m",
    [
      [
        "20 m",
        t(
          "20 m is x, the short shadow. The height is h = x√3.",
          "20 m छोटी परछाई x है। ऊँचाई h = x√3 है।",
        ),
      ],
      [
        "40√3 m",
        t(
          "From 3x = x + 40, x = 20, not 40. Then h = 20√3.",
          "3x = x + 40 से x = 20 है, 40 नहीं। तब h = 20√3।",
        ),
      ],
    ],
  ),
  q6: numItem(
    t(
      "Exercise 9.1 Q6: a 1.5 m boy walks towards a 30 m building; the elevation of its top rises from 30° to 60°. How far did he walk?",
      "प्रश्नावली 9.1 प्र6: 1.5 m लंबा लड़का 30 m ऊँची इमारत की ओर चलता है; शीर्ष का उन्नयन 30° से 60° हो जाता है। वह कितना चला?",
    ),
    "19√3 m",
    [
      [
        "20√3 m",
        t(
          "Use the height above his eye, 28.5 m, not 30 m.",
          "उसकी आँख के ऊपर की ऊँचाई, 28.5 m, लो, 30 m नहीं।",
        ),
      ],
      [
        "28.5√3 m",
        t(
          "That's his starting distance. He walked 28.5√3 − 28.5/√3 = 19√3.",
          "यह उसकी शुरुआती दूरी है। वह चला 28.5√3 − 28.5/√3 = 19√3।",
        ),
      ],
    ],
  ),
  q7: numItem(
    t(
      "Exercise 9.1 Q7: a tower is on a 20 m building. From a point, the bottom of the tower is at 45° and its top at 60°. How tall is the tower?",
      "प्रश्नावली 9.1 प्र7: 20 m ऊँची इमारत पर एक टावर है। एक बिंदु से टावर का निचला सिरा 45° पर और शीर्ष 60° पर है। टावर कितना ऊँचा है?",
    ),
    "20(√3 − 1) m",
    [
      [
        "20√3 m",
        t(
          "20√3 is the building plus the tower. Subtract the 20 m building.",
          "20√3 इमारत और टावर मिलाकर है। 20 m की इमारत घटाओ।",
        ),
      ],
      [
        "20 m",
        t(
          "20 m is the building, and the distance (tan 45° = 1). The tower is 20√3 − 20.",
          "20 m इमारत है, और दूरी भी (tan 45° = 1)। टावर 20√3 − 20 है।",
        ),
      ],
    ],
  ),
  q8: numItem(
    t(
      "Exercise 9.1 Q8: a 1.6 m statue stands on a pedestal. From a point, the statue's top is at 60° and the pedestal's top at 45°. How tall is the pedestal?",
      "प्रश्नावली 9.1 प्र8: 1.6 m ऊँची मूर्ति एक चबूतरे पर है। एक बिंदु से मूर्ति का शीर्ष 60° पर और चबूतरे का शीर्ष 45° पर है। चबूतरा कितना ऊँचा है?",
    ),
    "0.8(√3 + 1) m",
    [
      [
        "0.8(√3 − 1) m",
        t(
          "h = 1.6/(√3 − 1); rationalising multiplies by √3 + 1, so the sign turns to plus: 0.8(√3 + 1).",
          "h = 1.6/(√3 − 1); परिमेयकरण में √3 + 1 से गुणा होता है, तो चिह्न धन हो जाता है: 0.8(√3 + 1)।",
        ),
      ],
      [
        "1.6√3 m",
        t(
          "From h√3 = h + 1.6, h(√3 − 1) = 1.6, so h = 1.6/(√3 − 1), not 1.6√3.",
          "h√3 = h + 1.6 से h(√3 − 1) = 1.6, तो h = 1.6/(√3 − 1), 1.6√3 नहीं।",
        ),
      ],
    ],
  ),
  q9: numItem(
    t(
      "Exercise 9.1 Q9: a building's top is at 30° from the tower's foot; the 50 m tower's top is at 60° from the building's foot. How tall is the building?",
      "प्रश्नावली 9.1 प्र9: टावर के आधार से इमारत का शीर्ष 30° पर है; इमारत के आधार से 50 m ऊँचे टावर का शीर्ष 60° पर। इमारत कितनी ऊँची है?",
    ),
    "50/3 m",
    [
      [
        "50/√3 m",
        t(
          "50/√3 is the distance between them. The building is that × tan 30° = 50/3.",
          "50/√3 उनके बीच की दूरी है। इमारत = उसका × tan 30° = 50/3।",
        ),
      ],
      [
        "50√3 m",
        t(
          "The building is shorter than the tower, since its top is seen at a smaller angle.",
          "इमारत टावर से छोटी है, क्योंकि उसका शीर्ष छोटे कोण पर दिखता है।",
        ),
      ],
    ],
  ),
  q10: numItem(
    t(
      "Exercise 9.1 Q10: equal poles stand on either side of an 80 m road. From a point between, their tops are at 60° and 30°. How tall are the poles?",
      "प्रश्नावली 9.1 प्र10: 80 m चौड़ी सड़क के दोनों ओर बराबर ऊँचाई के खंभे हैं। बीच के एक बिंदु से उनके शीर्ष 60° और 30° पर हैं। खंभे कितने ऊँचे हैं?",
    ),
    "20√3 m",
    [
      [
        "40√3 m",
        t(
          "From x√3 = (80 − x)/√3, 3x = 80 − x, so x = 20 and h = 20√3.",
          "x√3 = (80 − x)/√3 से 3x = 80 − x, तो x = 20 और h = 20√3।",
        ),
      ],
      [
        "40/√3 m",
        t(
          "That assumes the point is in the middle. The angles differ, so it isn't: x = 20.",
          "इसमें बिंदु को बीच में मान लिया। कोण अलग हैं, इसलिए वह बीच में नहीं: x = 20।",
        ),
      ],
    ],
  ),
  q10where: numItem(
    t(
      "Exercise 9.1 Q10 again: how far is the point from each pole?",
      "फिर प्रश्नावली 9.1 प्र10: बिंदु हर खंभे से कितनी दूर है?",
    ),
    "20 m and 60 m",
    [
      [
        "40 m and 40 m",
        t(
          "Equal distances would give equal angles. With 60° and 30°, x = 20 and 80 − x = 60.",
          "बराबर दूरी पर कोण भी बराबर होते। 60° और 30° के साथ x = 20 और 80 − x = 60।",
        ),
      ],
      [
        "30 m and 50 m",
        t(
          "Solve 3x = 80 − x: x = 20, so the distances are 20 m and 60 m.",
          "3x = 80 − x हल करो: x = 20, तो दूरियाँ 20 m और 60 m हैं।",
        ),
      ],
    ],
  ),
  q11: numItem(
    t(
      "Exercise 9.1 Q11: a TV tower on a canal bank is at 60° from the opposite bank and at 30° from 20 m farther back. How tall is the tower?",
      "प्रश्नावली 9.1 प्र11: नहर के किनारे का टीवी टावर सामने वाले किनारे से 60° पर और 20 m और पीछे से 30° पर है। टावर कितना ऊँचा है?",
    ),
    "10√3 m",
    [
      [
        "20√3 m",
        t(
          "3x = x + 20 gives x = 10 (the canal), so h = 10√3.",
          "3x = x + 20 से x = 10 (नहर), तो h = 10√3।",
        ),
      ],
      [
        "10 m",
        t("10 m is the width of the canal. The height is x√3.", "10 m नहर की चौड़ाई है। ऊँचाई x√3 है।"),
      ],
    ],
  ),
  q14: numItem(
    t(
      "Exercise 9.1 Q14: a 1.2 m girl sees a balloon, 88.2 m up on a level path, first at 60° then at 30°. How far did it travel?",
      "प्रश्नावली 9.1 प्र14: 1.2 m लंबी लड़की 88.2 m ऊँचाई पर समतल रास्ते पर चलते गुब्बारे को पहले 60° पर फिर 30° पर देखती है। वह कितना चला?",
    ),
    "58√3 m",
    [
      [
        "87√3 m",
        t(
          "87√3 is its second distance. It travelled 87√3 − 87/√3 = 58√3.",
          "87√3 उसकी दूसरी दूरी है। वह चला 87√3 − 87/√3 = 58√3।",
        ),
      ],
      [
        "58.8√3 m",
        t(
          "Use 88.2 − 1.2 = 87 m above her eye, not the full 88.2 m.",
          "उसकी आँख के ऊपर 88.2 − 1.2 = 87 m लो, पूरा 88.2 m नहीं।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Two angles, two right triangles that share a side: solve together. */
export const twoSightings = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.TwoObservations],
});
