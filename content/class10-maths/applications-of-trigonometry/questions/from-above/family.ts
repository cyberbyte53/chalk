import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** Looking down from a height: Examples 6–7, Exercise 9.1 Q12, Q13 and Q15. */
const items = {
  ex6: numItem(
    t(
      "Example 6: from a tall building's top, an 8 m building's top and bottom are at depressions of 30° and 45°. How tall is the tall building?",
      "उदाहरण 6: एक ऊँची इमारत के शीर्ष से 8 m ऊँची इमारत का शीर्ष और आधार 30° और 45° अवनमन पर हैं। ऊँची इमारत कितनी ऊँची है?",
    ),
    "4(3 + √3) m",
    [
      [
        "4(√3 + 1) m",
        t(
          "4(√3 + 1) is PD, the part above the small building's top. Add the 8 m: 4(3 + √3).",
          "4(√3 + 1), PD है, छोटी इमारत के शीर्ष के ऊपर का हिस्सा। 8 m जोड़ो: 4(3 + √3)।",
        ),
      ],
      [
        "8(√3 + 1) m",
        t(
          "PD = 8/(√3 − 1) = 8(√3 + 1)/2 = 4(√3 + 1). The 2 from rationalising was dropped.",
          "PD = 8/(√3 − 1) = 8(√3 + 1)/2 = 4(√3 + 1)। परिमेयकरण वाला 2 छूट गया।",
        ),
      ],
    ],
  ),
  ex7: numItem(
    t(
      "Example 7: from a bridge 3 m above the banks, the banks on opposite sides are at depressions of 30° and 45°. How wide is the river?",
      "उदाहरण 7: किनारों से 3 m ऊँचे पुल से विपरीत ओर के किनारे 30° और 45° अवनमन पर हैं। नदी कितनी चौड़ी है?",
    ),
    "3(√3 + 1) m",
    [
      [
        "3(√3 − 1) m",
        t(
          "The banks are on opposite sides, so the two pieces add: 3√3 + 3.",
          "किनारे विपरीत ओर हैं, इसलिए दोनों टुकड़े जुड़ते हैं: 3√3 + 3।",
        ),
      ],
      [
        "3√3 m",
        t(
          "3√3 m is only AD, the 30° side. Add DB = 3 m from the 45° side.",
          "3√3 m केवल AD है, 30° वाली ओर। 45° वाली ओर से DB = 3 m जोड़ो।",
        ),
      ],
    ],
  ),
  q12: numItem(
    t(
      "Exercise 9.1 Q12: from a 7 m building's top, a cable tower's top is at an elevation of 60° and its foot at a depression of 45°. How tall is the tower?",
      "प्रश्नावली 9.1 प्र12: 7 m ऊँची इमारत के शीर्ष से एक केबल टावर का शीर्ष 60° उन्नयन पर और आधार 45° अवनमन पर है। टावर कितना ऊँचा है?",
    ),
    "7(√3 + 1) m",
    [
      [
        "7√3 m",
        t(
          "7√3 is only the part above the building's top. Add the 7 m below it.",
          "7√3 केवल इमारत के शीर्ष के ऊपर का हिस्सा है। नीचे का 7 m जोड़ो।",
        ),
      ],
      [
        "14 m",
        t(
          "The 45° gives the distance, 7 m. The part above is 7 tan 60° = 7√3, not another 7.",
          "45° से दूरी मिलती है, 7 m। ऊपर का हिस्सा 7 tan 60° = 7√3 है, एक और 7 नहीं।",
        ),
      ],
    ],
  ),
  q13: numItem(
    t(
      "Exercise 9.1 Q13: from a 75 m lighthouse, two ships one behind the other are at depressions of 30° and 45°. How far apart are they?",
      "प्रश्नावली 9.1 प्र13: 75 m ऊँचे प्रकाश-स्तंभ से एक के पीछे दूसरा, दो जहाज़ 30° और 45° अवनमन पर हैं। वे कितनी दूर हैं?",
    ),
    "75(√3 − 1) m",
    [
      [
        "75(√3 + 1) m",
        t(
          "Both ships are on the same side, so subtract: 75√3 − 75.",
          "दोनों जहाज़ एक ही ओर हैं, इसलिए घटाओ: 75√3 − 75।",
        ),
      ],
      [
        "75√3 m",
        t(
          "75√3 m is how far the farther ship is. The gap is 75√3 − 75.",
          "75√3 m दूर वाले जहाज़ की दूरी है। अंतर 75√3 − 75 है।",
        ),
      ],
    ],
  ),
  q15: numItem(
    t(
      "Exercise 9.1 Q15: from a tower's top, a car approaching at steady speed moves from 30° to 60° depression in 6 s. How long until it reaches the foot?",
      "प्रश्नावली 9.1 प्र15: मीनार के शीर्ष से, स्थिर चाल से आती कार 6 s में 30° से 60° अवनमन पर आ जाती है। आधार तक पहुँचने में कितना समय और लगेगा?",
    ),
    "3 s",
    [
      [
        "6 s",
        t(
          "What's left, h/√3, is half the first stretch, 2h/√3. Half the distance, half the time.",
          "बचा हुआ, h/√3, पहले हिस्से 2h/√3 का आधा है। आधी दूरी, आधा समय।",
        ),
      ],
      [
        "2 s",
        t(
          "The ratio is 1 : 2, not 1 : 3: (h/√3) ÷ (2h/√3) = ½, so 6 × ½ = 3 s.",
          "अनुपात 1 : 2 है, 1 : 3 नहीं: (h/√3) ÷ (2h/√3) = ½, तो 6 × ½ = 3 s।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Heights and distances seen from above, with angles of depression. */
export const fromAbove = bankFamily(items, {
  level: Level.Hard,
  tests: [Concept.HeightsAndDepthsFromAbove],
});
