import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** The modal class, ungrouped mode, and mode against mean (Examples 4 and 6, Exercise 14.2 Q1, Q3–Q5). */
const items = {
  ex4: numItem(
    t(
      "Example 4. Wickets taken by a bowler in 10 matches: 2, 6, 4, 5, 0, 2, 1, 3, 2, 3. What is the mode?",
      "उदाहरण 4। एक गेंदबाज़ के 10 मैचों में विकेट: 2, 6, 4, 5, 0, 2, 1, 3, 2, 3। बहुलक क्या है?",
    ),
    "2",
    [
      [
        "3",
        t(
          "3 is how often 2 appears. The mode is the value: 2.",
          "3 यह है कि 2 कितनी बार आता है। बहुलक मान है: 2।",
        ),
      ],
      [
        "6",
        t(
          "6 is the largest value, seen once. 2 appears three times.",
          "6 सबसे बड़ा मान है, एक बार आया। 2 तीन बार आता है।",
        ),
      ],
    ],
  ),
  ex6: numItem(
    t(
      "Example 6. Riya's marks: 10 – 25: 2, 25 – 40: 3, 40 – 55: 7, 55 – 70: 6, 70 – 85: 6, 85 – 100: 6. Their mean is 62. What is their mode?",
      "उदाहरण 6। रिया के अंक: 10 – 25: 2, 25 – 40: 3, 40 – 55: 7, 55 – 70: 6, 70 – 85: 6, 85 – 100: 6। इनका माध्य 62 है। इनका बहुलक क्या है?",
    ),
    "52",
    [
      [
        "62",
        t(
          "62 is the mean. The mode is 40 + (7 − 3)/(14 − 3 − 6) × 15 = 52.",
          "62 माध्य है। बहुलक है 40 + (7 − 3)/(14 − 3 − 6) × 15 = 52।",
        ),
      ],
      [
        "47.5",
        t(
          "That's just the class mark of the modal class. The mode leans towards the fuller neighbour; use the formula.",
          "यह बस बहुलक वर्ग का वर्ग चिह्न है। बहुलक ज़्यादा भरे पड़ोसी की ओर झुकता है; सूत्र लगाओ।",
        ),
      ],
    ],
  ),
  modal5: numItem(
    t(
      "Exercise 14.2 Q5. Runs: 3000 – 4000: 4, 4000 – 5000: 18, 5000 – 6000: 9, 6000 – 7000: 7, … Which is the modal class?",
      "प्रश्नावली 14.2 प्र5। रन: 3000 – 4000: 4, 4000 – 5000: 18, 5000 – 6000: 9, 6000 – 7000: 7, … बहुलक वर्ग कौन-सा है?",
    ),
    "4000 – 5000",
    [
      [
        "3000 – 4000",
        t(
          "The modal class has the highest frequency, 18: 4000 – 5000.",
          "बहुलक वर्ग की बारंबारता सबसे अधिक, 18, है: 4000 – 5000।",
        ),
      ],
      [
        "5000 – 6000",
        t(
          "5000 – 6000 has 9. The fullest class, 18, is 4000 – 5000.",
          "5000 – 6000 में 9 हैं। सबसे भरा वर्ग, 18, 4000 – 5000 है।",
        ),
      ],
    ],
  ),
  q1mean: numItem(
    t(
      "Exercise 14.2 Q1. Ages of patients: 5 – 15: 6, 15 – 25: 11, 25 – 35: 21, 35 – 45: 23, 45 – 55: 14, 55 – 65: 5. The mode is 36.8. What is the mean?",
      "प्रश्नावली 14.2 प्र1। मरीज़ों की आयु: 5 – 15: 6, 15 – 25: 11, 25 – 35: 21, 35 – 45: 23, 45 – 55: 14, 55 – 65: 5। बहुलक 36.8 है। माध्य क्या है?",
    ),
    "35.37",
    [
      [
        "36.80",
        t(
          "36.8 is the mode. The mean is Σfᵢxᵢ/Σfᵢ = 2830/80 = 35.37.",
          "36.8 बहुलक है। माध्य है Σfᵢxᵢ/Σfᵢ = 2830/80 = 35.37।",
        ),
      ],
      [
        "35.00",
        t(
          "That averages the class marks without the frequencies. Weight them: 2830/80 = 35.37.",
          "यह बारंबारताओं के बिना वर्ग चिह्नों का औसत है। भार दो: 2830/80 = 35.37।",
        ),
      ],
    ],
  ),
  q3mean: numItem(
    t(
      "Exercise 14.2 Q3. The families' monthly expenditure has mode ₹1847.83. With a = 2750 and h = 500, Σfᵢuᵢ = −35 over 200 families. What is the mean?",
      "प्रश्नावली 14.2 प्र3। परिवारों के मासिक ख़र्च का बहुलक ₹1847.83 है। a = 2750 और h = 500 लेने पर 200 परिवारों में Σfᵢuᵢ = −35। माध्य क्या है?",
    ),
    "2662.5",
    [
      [
        "2749.8",
        t("Multiply by h too: x̄ = a + h × Σfᵢuᵢ/Σfᵢ.", "h से भी गुणा करो: x̄ = a + h × Σfᵢuᵢ/Σfᵢ।"),
      ],
      [
        "2837.5",
        t(
          "Σfᵢuᵢ is negative: 2750 − 500 × 35/200 = 2662.5.",
          "Σfᵢuᵢ ऋणात्मक है: 2750 − 500 × 35/200 = 2662.5।",
        ),
      ],
    ],
  ),
  q4mean: numItem(
    t(
      "Exercise 14.2 Q4. Students per teacher: mode 30.6. Σfᵢxᵢ = 1022.5 over 35 states/U.T. Which statement is right?",
      "प्रश्नावली 14.2 प्र4। प्रति शिक्षक विद्यार्थी: बहुलक 30.6। 35 राज्यों/संघ क्षेत्रों में Σfᵢxᵢ = 1022.5। कौन-सा कथन सही है?",
    ),
    "Mean 29.2 < Mode 30.6",
    [
      [
        "Mean 30.6 = Mode 30.6",
        t(
          "They needn't be equal: the mean is 1022.5/35 = 29.2.",
          "उनका बराबर होना ज़रूरी नहीं: माध्य 1022.5/35 = 29.2 है।",
        ),
      ],
      [
        "Mean 127.8 > Mode 30.6",
        t(
          "Divide by the 35 states, not the 8 classes: 1022.5/35 = 29.2.",
          "35 राज्यों से भाग दो, 8 वर्गों से नहीं: 1022.5/35 = 29.2।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

export const modeVsMean = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.ModeOfGroupedData],
});
