import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** Exercise 5.4 (optional) Q1–Q5. */
const items = {
  q1: numItem(
    t(
      "Which term of the AP 121, 117, 113, … is its first negative term?",
      "AP 121, 117, 113, … का कौन-सा पद उसका पहला ऋणात्मक पद है?",
    ),
    "32nd",
    [
      [
        "31st",
        t(
          "a₃₁ = 125 − 124 = 1, still positive. 125 − 4n < 0 needs n > 31¼.",
          "a₃₁ = 125 − 124 = 1, अभी धनात्मक। 125 − 4n < 0 के लिए n > 31¼ चाहिए।",
        ),
      ],
      [
        "30th",
        t(
          "Solve 125 − 4n < 0: n > 31¼, so the first whole n is 32.",
          "125 − 4n < 0 हल करो: n > 31¼, तो पहला पूर्ण n 32 है।",
        ),
      ],
    ],
  ),
  q2: numItem(
    t(
      "The 3rd and 7th terms of an AP add to 6 and multiply to 8. The sum of the first 16 terms is",
      "किसी AP के तीसरे और 7वें पदों का योग 6 और गुणनफल 8 है। पहले 16 पदों का योग है",
    ),
    "76 or 20",
    [
      [
        "Only 76",
        t(
          "d² = 1/4 gives d = ½ or −½: two APs, with sums 76 and 20.",
          "d² = 1/4 से d = ½ या −½: दो AP, योग 76 और 20।",
        ),
      ],
      [
        "48",
        t(
          "a + 4d = 3 is the middle of the two terms, but you still need d: (3 − 2d)(3 + 2d) = 8.",
          "a + 4d = 3 दोनों पदों का बीच है, पर d फिर भी चाहिए: (3 − 2d)(3 + 2d) = 8।",
        ),
      ],
    ],
  ),
  q3: numItem(
    t(
      "A ladder's rungs are 25 cm apart, top and bottom 2½ m apart, shrinking evenly from 45 cm to 25 cm. How much wood for the rungs?",
      "एक सीढ़ी के डंडे 25 cm के अंतर पर हैं, ऊपर और नीचे वाले 2½ m दूर, 45 cm से 25 cm तक बराबर घटते हुए। डंडों के लिए कितनी लकड़ी?",
    ),
    "385 cm",
    [
      [
        "350 cm",
        t(
          "There are 250 ÷ 25 + 1 = 11 rungs: count both ends.",
          "250 ÷ 25 + 1 = 11 डंडे हैं: दोनों सिरे गिनो।",
        ),
      ],
      ["70 cm", t("That's only the top and bottom rungs.", "यह सिर्फ़ सबसे ऊपर और नीचे के डंडे हैं।")],
    ],
  ),
  q4: numItem(
    t(
      "Houses are numbered 1 to 49. For house x, the numbers before it add to the same as those after it. Find x.",
      "घरों पर 1 से 49 तक संख्याएँ हैं। घर x के लिए, उससे पहले की संख्याओं का योग उसके बाद वालों के बराबर है। x ज्ञात करो।",
    ),
    "35",
    [
      [
        "25",
        t(
          "The houses after the middle have bigger numbers. (x − 1)x/2 = 1225 − x(x + 1)/2 gives x² = 1225.",
          "बीच के बाद के घरों की संख्याएँ बड़ी हैं। (x − 1)x/2 = 1225 − x(x + 1)/2 से x² = 1225।",
        ),
      ],
      ["1225", t("1225 is x², so x = 35.", "1225, x² है, तो x = 35।")],
    ],
  ),
  q5: numItem(
    t(
      "A terrace has 15 steps, each 50 m long, rise ¼ m, tread ½ m. Step k needs k × 6.25 m³ of concrete. How much in all?",
      "एक चबूतरे में 15 सीढ़ियाँ हैं, हर एक 50 m लंबी, ऊँचाई ¼ m, चौड़ाई ½ m। सीढ़ी k में k × 6.25 m³ कंक्रीट लगता है। कुल कितना?",
    ),
    "750 m³",
    [
      [
        "93.75 m³",
        t("That's the 15th step alone. Add all 15.", "यह अकेली 15वीं सीढ़ी है। सारी 15 जोड़ो।"),
      ],
      ["375 m³", t("1 + 2 + … + 15 = 120, not 60.", "1 + 2 + … + 15 = 120, 60 नहीं।")],
    ],
  ),
} satisfies Record<string, Item>;

/** NCERT's optional challenge problems on APs. */
export const challengePuzzles = bankFamily(items, {
  level: Level.Hard,
  tests: [Concept.ChallengeAndFinale],
});
