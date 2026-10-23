import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** Slanting lengths: ladders, slides, strings, a broken tree (Example 2, Exercise 9.1 Q2, Q3, Q5). */
const items = {
  ex2ladder: numItem(
    t(
      "Example 2: a ladder at 60° to the ground must reach 3.7 m up a pole. How long is the ladder? (√3 = 1.73)",
      "उदाहरण 2: ज़मीन से 60° पर टिकी सीढ़ी को खंभे पर 3.7 m ऊपर तक पहुँचना है। सीढ़ी कितनी लंबी है? (√3 = 1.73)",
    ),
    "≈ 4.28 m",
    [
      [
        "≈ 2.14 m",
        t(
          "2.14 m = 3.7/√3 is how far the foot is from the pole. The ladder is the hypotenuse: 3.7 / sin 60°.",
          "2.14 m = 3.7/√3 पैर की खंभे से दूरी है। सीढ़ी कर्ण है: 3.7 / sin 60°।",
        ),
      ],
      [
        "≈ 7.4 m",
        t(
          "7.4 = 3.7 / cos 60° uses the side next to the angle. 3.7 m is opposite it, so use sin.",
          "7.4 = 3.7 / cos 60° में कोण के पास वाली भुजा ली। 3.7 m उसके सामने है, इसलिए sin लो।",
        ),
      ],
    ],
  ),
  ex2foot: numItem(
    t(
      "Example 2 again: the same ladder at 60° reaches 3.7 m up. How far from the pole is its foot? (√3 = 1.73)",
      "फिर उदाहरण 2: वही सीढ़ी 60° पर 3.7 m ऊपर पहुँचती है। उसका पैर खंभे से कितनी दूर है? (√3 = 1.73)",
    ),
    "≈ 2.14 m",
    [
      [
        "≈ 6.4 m",
        t(
          "6.4 = 3.7 × √3 multiplies by tan 60°. The foot is DC = 3.7 × cot 60° = 3.7/√3.",
          "6.4 = 3.7 × √3 में tan 60° से गुणा हुआ। पैर DC = 3.7 × cot 60° = 3.7/√3।",
        ),
      ],
      [
        "≈ 4.28 m",
        t(
          "4.28 m is the ladder itself. The foot's distance is the side next to the 60° angle.",
          "4.28 m स्वयं सीढ़ी है। पैर की दूरी 60° कोण के पास वाली भुजा है।",
        ),
      ],
    ],
  ),
  q2tree: numItem(
    t(
      "Exercise 9.1 Q2: a storm breaks a tree; its top touches the ground 8 m from the foot, at 30°. How tall was the tree?",
      "प्रश्नावली 9.1 प्र2: आँधी से एक पेड़ टूटता है; उसका शीर्ष आधार से 8 m दूर ज़मीन को 30° पर छूता है। पेड़ कितना ऊँचा था?",
    ),
    "8√3 m",
    [
      [
        "8/√3 m",
        t(
          "8/√3 is only the standing part. Add the broken part, 8 / cos 30° = 16/√3: total 24/√3 = 8√3.",
          "8/√3 केवल खड़ा हिस्सा है। टूटा हिस्सा, 8 / cos 30° = 16/√3, जोड़ो: कुल 24/√3 = 8√3।",
        ),
      ],
      [
        "16/√3 m",
        t(
          "16/√3 is just the broken part. The tree was standing part + broken part.",
          "16/√3 केवल टूटा हिस्सा है। पेड़ = खड़ा हिस्सा + टूटा हिस्सा।",
        ),
      ],
    ],
  ),
  q3small: numItem(
    t(
      "Exercise 9.1 Q3: a slide for small children has its top 1.5 m high and slopes at 30°. How long is it?",
      "प्रश्नावली 9.1 प्र3: छोटे बच्चों की फिसलपट्टी का ऊपरी सिरा 1.5 m ऊँचा है और वह 30° पर झुकी है। वह कितनी लंबी है?",
    ),
    "3 m",
    [
      [
        "0.75 m",
        t(
          "0.75 = 1.5 × sin 30° multiplies; the slide is longer than its height. Length = 1.5 / sin 30°.",
          "0.75 = 1.5 × sin 30° में गुणा हुआ; फिसलपट्टी अपनी ऊँचाई से लंबी है। लंबाई = 1.5 / sin 30°।",
        ),
      ],
      [
        "1.5√3 m",
        t(
          "1.5√3 = 1.5 / tan 30° is the length along the ground under the slide.",
          "1.5√3 = 1.5 / tan 30° फिसलपट्टी के नीचे ज़मीन पर की लंबाई है।",
        ),
      ],
    ],
  ),
  q3big: numItem(
    t(
      "Exercise 9.1 Q3: a steep slide for older children is 3 m high and slopes at 60°. How long is it?",
      "प्रश्नावली 9.1 प्र3: बड़े बच्चों की खड़ी फिसलपट्टी 3 m ऊँची है और 60° पर झुकी है। वह कितनी लंबी है?",
    ),
    "2√3 m",
    [
      [
        "6 m",
        t(
          "6 = 3 / cos 60° uses the side next to the angle. The height is opposite it: 3 / sin 60° = 2√3.",
          "6 = 3 / cos 60° में कोण के पास वाली भुजा ली। ऊँचाई उसके सामने है: 3 / sin 60° = 2√3।",
        ),
      ],
      [
        "√3 m",
        t(
          "√3 = 3 / tan 60° is the ground length under the slide, not the slide itself.",
          "√3 = 3 / tan 60° फिसलपट्टी के नीचे ज़मीन की लंबाई है, स्वयं फिसलपट्टी नहीं।",
        ),
      ],
    ],
  ),
  q5kite: numItem(
    t(
      "Exercise 9.1 Q5: a kite is 60 m up; its string, tied to the ground, makes 60° with it. How long is the string?",
      "प्रश्नावली 9.1 प्र5: एक पतंग 60 m ऊपर है; ज़मीन से बँधी डोर ज़मीन से 60° बनाती है। डोर कितनी लंबी है?",
    ),
    "40√3 m",
    [
      [
        "20√3 m",
        t(
          "20√3 = 60/√3 is the ground distance. The string is the hypotenuse: 60 / sin 60°.",
          "20√3 = 60/√3 ज़मीन की दूरी है। डोर कर्ण है: 60 / sin 60°।",
        ),
      ],
      [
        "120 m",
        t(
          "120 = 60 / cos 60°: 60 m is opposite the angle, so it pairs with sin, not cos.",
          "120 = 60 / cos 60°: 60 m कोण के सामने है, इसलिए sin के साथ जाता है, cos के नहीं।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Slanting lengths from an angle: when the unknown is the hypotenuse. */
export const slantLengths = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.AngleOfElevation],
});
