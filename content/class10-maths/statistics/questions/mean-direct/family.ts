import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** The direct method (Example 1, Exercise 14.1 Q1, Q3, Q5, Q7). */
const items = {
  ex1: numItem(
    t(
      "Example 1. Marks of 30 students: 10 – 25: 2, 25 – 40: 3, 40 – 55: 7, 55 – 70: 6, 70 – 85: 6, 85 – 100: 6. Σfᵢxᵢ = 1860. What is the mean?",
      "उदाहरण 1। 30 विद्यार्थियों के अंक: 10 – 25: 2, 25 – 40: 3, 40 – 55: 7, 55 – 70: 6, 70 – 85: 6, 85 – 100: 6। Σfᵢxᵢ = 1860। माध्य क्या है?",
    ),
    "62",
    [
      [
        "310",
        t(
          "You divided by the number of classes. Divide Σfᵢxᵢ by Σfᵢ, the number of observations.",
          "तुमने वर्गों की संख्या से भाग दिया। Σfᵢxᵢ को Σfᵢ, यानी प्रेक्षणों की संख्या, से भाग दो।",
        ),
      ],
      [
        "55",
        t(
          "55 averages the six class marks and ignores how many students are in each. Weight them: 1860/30 = 62.",
          "55 छह वर्ग चिह्नों का सीधा औसत है और हर वर्ग के विद्यार्थियों को नज़रअंदाज़ करता है। भार दो: 1860/30 = 62।",
        ),
      ],
    ],
  ),
  q1: numItem(
    t(
      "Exercise 14.1 Q1. Plants per house in 20 houses: 0 – 2: 1, 2 – 4: 2, 4 – 6: 1, 6 – 8: 5, 8 – 10: 6, 10 – 12: 2, 12 – 14: 3. Find the mean number of plants per house.",
      "प्रश्नावली 14.1 प्र1। 20 घरों में प्रति घर पौधे: 0 – 2: 1, 2 – 4: 2, 4 – 6: 1, 6 – 8: 5, 8 – 10: 6, 10 – 12: 2, 12 – 14: 3। प्रति घर पौधों का माध्य ज्ञात करो।",
    ),
    "8.1",
    [
      [
        "23.1",
        t(
          "You divided by the number of classes. Divide Σfᵢxᵢ by Σfᵢ, the number of observations.",
          "तुमने वर्गों की संख्या से भाग दिया। Σfᵢxᵢ को Σfᵢ, यानी प्रेक्षणों की संख्या, से भाग दो।",
        ),
      ],
      [
        "9.1",
        t(
          "That uses the upper limits. Use the class marks, the midpoints of the classes.",
          "इसमें उपरी सीमाएँ ली गईं। वर्ग चिह्न, यानी वर्गों के मध्य-बिंदु, लो।",
        ),
      ],
    ],
  ),
  q3: numItem(
    t(
      "Exercise 14.1 Q3. Daily pocket allowance (₹): 11 – 13: 7, 13 – 15: 6, 15 – 17: 9, 17 – 19: 13, 19 – 21: f, 21 – 23: 5, 23 – 25: 4. The mean is ₹18. Find f.",
      "प्रश्नावली 14.1 प्र3। दैनिक जेब ख़र्च (₹): 11 – 13: 7, 13 – 15: 6, 15 – 17: 9, 17 – 19: 13, 19 – 21: f, 21 – 23: 5, 23 – 25: 4। माध्य ₹18 है। f ज्ञात करो।",
    ),
    "20",
    [
      [
        "2",
        t(
          "Σfᵢ is 44 + f, not 44. Then 18(44 + f) = 752 + 20f gives f = 20.",
          "Σfᵢ, 44 + f है, 44 नहीं। तब 18(44 + f) = 752 + 20f से f = 20।",
        ),
      ],
      [
        "40",
        t(
          "From 792 + 18f = 752 + 20f, 2f = 40, so f = 20.",
          "792 + 18f = 752 + 20f से 2f = 40, तो f = 20।",
        ),
      ],
    ],
  ),
  q5: numItem(
    t(
      "Exercise 14.1 Q5. Mangoes per box in 400 boxes: 50 – 52: 15, 53 – 55: 110, 56 – 58: 135, 59 – 61: 115, 62 – 64: 25. Find the mean number of mangoes per box.",
      "प्रश्नावली 14.1 प्र5। 400 पेटियों में प्रति पेटी आम: 50 – 52: 15, 53 – 55: 110, 56 – 58: 135, 59 – 61: 115, 62 – 64: 25। प्रति पेटी आमों का माध्य ज्ञात करो।",
    ),
    "57.19",
    [
      [
        "57.00",
        t(
          "57 averages the class marks without the frequencies. Weight them: 22875/400 = 57.19.",
          "57 बारंबारताओं के बिना वर्ग चिह्नों का औसत है। भार दो: 22875/400 = 57.19।",
        ),
      ],
      [
        "58.19",
        t(
          "That uses the upper limits. Use the class marks, the midpoints of the classes.",
          "इसमें उपरी सीमाएँ ली गईं। वर्ग चिह्न, यानी वर्गों के मध्य-बिंदु, लो।",
        ),
      ],
    ],
  ),
  q7: numItem(
    t(
      "Exercise 14.1 Q7. SO₂ concentration (ppm) on 30 days: 0.00 – 0.04: 4, 0.04 – 0.08: 9, 0.08 – 0.12: 9, 0.12 – 0.16: 2, 0.16 – 0.20: 4, 0.20 – 0.24: 2. Find the mean concentration.",
      "प्रश्नावली 14.1 प्र7। 30 दिनों में SO₂ की सांद्रता (ppm): 0.00 – 0.04: 4, 0.04 – 0.08: 9, 0.08 – 0.12: 9, 0.12 – 0.16: 2, 0.16 – 0.20: 4, 0.20 – 0.24: 2। माध्य सांद्रता ज्ञात करो।",
    ),
    "0.099",
    [
      [
        "0.493",
        t(
          "You divided by the number of classes. Divide Σfᵢxᵢ by Σfᵢ, the number of observations.",
          "तुमने वर्गों की संख्या से भाग दिया। Σfᵢxᵢ को Σfᵢ, यानी प्रेक्षणों की संख्या, से भाग दो।",
        ),
      ],
      [
        "0.119",
        t(
          "That uses the upper limits. Use the class marks, the midpoints of the classes.",
          "इसमें उपरी सीमाएँ ली गईं। वर्ग चिह्न, यानी वर्गों के मध्य-बिंदु, लो।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

export const meanDirect = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.MeanOfGroupedData],
});
