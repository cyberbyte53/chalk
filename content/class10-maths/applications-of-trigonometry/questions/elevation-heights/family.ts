import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** Heights from one angle of elevation: Examples 1 and 3, Exercise 9.1 Q1 and Q4, the tower. */
const items = {
  ex1: numItem(
    t(
      "Example 1: from 15 m away on the ground, a tower's top is at an elevation of 60°. How tall is the tower?",
      "उदाहरण 1: ज़मीन पर 15 m दूर से एक मीनार का शीर्ष 60° उन्नयन पर है। मीनार कितनी ऊँची है?",
    ),
    "15√3 m",
    [
      [
        "5√3 m",
        t(
          "5√3 = 15/√3 divides by tan 60° instead of multiplying: AB = 15 × tan 60°.",
          "5√3 = 15/√3 में tan 60° से भाग दिया, गुणा की जगह: AB = 15 × tan 60°।",
        ),
      ],
      [
        "7.5 m",
        t(
          "7.5 = 15 × cos 60° uses the wrong ratio. Height and ground distance are linked by tan.",
          "7.5 = 15 × cos 60° में ग़लत अनुपात है। ऊँचाई और ज़मीन की दूरी tan से जुड़ती हैं।",
        ),
      ],
    ],
  ),
  ex3: numItem(
    t(
      "Example 3: a 1.5 m tall observer is 28.5 m from a chimney and sees its top at 45°. How tall is the chimney?",
      "उदाहरण 3: 1.5 m लंबी प्रेक्षक एक चिमनी से 28.5 m दूर है और उसका शीर्ष 45° पर देखती है। चिमनी कितनी ऊँची है?",
    ),
    "30 m",
    [
      [
        "28.5 m",
        t(
          "28.5 m is only the part above her eye. Add her 1.5 m.",
          "28.5 m केवल उसकी आँख के ऊपर का हिस्सा है। उसकी 1.5 m जोड़ो।",
        ),
      ],
      [
        "27 m",
        t(
          "The eye height is added, not taken away: 28.5 + 1.5.",
          "आँख की ऊँचाई जोड़ी जाती है, घटाई नहीं: 28.5 + 1.5।",
        ),
      ],
    ],
  ),
  q1: numItem(
    t(
      "Exercise 9.1 Q1: a 20 m rope runs tight from the top of a pole to the ground at 30°. How tall is the pole?",
      "प्रश्नावली 9.1 प्र1: 20 m लंबी रस्सी एक खंभे के शीर्ष से ज़मीन तक 30° पर तनी है। खंभा कितना ऊँचा है?",
    ),
    "10 m",
    [
      [
        "10√3 m",
        t(
          "10√3 = 20 cos 30° is the distance along the ground. The pole is opposite the angle: 20 sin 30°.",
          "10√3 = 20 cos 30° ज़मीन पर की दूरी है। खंभा कोण के सामने है: 20 sin 30°।",
        ),
      ],
      [
        "20/√3 m",
        t(
          "That treats 20 m as the ground distance and uses tan. The rope is the hypotenuse, so use sin.",
          "इसमें 20 m को ज़मीन की दूरी मानकर tan लिया। रस्सी कर्ण है, इसलिए sin लो।",
        ),
      ],
    ],
  ),
  q4: numItem(
    t(
      "Exercise 9.1 Q4: from 30 m away, a tower's top is at an elevation of 30°. How tall is the tower?",
      "प्रश्नावली 9.1 प्र4: 30 m दूर से एक मीनार का शीर्ष 30° उन्नयन पर है। मीनार कितनी ऊँची है?",
    ),
    "10√3 m",
    [
      [
        "30√3 m",
        t(
          "That multiplies by cot 30°. Height = 30 × tan 30° = 30/√3 = 10√3.",
          "इसमें cot 30° से गुणा हुआ। ऊँचाई = 30 × tan 30° = 30/√3 = 10√3।",
        ),
      ],
      [
        "15 m",
        t(
          "15 = 30 sin 30° treats 30 m as the line of sight; it's along the ground.",
          "15 = 30 sin 30° में 30 m को दृष्टि रेखा मान लिया; वह ज़मीन पर है।",
        ),
      ],
    ],
  ),
  tower: numItem(
    t(
      "Kabir stands 30 m from the watch-tower, eyes 1.5 m up, and sights its top at 45°. How tall is it?",
      "कबीर प्रहरी-मीनार से 30 m दूर खड़ा है, आँखें 1.5 m ऊपर, और उसका शीर्ष 45° पर देखता है। वह कितनी ऊँची है?",
    ),
    "31.5 m",
    [
      [
        "30 m",
        t(
          "30 m is above his eye. Add the 1.5 m below.",
          "30 m उसकी आँख के ऊपर है। नीचे का 1.5 m जोड़ो।",
        ),
      ],
      [
        "43.9 m",
        t(
          "That's about the line of sight plus 1.5 m. Height uses tan, not the slant.",
          "यह लगभग दृष्टि रेखा जमा 1.5 m है। ऊँचाई के लिए tan चाहिए, तिरछी रेखा नहीं।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Find a height from one angle of elevation (and the eye height). */
export const elevationHeights = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.AngleOfElevation],
});
