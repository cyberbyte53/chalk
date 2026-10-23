import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** The assumed-mean method (Example 2, Activity 1, Exercise 14.1 Q2 and Q6). */
const items = {
  ex2: numItem(
    t(
      "Example 2. Female teachers (%) in 35 states/U.T.: 15 – 25: 6, 25 – 35: 11, 35 – 45: 7, 45 – 55: 4, 55 – 65: 4, 65 – 75: 2, 75 – 85: 1. With a = 50, Σfᵢdᵢ = −360. What is the mean?",
      "उदाहरण 2। 35 राज्यों/संघ क्षेत्रों में महिला शिक्षिकाएँ (%): 15 – 25: 6, 25 – 35: 11, 35 – 45: 7, 45 – 55: 4, 55 – 65: 4, 65 – 75: 2, 75 – 85: 1। a = 50 लेने पर Σfᵢdᵢ = −360। माध्य क्या है?",
    ),
    "39.71",
    [
      [
        "60.29",
        t(
          "Σfᵢdᵢ is negative, so the mean is below a: 50 − 360/35 = 39.71.",
          "Σfᵢdᵢ ऋणात्मक है, तो माध्य a से कम है: 50 − 360/35 = 39.71।",
        ),
      ],
      [
        "−10.29",
        t(
          "That's only Σfᵢdᵢ/Σfᵢ. Add a back: 50 − 10.29 = 39.71.",
          "यह सिर्फ़ Σfᵢdᵢ/Σfᵢ है। a वापस जोड़ो: 50 − 10.29 = 39.71।",
        ),
      ],
    ],
  ),
  anya: numItem(
    t(
      "Activity 1. Riya's marks have mean 62 with a = 47.5. She redoes the table with a = 32.5. What mean does she get now?",
      "क्रियाकलाप 1। a = 47.5 लेने पर रिया के अंकों का माध्य 62 है। वह a = 32.5 लेकर तालिका फिर बनाती है। अब उसे कौन-सा माध्य मिलता है?",
    ),
    "62",
    [
      [
        "47",
        t(
          "Changing a changes every dᵢ, but a is added back: the mean is still 62.",
          "a बदलने से हर dᵢ बदलता है, पर a वापस जुड़ता है: माध्य अब भी 62 है।",
        ),
      ],
      [
        "77",
        t(
          "The mean doesn't move with a. Any assumed mean gives 62.",
          "माध्य a के साथ नहीं खिसकता। कोई भी कल्पित माध्य 62 देता है।",
        ),
      ],
    ],
  ),
  q2: numItem(
    t(
      "Exercise 14.1 Q2. Daily wages (₹) of 50 workers: 500 – 520: 12, 520 – 540: 14, 540 – 560: 8, 560 – 580: 6, 580 – 600: 10. Find the mean daily wage.",
      "प्रश्नावली 14.1 प्र2। 50 मज़दूरों की दैनिक मज़दूरी (₹): 500 – 520: 12, 520 – 540: 14, 540 – 560: 8, 560 – 580: 6, 580 – 600: 10। औसत दैनिक मज़दूरी ज्ञात करो।",
    ),
    "545.2",
    [
      [
        "554.8",
        t(
          "With a = 550, Σfᵢdᵢ = −240 is negative: 550 − 240/50 = 545.2.",
          "a = 550 लेने पर Σfᵢdᵢ = −240 ऋणात्मक है: 550 − 240/50 = 545.2।",
        ),
      ],
      [
        "550.0",
        t(
          "550 is just the middle class mark. Correct it by Σfᵢdᵢ/Σfᵢ = −4.8: 545.2.",
          "550 बस बीच का वर्ग चिह्न है। इसे Σfᵢdᵢ/Σfᵢ = −4.8 से सुधारो: 545.2।",
        ),
      ],
    ],
  ),
  q6: numItem(
    t(
      "Exercise 14.1 Q6. Daily food expenditure (₹) of 25 households: 100 – 150: 4, 150 – 200: 5, 200 – 250: 12, 250 – 300: 2, 300 – 350: 2. Find the mean daily expenditure on food.",
      "प्रश्नावली 14.1 प्र6। 25 परिवारों का दैनिक भोजन ख़र्च (₹): 100 – 150: 4, 150 – 200: 5, 200 – 250: 12, 250 – 300: 2, 300 – 350: 2। भोजन पर औसत दैनिक ख़र्च ज्ञात करो।",
    ),
    "211",
    [
      [
        "239",
        t(
          "With a = 225, Σfᵢdᵢ = −350 is negative: 225 − 350/25 = 211.",
          "a = 225 लेने पर Σfᵢdᵢ = −350 ऋणात्मक है: 225 − 350/25 = 211।",
        ),
      ],
      [
        "225",
        t(
          "225 is the assumed mean, not the answer. Add Σfᵢdᵢ/Σfᵢ = −14: 211.",
          "225 कल्पित माध्य है, उत्तर नहीं। Σfᵢdᵢ/Σfᵢ = −14 जोड़ो: 211।",
        ),
      ],
    ],
  ),
  deviation: numItem(
    t(
      "With a = 47.5, what is the deviation dᵢ of the class mark 92.5?",
      "a = 47.5 लेने पर वर्ग चिह्न 92.5 का विचलन dᵢ क्या है?",
    ),
    "45",
    [
      [
        "−45",
        t(
          "dᵢ = xᵢ − a = 92.5 − 47.5 = 45. It's positive because 92.5 is above a.",
          "dᵢ = xᵢ − a = 92.5 − 47.5 = 45। यह धनात्मक है क्योंकि 92.5, a से ऊपर है।",
        ),
      ],
      [
        "3",
        t(
          "3 is the step deviation uᵢ = 45/15. The deviation itself is dᵢ = 45.",
          "3 पग-विचलन uᵢ = 45/15 है। विचलन ख़ुद dᵢ = 45 है।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

export const assumedMean = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.AssumedMeanAndStepDeviation],
});
