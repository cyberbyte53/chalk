import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const summed = t(
  "Lengths don't add like that; their squares do: c² = a² + b².",
  "लंबाइयाँ ऐसे नहीं जुड़तीं; उनके वर्ग जुड़ते हैं: c² = a² + b²।",
);
const subtract = t(
  "The ladder is the hypotenuse, the longest side, so subtract squares: a² = c² − b².",
  "सीढ़ी कर्ण है, सबसे लंबी भुजा, तो वर्ग घटाओ: a² = c² − b²।",
);

/** Example 11 and Exercise 6.5 Q9–Q12, and the wire: lengths by Pythagoras. */
const items = {
  ex11: numItem(
    t(
      "A ladder's foot is 2.5 m from a wall and its top reaches a window 6 m up. How long is the ladder?",
      "एक सीढ़ी का पैर दीवार से 2.5 m दूर है और उसका सिरा 6 m ऊँची खिड़की तक पहुँचता है। सीढ़ी कितनी लंबी है?",
    ),
    "6.5 m",
    [
      ["8.5 m", summed],
      [
        "5.5 m",
        t(
          "That subtracts squares. The ladder is the hypotenuse: √(6² + 2.5²) = √42.25.",
          "यह वर्ग घटाता है। सीढ़ी कर्ण है: √(6² + 2.5²) = √42.25।",
        ),
      ],
    ],
  ),
  q9: numItem(
    t(
      "A 10 m ladder reaches a window 8 m above the ground. How far is its foot from the wall?",
      "10 m की सीढ़ी ज़मीन से 8 m ऊँची खिड़की तक पहुँचती है। उसका पैर दीवार से कितनी दूर है?",
    ),
    "6 m",
    [
      [
        "2 m",
        t(
          "10 − 8 subtracts lengths. Subtract squares: √(100 − 64).",
          "10 − 8 लंबाइयाँ घटाता है। वर्ग घटाओ: √(100 − 64)।",
        ),
      ],
      ["12.8 m", subtract],
    ],
  ),
  q10: numItem(
    t(
      "A 24 m guy wire is tied to the top of an 18 m pole and staked to the ground. How far is the stake from the pole?",
      "24 m का तार 18 m ऊँचे खंभे के सिरे से बँधा है और ज़मीन में खूँटे से। खूँटा खंभे से कितनी दूर है?",
    ),
    "6√7 m",
    [
      [
        "6 m",
        t(
          "24 − 18 subtracts lengths. Subtract squares: √(576 − 324) = √252.",
          "24 − 18 लंबाइयाँ घटाता है। वर्ग घटाओ: √(576 − 324) = √252।",
        ),
      ],
      [
        "30 m",
        t(
          "The wire is the hypotenuse; the gap is shorter than 24 m.",
          "तार कर्ण है; दूरी 24 m से कम है।",
        ),
      ],
    ],
  ),
  q11: numItem(
    t(
      "One plane flies north at 1000 km/h and another west at 1200 km/h, from the same airport at the same time. How far apart are they after 1½ hours?",
      "एक हवाई जहाज़ 1000 km/h से उत्तर और दूसरा 1200 km/h से पश्चिम, एक ही हवाई अड्डे से एक ही समय उड़ते हैं। 1½ घंटे बाद वे कितनी दूर हैं?",
    ),
    "300√61 km",
    [
      ["3300 km", summed],
      [
        "300√11 km",
        t(
          "That subtracts the squares. North and west are at 90°, so add: 1500² + 1800².",
          "यह वर्ग घटाता है। उत्तर और पश्चिम 90° पर हैं, तो जोड़ो: 1500² + 1800²।",
        ),
      ],
    ],
  ),
  q12: numItem(
    t(
      "Two poles, 6 m and 11 m tall, stand 12 m apart. How far apart are their tops?",
      "6 m और 11 m ऊँचे दो खंभे 12 m दूर खड़े हैं। उनके सिरे कितनी दूर हैं?",
    ),
    "13 m",
    [
      ["17 m", summed],
      [
        "√265 m",
        t(
          "That uses the 11 m pole. The rise between the tops is 11 − 6 = 5 m.",
          "यह 11 m का खंभा लेता है। सिरों के बीच ऊँचाई का अंतर 11 − 6 = 5 m है।",
        ),
      ],
    ],
  ),
  wire: numItem(
    t(
      "The lights' wire drops 12 m from the tank top and spans a 16 m gap to the gate. How long is it?",
      "रोशनी का तार टंकी के ऊपर से 12 m नीचे आता है और गेट तक 16 m की दूरी पार करता है। वह कितना लंबा है?",
    ),
    "20 m",
    [
      ["28 m", summed],
      [
        "4√7 m",
        t(
          "That subtracts squares. The wire is the hypotenuse: √(144 + 256).",
          "यह वर्ग घटाता है। तार कर्ण है: √(144 + 256)।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Find a length with the Pythagoras theorem. */
export const findALength = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.PythagorasTheorem],
});
