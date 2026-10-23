import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** The step-deviation method (Example 3, Exercise 14.1 Q4, Q8, Q9). */
const items = {
  ex3: numItem(
    t(
      "Example 3. Wickets taken by 45 bowlers: 20 – 60: 7, 60 – 100: 5, 100 – 150: 16, 150 – 250: 12, 250 – 350: 2, 350 – 450: 3. With a = 200 and h = 20, Σfᵢuᵢ = −106. What is the mean?",
      "उदाहरण 3। 45 गेंदबाज़ों के विकेट: 20 – 60: 7, 60 – 100: 5, 100 – 150: 16, 150 – 250: 12, 250 – 350: 2, 350 – 450: 3। a = 200 और h = 20 लेने पर Σfᵢuᵢ = −106। माध्य क्या है?",
    ),
    "152.89",
    [
      [
        "197.64",
        t("Multiply by h too: x̄ = a + h × Σfᵢuᵢ/Σfᵢ.", "h से भी गुणा करो: x̄ = a + h × Σfᵢuᵢ/Σfᵢ।"),
      ],
      [
        "247.11",
        t(
          "Σfᵢuᵢ is negative, so the mean is below 200: 200 − 20 × 106/45 = 152.89.",
          "Σfᵢuᵢ ऋणात्मक है, तो माध्य 200 से कम है: 200 − 20 × 106/45 = 152.89।",
        ),
      ],
    ],
  ),
  q4: numItem(
    t(
      "Exercise 14.1 Q4. Heartbeats per minute of 30 women: 65 – 68: 2, 68 – 71: 4, 71 – 74: 3, 74 – 77: 8, 77 – 80: 7, 80 – 83: 4, 83 – 86: 2. Find the mean.",
      "प्रश्नावली 14.1 प्र4। 30 महिलाओं की प्रति मिनट धड़कनें: 65 – 68: 2, 68 – 71: 4, 71 – 74: 3, 74 – 77: 8, 77 – 80: 7, 80 – 83: 4, 83 – 86: 2। माध्य ज्ञात करो।",
    ),
    "75.9",
    [
      [
        "75.6",
        t(
          "With a = 75.5, h = 3, Σfᵢuᵢ = 4: multiply by h too, 75.5 + 3 × 4/30 = 75.9.",
          "a = 75.5, h = 3, Σfᵢuᵢ = 4: h से भी गुणा करो, 75.5 + 3 × 4/30 = 75.9।",
        ),
      ],
      [
        "77.2",
        t(
          "You divided by the number of classes. Divide Σfᵢxᵢ by Σfᵢ, the number of observations.",
          "तुमने वर्गों की संख्या से भाग दिया। Σfᵢxᵢ को Σfᵢ, यानी प्रेक्षणों की संख्या, से भाग दो।",
        ),
      ],
    ],
  ),
  q8: numItem(
    t(
      "Exercise 14.1 Q8. Days absent by 40 students: 0 – 6: 11, 6 – 10: 10, 10 – 14: 7, 14 – 20: 4, 20 – 28: 4, 28 – 38: 3, 38 – 40: 1. Find the mean number of days absent.",
      "प्रश्नावली 14.1 प्र8। 40 विद्यार्थियों की अनुपस्थिति के दिन: 0 – 6: 11, 6 – 10: 10, 10 – 14: 7, 14 – 20: 4, 20 – 28: 4, 28 – 38: 3, 38 – 40: 1। अनुपस्थित दिनों का माध्य ज्ञात करो।",
    ),
    "12.48",
    [
      [
        "71.29",
        t(
          "You divided by the number of classes. Divide Σfᵢxᵢ by Σfᵢ, the number of observations.",
          "तुमने वर्गों की संख्या से भाग दिया। Σfᵢxᵢ को Σfᵢ, यानी प्रेक्षणों की संख्या, से भाग दो।",
        ),
      ],
      [
        "19.43",
        t(
          "That averages the class marks without the frequencies. Weight them: 499/40 = 12.48.",
          "यह बारंबारताओं के बिना वर्ग चिह्नों का औसत है। भार दो: 499/40 = 12.48।",
        ),
      ],
    ],
  ),
  q9: numItem(
    t(
      "Exercise 14.1 Q9. Literacy rate (%) of 35 cities: 45 – 55: 3, 55 – 65: 10, 65 – 75: 11, 75 – 85: 8, 85 – 95: 3. With a = 70 and h = 10, Σfᵢuᵢ = −2. Find the mean literacy rate.",
      "प्रश्नावली 14.1 प्र9। 35 शहरों की साक्षरता दर (%): 45 – 55: 3, 55 – 65: 10, 65 – 75: 11, 75 – 85: 8, 85 – 95: 3। a = 70 और h = 10 लेने पर Σfᵢuᵢ = −2। माध्य साक्षरता दर ज्ञात करो।",
    ),
    "69.43",
    [
      [
        "69.94",
        t("Multiply by h too: x̄ = a + h × Σfᵢuᵢ/Σfᵢ.", "h से भी गुणा करो: x̄ = a + h × Σfᵢuᵢ/Σfᵢ।"),
      ],
      [
        "70.57",
        t(
          "Σfᵢuᵢ is negative, so subtract: 70 − 10 × 2/35 = 69.43.",
          "Σfᵢuᵢ ऋणात्मक है, तो घटाओ: 70 − 10 × 2/35 = 69.43।",
        ),
      ],
    ],
  ),
  uvalue: numItem(
    t(
      "Example 3 takes a = 200 and h = 20. What is uᵢ for the class 100 – 150?",
      "उदाहरण 3 में a = 200 और h = 20 है। वर्ग 100 – 150 के लिए uᵢ क्या है?",
    ),
    "−3.75",
    [
      [
        "−75",
        t(
          "−75 is dᵢ = 125 − 200. Divide by h: uᵢ = −75/20 = −3.75.",
          "−75, dᵢ = 125 − 200 है। h से भाग दो: uᵢ = −75/20 = −3.75।",
        ),
      ],
      [
        "−2.5",
        t(
          "Use the class mark 125, not the lower limit 150: (125 − 200)/20 = −3.75.",
          "वर्ग चिह्न 125 लो, निम्न सीमा 150 नहीं: (125 − 200)/20 = −3.75।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

export const stepDeviation = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.AssumedMeanAndStepDeviation],
});
