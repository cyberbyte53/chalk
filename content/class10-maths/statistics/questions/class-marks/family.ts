import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** Class marks and grouping (Section 14.2, Example 1, Exercise 14.1 Q5 and Q7). */
const items = {
  cm5570: numItem(
    t("What is the class mark of the class 55 – 70?", "वर्ग 55 – 70 का वर्ग चिह्न क्या है?"),
    "62.5",
    [
      [
        "15",
        t(
          "15 is the class size, 70 − 55. The class mark is the midpoint: (55 + 70)/2 = 62.5.",
          "15 वर्ग माप है, 70 − 55। वर्ग चिह्न मध्य-बिंदु है: (55 + 70)/2 = 62.5।",
        ),
      ],
      [
        "70",
        t(
          "70 is the upper limit. The class mark is halfway between the limits: 62.5.",
          "70 उपरी सीमा है। वर्ग चिह्न दोनों सीमाओं के बीचोंबीच है: 62.5।",
        ),
      ],
    ],
  ),
  cm1520: numItem(
    t("Find the class mark of 1500 – 2000.", "1500 – 2000 का वर्ग चिह्न ज्ञात करो।"),
    "1750",
    [
      [
        "500",
        t(
          "500 is the width. The midpoint is (1500 + 2000)/2 = 1750.",
          "500 चौड़ाई है। मध्य-बिंदु है (1500 + 2000)/2 = 1750।",
        ),
      ],
      [
        "3500",
        t("Add the limits, then halve: 3500/2 = 1750.", "सीमाएँ जोड़ो, फिर आधा करो: 3500/2 = 1750।"),
      ],
    ],
  ),
  cmso2: numItem(
    t(
      "Exercise 14.1 Q7. What is the class mark of 0.12 – 0.16?",
      "प्रश्नावली 14.1 प्र7। 0.12 – 0.16 का वर्ग चिह्न क्या है?",
    ),
    "0.14",
    [
      [
        "0.04",
        t(
          "0.04 is the class size. The class mark is (0.12 + 0.16)/2 = 0.14.",
          "0.04 वर्ग माप है। वर्ग चिह्न है (0.12 + 0.16)/2 = 0.14।",
        ),
      ],
      [
        "0.28",
        t("That's the sum of the limits; halve it: 0.14.", "यह सीमाओं का योग है; इसे आधा करो: 0.14।"),
      ],
    ],
  ),
  cmmango: numItem(
    t(
      "Exercise 14.1 Q5. The mangoes are grouped 50 – 52, 53 – 55, 56 – 58, … What is the class mark of 53 – 55?",
      "प्रश्नावली 14.1 प्र5। आम 50 – 52, 53 – 55, 56 – 58, … में बाँटे गए हैं। 53 – 55 का वर्ग चिह्न क्या है?",
    ),
    "54",
    [
      [
        "53",
        t(
          "53 is the lower limit. The class mark is (53 + 55)/2 = 54.",
          "53 निम्न सीमा है। वर्ग चिह्न है (53 + 55)/2 = 54।",
        ),
      ],
      [
        "3",
        t(
          "3 is the gap between classes. The class mark is the midpoint, 54.",
          "3 वर्गों के बीच का अंतर है। वर्ग चिह्न मध्य-बिंदु, 54, है।",
        ),
      ],
    ],
  ),
  where55: numItem(
    t(
      "Example 1 uses classes 40 – 55 and 55 – 70. A student scored exactly 55. How many classes is the 55 counted in?",
      "उदाहरण 1 में वर्ग 40 – 55 और 55 – 70 हैं। एक विद्यार्थी के ठीक 55 अंक आए। 55 कितने वर्गों में गिना जाता है?",
    ),
    "1",
    [
      [
        "2",
        t(
          "Each observation is counted once. By convention 55 goes in 55 – 70, the class it is the lower limit of.",
          "हर प्रेक्षण एक बार गिना जाता है। परिपाटी से 55, 55 – 70 में जाता है, जिसकी यह निम्न सीमा है।",
        ),
      ],
      [
        "0",
        t(
          "It must be counted somewhere. By convention it goes in 55 – 70.",
          "इसे कहीं तो गिनना होगा। परिपाटी से यह 55 – 70 में जाता है।",
        ),
      ],
    ],
  ),
  count4055: numItem(
    t(
      "Example 1. Marks of 30 students: 10 – 25: 2, 25 – 40: 3, 40 – 55: 7, 55 – 70: 6, 70 – 85: 6, 85 – 100: 6. What is the class mark of the class with the most students?",
      "उदाहरण 1। 30 विद्यार्थियों के अंक: 10 – 25: 2, 25 – 40: 3, 40 – 55: 7, 55 – 70: 6, 70 – 85: 6, 85 – 100: 6। सबसे ज़्यादा विद्यार्थियों वाले वर्ग का वर्ग चिह्न क्या है?",
    ),
    "47.5",
    [
      [
        "7",
        t(
          "7 is that class's frequency. Its class mark is (40 + 55)/2 = 47.5.",
          "7 उस वर्ग की बारंबारता है। उसका वर्ग चिह्न है (40 + 55)/2 = 47.5।",
        ),
      ],
      [
        "62.5",
        t(
          "62.5 is the class mark of 55 – 70, which has 6. The fullest class is 40 – 55: 47.5.",
          "62.5, 55 – 70 का वर्ग चिह्न है, जिसमें 6 हैं। सबसे भरा वर्ग 40 – 55 है: 47.5।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

export const classMarks = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.MeanOfGroupedData],
});
