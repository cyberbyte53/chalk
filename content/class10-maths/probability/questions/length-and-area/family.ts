import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, frac, numItem } from "../../kit";

const r = String.raw;

/** Examples 10* and 11*, Exercise 15.1 Q20*: probability as a ratio of lengths or areas. */
const items = {
  ex10: numItem(
    t(
      "Example 10*. The music in musical chairs stops at a random moment within 2 minutes. What is P(it stops in the first half-minute)?",
      "उदाहरण 10*. म्यूज़िकल चेयर में संगीत 2 मिनट के अंदर किसी यादृच्छ पल रुकता है। P(वह पहले आधे मिनट में रुके) क्या है?",
    ),
    frac(1, 4),
    [
      [
        frac(1, 2),
        t("Half a minute out of 2 minutes: 0.5 ÷ 2 = 1/4.", "2 मिनट में आधा मिनट: 0.5 ÷ 2 = 1/4।"),
      ],
      [
        frac(1, 3),
        t(
          "Compare lengths: 0.5 of the whole 2, not of the other 1.5.",
          "लंबाई मिलाओ: पूरे 2 का 0.5, बाक़ी 1.5 का नहीं।",
        ),
      ],
    ],
  ),
  ex10b: numItem(
    t(
      "Example 10*. The music stops at a random moment within 2 minutes. What is P(it stops **after** the first half-minute)?",
      "उदाहरण 10*. संगीत 2 मिनट के अंदर किसी यादृच्छ पल रुकता है। P(वह पहले आधे मिनट के **बाद** रुके) क्या है?",
    ),
    frac(3, 4),
    [
      [
        frac(1, 4),
        t(
          "1/4 is the first half-minute. After it: 1.5 ÷ 2 = 3/4.",
          "1/4 पहला आधा मिनट है। उसके बाद: 1.5 ÷ 2 = 3/4।",
        ),
      ],
      [
        frac(3, 2),
        t(
          "A probability can't be above 1: 1.5 ÷ 2 = 3/4.",
          "प्रायिकता 1 से ज़्यादा नहीं हो सकती: 1.5 ÷ 2 = 3/4।",
        ),
      ],
    ],
  ),
  ex11: numItem(
    t(
      "Example 11*. A helicopter crashed somewhere in a 9 km × 4.5 km region, equally likely anywhere. Inside is a 3 km × 2.5 km lake. What is P(it crashed in the lake)?",
      "उदाहरण 11*. एक हेलीकॉप्टर 9 km × 4.5 km के क्षेत्र में कहीं गिरा, हर जगह समप्रायिक। अंदर 3 km × 2.5 km की एक झील है। P(वह झील में गिरा) क्या है?",
    ),
    frac(5, 27),
    [
      [
        frac(1, 3),
        t(
          "That compares widths only. Areas: 7.5 ÷ 40.5 = 5/27.",
          "यह केवल चौड़ाई मिलाता है। क्षेत्रफल: 7.5 ÷ 40.5 = 5/27।",
        ),
      ],
      [
        frac(5, 9),
        t(
          "The lake's height is 2.5 of 4.5; multiply both ways: 7.5 ÷ 40.5.",
          "झील की ऊँचाई 4.5 में 2.5; दोनों गुणा करो: 7.5 ÷ 40.5।",
        ),
      ],
    ],
  ),
  ex11b: numItem(
    t(
      "Example 11*. In the same 9 km × 4.5 km region with a 3 km × 2.5 km lake, what is P(the helicopter crashed on land)?",
      "उदाहरण 11*. उसी 9 km × 4.5 km के क्षेत्र में, जिसमें 3 km × 2.5 km की झील है, P(हेलीकॉप्टर ज़मीन पर गिरा) क्या है?",
    ),
    frac(22, 27),
    [
      [
        frac(5, 27),
        t(
          "5/27 is the lake. Land is the complement: 1 − 5/27.",
          "5/27 झील है। ज़मीन उसकी पूरक है: 1 − 5/27।",
        ),
      ],
      [
        frac(2, 3),
        t(
          "Compare areas, not widths: 33 ÷ 40.5 = 22/27.",
          "चौड़ाई नहीं, क्षेत्रफल मिलाओ: 33 ÷ 40.5 = 22/27।",
        ),
      ],
    ],
  ),
  q20: numItem(
    t(
      "Exercise 15.1 Q20*. A die is dropped at random on a 3 m × 2 m rectangle containing a circle of diameter 1 m. What is P(it lands inside the circle)?",
      "प्रश्नावली 15.1 प्रश्न 20*. 3 m × 2 m के आयत पर, जिसमें 1 m व्यास का वृत्त है, एक पासा यादृच्छया गिराया जाता है। P(वह वृत्त के अंदर गिरे) क्या है?",
    ),
    r`$\dfrac{\pi}{24}$`,
    [
      [
        r`$\dfrac{\pi}{6}$`,
        t(
          "The radius is ½ m, not 1 m: the circle is π/4 m².",
          "त्रिज्या ½ m है, 1 m नहीं: वृत्त π/4 m² है।",
        ),
      ],
      [
        r`$\dfrac{\pi}{20}$`,
        t(
          "The rectangle's area is 3 × 2 = 6, not its perimeter 10.",
          "आयत का क्षेत्रफल 3 × 2 = 6 है, परिमाप 10 नहीं।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Find a probability by measuring: favourable length or area over the whole. */
export const lengthAndArea = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.BeyondCounting],
});
