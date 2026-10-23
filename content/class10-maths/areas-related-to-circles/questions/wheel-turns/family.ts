import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { bankFamily, numItem } from "../../kit";

const units = t(
  "Put the distance and the circumference in the same unit first (both in cm, say), then divide.",
  "पहले दूरी और परिधि को एक ही इकाई में लाओ (जैसे दोनों cm में), फिर भाग दो।",
);
const halfTurn = t(
  "One turn covers the whole circumference, 2πr. Using πr (or the radius as the diameter) halves it.",
  "एक चक्कर पूरी परिधि तय करता है, 2πr। πr लेने (या त्रिज्या को व्यास मानने) से यह आधी हो जाती है।",
);

/** Exercise 12.1 Q4 and wheel-turn problems: distance ÷ circumference. */
const items = {
  q4: numItem(
    t(
      "A car's wheels have diameter 80 cm. How many complete turns does each wheel make in 10 minutes at 66 km/h?",
      "एक कार के पहियों का व्यास 80 cm है। 66 km/h की चाल से 10 मिनट में हर पहिया कितने पूरे चक्कर लगाता है?",
    ),
    "4375",
    [
      ["8750", halfTurn],
      [
        "26250",
        t(
          "That uses the distance in an hour. In 10 minutes the car goes 66 ÷ 6 = 11 km.",
          "इसमें एक घंटे की दूरी ली। 10 मिनट में कार 66 ÷ 6 = 11 km जाती है।",
        ),
      ],
    ],
  ),
  school: numItem(
    t(
      "A cycle wheel has radius 35 cm. How many turns does it make in 1.1 km?",
      "एक साइकिल के पहिये की त्रिज्या 35 cm है। 1.1 km में वह कितने चक्कर लगाता है?",
    ),
    "500",
    [
      ["5", units],
      ["1000", halfTurn],
    ],
  ),
  wheel56: numItem(
    t(
      "A wheel of diameter 56 cm turns 50 times. How far does it go?",
      "56 cm व्यास का एक पहिया 50 चक्कर लगाता है। वह कितनी दूर जाता है?",
    ),
    "88 m",
    [
      ["44 m", halfTurn],
      [
        "176 m",
        t(
          "That takes 56 as the radius. Diameter 56 means radius 28: circumference 176 cm, so 50 turns go 8800 cm.",
          "इसमें 56 को त्रिज्या माना। व्यास 56 यानी त्रिज्या 28: परिधि 176 cm, तो 50 चक्कर 8800 cm जाते हैं।",
        ),
      ],
    ],
  ),
  rope: numItem(
    t(
      "A bucket's rope winds round a well's drum of radius 14 cm. The bucket rises 22 m. How many turns of the drum?",
      "बाल्टी की रस्सी 14 cm त्रिज्या के कुएँ के ड्रम पर लिपटती है। बाल्टी 22 m ऊपर आती है। ड्रम कितने चक्कर लगाता है?",
    ),
    "25",
    [
      ["50", halfTurn],
      ["0.25", units],
    ],
  ),
} as const;

export const wheelTurns = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.CircumferenceAndArea],
});
