import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** Cumulative frequency and the median class (Tables 14.11–14.14, Example 7, Exercise 14.3 Q1 and Q3). */
const items = {
  below60: numItem(
    t(
      "Table 14.12. Marks of 53 students: 0 – 10: 5, 10 – 20: 3, 20 – 30: 4, 30 – 40: 3, 40 – 50: 3, 50 – 60: 4, 60 – 70: 7, … How many scored less than 60?",
      "तालिका 14.12। 53 विद्यार्थियों के अंक: 0 – 10: 5, 10 – 20: 3, 20 – 30: 4, 30 – 40: 3, 40 – 50: 3, 50 – 60: 4, 60 – 70: 7, … कितनों के 60 से कम अंक आए?",
    ),
    "22",
    [
      [
        "29",
        t(
          "29 includes 60 – 70. Less than 60 stops at 50 – 60: 5 + 3 + 4 + 3 + 3 + 4 = 22.",
          "29 में 60 – 70 भी है। 60 से कम 50 – 60 पर रुकता है: 5 + 3 + 4 + 3 + 3 + 4 = 22।",
        ),
      ],
      [
        "4",
        t(
          "4 is only 50 – 60. Add every class below 60: 22.",
          "4 सिर्फ़ 50 – 60 है। 60 से नीचे के सब वर्ग जोड़ो: 22।",
        ),
      ],
    ],
  ),
  more60: numItem(
    t(
      "Table 14.12 has 53 students, and 22 of them scored less than 60. How many scored 60 or more?",
      "तालिका 14.12 में 53 विद्यार्थी हैं, और उनमें से 22 के 60 से कम अंक आए। कितनों के 60 या ज़्यादा आए?",
    ),
    "31",
    [
      [
        "22",
        t(
          "22 is the less-than count. The more-than count is 53 − 22 = 31.",
          "22 से कम प्रकार की गिनती है। से अधिक प्रकार की गिनती 53 − 22 = 31 है।",
        ),
      ],
      ["75", t("Subtract, don't add: 53 − 22 = 31.", "जोड़ो नहीं, घटाओ: 53 − 22 = 31।")],
    ],
  ),
  ex7f: numItem(
    t(
      "Example 7. Girls' heights: less than 145 cm: 11, less than 150: 29, less than 155: 40. How many girls are in 150 – 155?",
      "उदाहरण 7। लड़कियों की लंबाई: 145 सेमी से कम: 11, 150 से कम: 29, 155 से कम: 40। 150 – 155 में कितनी लड़कियाँ हैं?",
    ),
    "11",
    [
      [
        "40",
        t(
          "40 is the cumulative count below 155. The class itself has 40 − 29 = 11.",
          "40, 155 से नीचे की संचयी गिनती है। वर्ग में ख़ुद 40 − 29 = 11 हैं।",
        ),
      ],
      [
        "18",
        t(
          "18 is the 145 – 150 class, 29 − 11. For 150 – 155: 40 − 29 = 11.",
          "18, 145 – 150 वर्ग है, 29 − 11। 150 – 155 के लिए: 40 − 29 = 11।",
        ),
      ],
    ],
  ),
  q3f: numItem(
    t(
      "Exercise 14.3 Q3. Policy holders: below 35 years: 45, below 40: 78. How many are aged 35 – 40?",
      "प्रश्नावली 14.3 प्र3। पॉलिसीधारक: 35 वर्ष से कम: 45, 40 से कम: 78। 35 – 40 आयु के कितने हैं?",
    ),
    "33",
    [
      [
        "78",
        t(
          "78 is everyone below 40. Subtract those below 35: 78 − 45 = 33.",
          "78, 40 से नीचे के सभी हैं। 35 से नीचे वालों को घटाओ: 78 − 45 = 33।",
        ),
      ],
      [
        "123",
        t(
          "Subtract the counts, don't add them: 78 − 45 = 33.",
          "गिनतियाँ घटाओ, जोड़ो नहीं: 78 − 45 = 33।",
        ),
      ],
    ],
  ),
  mclass: numItem(
    t(
      "Table 14.12: n = 53 and the cumulative frequencies run 5, 8, 12, 15, 18, 22, 29, 38, 45, 53 for 0 – 10, …, 90 – 100. Which is the median class?",
      "तालिका 14.12: n = 53 और संचयी बारंबारताएँ 0 – 10, …, 90 – 100 के लिए 5, 8, 12, 15, 18, 22, 29, 38, 45, 53 हैं। माध्यक वर्ग कौन-सा है?",
    ),
    "60 – 70",
    [
      [
        "50 – 60",
        t(
          "Its cf, 22, is below n/2 = 26.5. The first cf above 26.5 is 29, for 60 – 70.",
          "इसका cf, 22, n/2 = 26.5 से कम है। 26.5 से ऊपर पहला cf 29 है, 60 – 70 का।",
        ),
      ],
      [
        "70 – 80",
        t(
          "70 – 80 is the fullest class (the modal class). The median class is the first cf above 26.5: 60 – 70.",
          "70 – 80 सबसे भरा वर्ग (बहुलक वर्ग) है। माध्यक वर्ग 26.5 से ऊपर पहला cf वाला है: 60 – 70।",
        ),
      ],
    ],
  ),
  q1class: numItem(
    t(
      "Exercise 14.3 Q1. Electricity use of 68 consumers: 65 – 85: 4, 85 – 105: 5, 105 – 125: 13, 125 – 145: 20, 145 – 165: 14, 165 – 185: 8, 185 – 205: 4. Which is the median class?",
      "प्रश्नावली 14.3 प्र1। 68 उपभोक्ताओं की बिजली खपत: 65 – 85: 4, 85 – 105: 5, 105 – 125: 13, 125 – 145: 20, 145 – 165: 14, 165 – 185: 8, 185 – 205: 4। माध्यक वर्ग कौन-सा है?",
    ),
    "125 – 145",
    [
      [
        "105 – 125",
        t(
          "Its cf is 22, below n/2 = 34. The cf first passes 34 at 42, in 125 – 145.",
          "इसका cf 22 है, n/2 = 34 से कम। cf पहली बार 42 पर 34 पार करता है, 125 – 145 में।",
        ),
      ],
      [
        "145 – 165",
        t(
          "By 145 the cf is already 42, past 34. The median class is 125 – 145.",
          "145 तक cf पहले ही 42 है, 34 से आगे। माध्यक वर्ग 125 – 145 है।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

export const cumulativeFrequency = bankFamily(items, {
  level: Level.Easy,
  tests: [Concept.MedianOfGroupedData],
});
