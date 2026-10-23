import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** The mode formula (Example 5, Exercise 14.2 Q2–Q6, Exercise 14.3 Q6). */
const items = {
  ex5: numItem(
    t(
      "Example 5. Family size of 20 households: 1 – 3: 7, 3 – 5: 8, 5 – 7: 2, 7 – 9: 2, 9 – 11: 1. Find the mode.",
      "उदाहरण 5। 20 घरों के परिवार का आकार: 1 – 3: 7, 3 – 5: 8, 5 – 7: 2, 7 – 9: 2, 9 – 11: 1। बहुलक ज्ञात करो।",
    ),
    "3.286",
    [
      [
        "4.714",
        t(
          "f₀ and f₂ are swapped: f₀ is the class before the modal class, f₂ the class after.",
          "f₀ और f₂ उलट गए: f₀ बहुलक वर्ग से पहले वाला वर्ग है, f₂ बाद वाला।",
        ),
      ],
      [
        "4.000",
        t(
          "That's just the class mark of the modal class. The mode leans towards the fuller neighbour; use the formula.",
          "यह बस बहुलक वर्ग का वर्ग चिह्न है। बहुलक ज़्यादा भरे पड़ोसी की ओर झुकता है; सूत्र लगाओ।",
        ),
      ],
    ],
  ),
  q2: numItem(
    t(
      "Exercise 14.2 Q2. Lifetimes (hours) of 225 components: 0 – 20: 10, 20 – 40: 35, 40 – 60: 52, 60 – 80: 61, 80 – 100: 38, 100 – 120: 29. Find the modal lifetime.",
      "प्रश्नावली 14.2 प्र2। 225 पुर्ज़ों का जीवनकाल (घंटे): 0 – 20: 10, 20 – 40: 35, 40 – 60: 52, 60 – 80: 61, 80 – 100: 38, 100 – 120: 29। बहुलक जीवनकाल ज्ञात करो।",
    ),
    "65.625",
    [
      [
        "74.375",
        t(
          "f₀ and f₂ are swapped: f₀ is the class before the modal class, f₂ the class after.",
          "f₀ और f₂ उलट गए: f₀ बहुलक वर्ग से पहले वाला वर्ग है, f₂ बाद वाला।",
        ),
      ],
      [
        "70.000",
        t(
          "That's just the class mark of the modal class. The mode leans towards the fuller neighbour; use the formula.",
          "यह बस बहुलक वर्ग का वर्ग चिह्न है। बहुलक ज़्यादा भरे पड़ोसी की ओर झुकता है; सूत्र लगाओ।",
        ),
      ],
    ],
  ),
  q3: numItem(
    t(
      "Exercise 14.2 Q3. Monthly expenditure (₹) of 200 families: 1000 – 1500: 24, 1500 – 2000: 40, 2000 – 2500: 33, 2500 – 3000: 28, 3000 – 3500: 30, 3500 – 4000: 22, 4000 – 4500: 16, 4500 – 5000: 7. Find the modal expenditure.",
      "प्रश्नावली 14.2 प्र3। 200 परिवारों का मासिक ख़र्च (₹): 1000 – 1500: 24, 1500 – 2000: 40, 2000 – 2500: 33, 2500 – 3000: 28, 3000 – 3500: 30, 3500 – 4000: 22, 4000 – 4500: 16, 4500 – 5000: 7। बहुलक ख़र्च ज्ञात करो।",
    ),
    "1847.83",
    [
      [
        "1652.17",
        t(
          "f₀ and f₂ are swapped: f₀ is the class before the modal class, f₂ the class after.",
          "f₀ और f₂ उलट गए: f₀ बहुलक वर्ग से पहले वाला वर्ग है, f₂ बाद वाला।",
        ),
      ],
      [
        "1750.00",
        t(
          "That's just the class mark of the modal class. The mode leans towards the fuller neighbour; use the formula.",
          "यह बस बहुलक वर्ग का वर्ग चिह्न है। बहुलक ज़्यादा भरे पड़ोसी की ओर झुकता है; सूत्र लगाओ।",
        ),
      ],
    ],
  ),
  q4: numItem(
    t(
      "Exercise 14.2 Q4. Students per teacher in 35 states/U.T.: 15 – 20: 3, 20 – 25: 8, 25 – 30: 9, 30 – 35: 10, 35 – 40: 3, 40 – 45: 0, 45 – 50: 0, 50 – 55: 2. Find the mode.",
      "प्रश्नावली 14.2 प्र4। 35 राज्यों/संघ क्षेत्रों में प्रति शिक्षक विद्यार्थी: 15 – 20: 3, 20 – 25: 8, 25 – 30: 9, 30 – 35: 10, 35 – 40: 3, 40 – 45: 0, 45 – 50: 0, 50 – 55: 2। बहुलक ज्ञात करो।",
    ),
    "30.6",
    [
      [
        "34.4",
        t(
          "f₀ and f₂ are swapped: f₀ is the class before the modal class, f₂ the class after.",
          "f₀ और f₂ उलट गए: f₀ बहुलक वर्ग से पहले वाला वर्ग है, f₂ बाद वाला।",
        ),
      ],
      [
        "32.5",
        t(
          "That's just the class mark of the modal class. The mode leans towards the fuller neighbour; use the formula.",
          "यह बस बहुलक वर्ग का वर्ग चिह्न है। बहुलक ज़्यादा भरे पड़ोसी की ओर झुकता है; सूत्र लगाओ।",
        ),
      ],
    ],
  ),
  q5: numItem(
    t(
      "Exercise 14.2 Q5. Runs scored by top batsmen in ODIs: 3000 – 4000: 4, 4000 – 5000: 18, 5000 – 6000: 9, 6000 – 7000: 7, 7000 – 8000: 6, 8000 – 9000: 3, 9000 – 10000: 1, 10000 – 11000: 1. Find the mode.",
      "प्रश्नावली 14.2 प्र5। वनडे में शीर्ष बल्लेबाज़ों के रन: 3000 – 4000: 4, 4000 – 5000: 18, 5000 – 6000: 9, 6000 – 7000: 7, 7000 – 8000: 6, 8000 – 9000: 3, 9000 – 10000: 1, 10000 – 11000: 1। बहुलक ज्ञात करो।",
    ),
    "4608.7",
    [
      [
        "4391.3",
        t(
          "f₀ and f₂ are swapped: f₀ is the class before the modal class, f₂ the class after.",
          "f₀ और f₂ उलट गए: f₀ बहुलक वर्ग से पहले वाला वर्ग है, f₂ बाद वाला।",
        ),
      ],
      [
        "4500.0",
        t(
          "That's just the class mark of the modal class. The mode leans towards the fuller neighbour; use the formula.",
          "यह बस बहुलक वर्ग का वर्ग चिह्न है। बहुलक ज़्यादा भरे पड़ोसी की ओर झुकता है; सूत्र लगाओ।",
        ),
      ],
    ],
  ),
  q6: numItem(
    t(
      "Exercise 14.2 Q6. Cars passing a spot in 100 periods of 3 minutes: 0 – 10: 7, 10 – 20: 14, 20 – 30: 13, 30 – 40: 12, 40 – 50: 20, 50 – 60: 11, 60 – 70: 15, 70 – 80: 8. Find the mode.",
      "प्रश्नावली 14.2 प्र6। 3 मिनट के 100 अंतरालों में एक जगह से गुज़री कारें: 0 – 10: 7, 10 – 20: 14, 20 – 30: 13, 30 – 40: 12, 40 – 50: 20, 50 – 60: 11, 60 – 70: 15, 70 – 80: 8। बहुलक ज्ञात करो।",
    ),
    "44.7",
    [
      [
        "45.3",
        t(
          "f₀ and f₂ are swapped: f₀ is the class before the modal class, f₂ the class after.",
          "f₀ और f₂ उलट गए: f₀ बहुलक वर्ग से पहले वाला वर्ग है, f₂ बाद वाला।",
        ),
      ],
      [
        "45.0",
        t(
          "That's just the class mark of the modal class. The mode leans towards the fuller neighbour; use the formula.",
          "यह बस बहुलक वर्ग का वर्ग चिह्न है। बहुलक ज़्यादा भरे पड़ोसी की ओर झुकता है; सूत्र लगाओ।",
        ),
      ],
    ],
  ),
  surnames: numItem(
    t(
      "Exercise 14.3 Q6. Letters in 100 surnames: 1 – 4: 6, 4 – 7: 30, 7 – 10: 40, 10 – 13: 16, 13 – 16: 4, 16 – 19: 4. Find the modal size of surnames.",
      "प्रश्नावली 14.3 प्र6। 100 उपनामों में अक्षर: 1 – 4: 6, 4 – 7: 30, 7 – 10: 40, 10 – 13: 16, 13 – 16: 4, 16 – 19: 4। उपनामों का बहुलक आकार ज्ञात करो।",
    ),
    "7.88",
    [
      [
        "9.12",
        t(
          "f₀ and f₂ are swapped: f₀ is the class before the modal class, f₂ the class after.",
          "f₀ और f₂ उलट गए: f₀ बहुलक वर्ग से पहले वाला वर्ग है, f₂ बाद वाला।",
        ),
      ],
      [
        "8.50",
        t(
          "That's just the class mark of the modal class. The mode leans towards the fuller neighbour; use the formula.",
          "यह बस बहुलक वर्ग का वर्ग चिह्न है। बहुलक ज़्यादा भरे पड़ोसी की ओर झुकता है; सूत्र लगाओ।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

export const modeGrouped = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.ModeOfGroupedData],
});
