import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** The median formula (Table 14.11, Table 14.12, Example 7, Exercise 14.3 Q1, Q3–Q7). */
const items = {
  raw: numItem(
    t(
      "Table 14.11. Marks of 100 students in order: 20: 6, 25: 20, 28: 24, 29: 28, 33: 15, 38: 4, 42: 2, 43: 1. Find the median.",
      "तालिका 14.11। 100 विद्यार्थियों के अंक क्रम में: 20: 6, 25: 20, 28: 24, 29: 28, 33: 15, 38: 4, 42: 2, 43: 1। माध्यक ज्ञात करो।",
    ),
    "28.5",
    [
      [
        "29",
        t(
          "29 is the 51st mark only. n is even: average the 50th (28) and 51st (29) marks.",
          "29 सिर्फ़ इक्यावनवाँ अंक है। n सम है: पचासवें (28) और इक्यावनवें (29) का औसत लो।",
        ),
      ],
      [
        "31.5",
        t(
          "That is halfway between 20 and 43. The median is the middle observation: 28.5.",
          "यह 20 और 43 के बीच का आधा है। माध्यक बीच वाला प्रेक्षण है: 28.5।",
        ),
      ],
    ],
  ),
  t1412: numItem(
    t(
      "Table 14.12. n = 53, median class 60 – 70 with f = 7, and cf = 22 before it. Find the median.",
      "तालिका 14.12। n = 53, माध्यक वर्ग 60 – 70 जिसकी f = 7, और उससे पहले cf = 22। माध्यक ज्ञात करो।",
    ),
    "66.43",
    [
      [
        "56.43",
        t(
          "cf is the cumulative frequency of the class before the median class, not of the median class itself.",
          "cf माध्यक वर्ग से पहले वाले वर्ग की संचयी बारंबारता है, ख़ुद माध्यक वर्ग की नहीं।",
        ),
      ],
      [
        "60.64",
        t(
          "Multiply by h, the class size, too: l + ((n/2 − cf)/f) × h.",
          "h, यानी वर्ग माप, से भी गुणा करो: l + ((n/2 − cf)/f) × h।",
        ),
      ],
    ],
  ),
  ex7: numItem(
    t(
      "Example 7. Heights of 51 girls: less than 140: 4, 145: 11, 150: 29, 155: 40, 160: 46, 165: 51. Find the median height.",
      "उदाहरण 7। 51 लड़कियों की लंबाई: 140 से कम: 4, 145: 11, 150: 29, 155: 40, 160: 46, 165: 51। माध्यक लंबाई ज्ञात करो।",
    ),
    "149.03",
    [
      [
        "144.03",
        t(
          "cf is the cumulative frequency of the class before the median class, not of the median class itself.",
          "cf माध्यक वर्ग से पहले वाले वर्ग की संचयी बारंबारता है, ख़ुद माध्यक वर्ग की नहीं।",
        ),
      ],
      [
        "145.81",
        t(
          "Multiply by h, the class size, too: l + ((n/2 − cf)/f) × h.",
          "h, यानी वर्ग माप, से भी गुणा करो: l + ((n/2 − cf)/f) × h।",
        ),
      ],
    ],
  ),
  q1: numItem(
    t(
      "Exercise 14.3 Q1. Electricity use of 68 consumers: 65 – 85: 4, 85 – 105: 5, 105 – 125: 13, 125 – 145: 20, 145 – 165: 14, 165 – 185: 8, 185 – 205: 4. Find the median.",
      "प्रश्नावली 14.3 प्र1। 68 उपभोक्ताओं की बिजली खपत: 65 – 85: 4, 85 – 105: 5, 105 – 125: 13, 125 – 145: 20, 145 – 165: 14, 165 – 185: 8, 185 – 205: 4। माध्यक ज्ञात करो।",
    ),
    "137.0",
    [
      [
        "117.0",
        t(
          "cf is the cumulative frequency of the class before the median class, not of the median class itself.",
          "cf माध्यक वर्ग से पहले वाले वर्ग की संचयी बारंबारता है, ख़ुद माध्यक वर्ग की नहीं।",
        ),
      ],
      [
        "125.6",
        t(
          "Multiply by h, the class size, too: l + ((n/2 − cf)/f) × h.",
          "h, यानी वर्ग माप, से भी गुणा करो: l + ((n/2 − cf)/f) × h।",
        ),
      ],
    ],
  ),
  q3: numItem(
    t(
      "Exercise 14.3 Q3. Ages of 100 policy holders: below 20: 2, 25: 6, 30: 24, 35: 45, 40: 78, 45: 89, 50: 92, 55: 98, 60: 100. Find the median age.",
      "प्रश्नावली 14.3 प्र3। 100 पॉलिसीधारकों की आयु: 20 से कम: 2, 25: 6, 30: 24, 35: 45, 40: 78, 45: 89, 50: 92, 55: 98, 60: 100। माध्यक आयु ज्ञात करो।",
    ),
    "35.76",
    [
      [
        "30.76",
        t(
          "cf is the cumulative frequency of the class before the median class, not of the median class itself.",
          "cf माध्यक वर्ग से पहले वाले वर्ग की संचयी बारंबारता है, ख़ुद माध्यक वर्ग की नहीं।",
        ),
      ],
      [
        "35.15",
        t(
          "Multiply by h, the class size, too: l + ((n/2 − cf)/f) × h.",
          "h, यानी वर्ग माप, से भी गुणा करो: l + ((n/2 − cf)/f) × h।",
        ),
      ],
    ],
  ),
  q4: numItem(
    t(
      "Exercise 14.3 Q4. Lengths (mm) of 40 leaves: 118 – 126: 3, 127 – 135: 5, 136 – 144: 9, 145 – 153: 12, 154 – 162: 5, 163 – 171: 4, 172 – 180: 2. Find the median length.",
      "प्रश्नावली 14.3 प्र4। 40 पत्तियों की लंबाई (मिमी): 118 – 126: 3, 127 – 135: 5, 136 – 144: 9, 145 – 153: 12, 154 – 162: 5, 163 – 171: 4, 172 – 180: 2। माध्यक लंबाई ज्ञात करो।",
    ),
    "146.75",
    [
      [
        "147.25",
        t(
          "These classes have gaps. Make them continuous first (144.5 – 153.5), so l = 144.5 and h = 9: 146.75.",
          "इन वर्गों के बीच अंतर है। पहले इन्हें संतत बनाओ (144.5 – 153.5), तो l = 144.5 और h = 9: 146.75।",
        ),
      ],
      [
        "137.75",
        t(
          "cf is the cumulative frequency of the class before the median class, not of the median class itself.",
          "cf माध्यक वर्ग से पहले वाले वर्ग की संचयी बारंबारता है, ख़ुद माध्यक वर्ग की नहीं।",
        ),
      ],
    ],
  ),
  q5: numItem(
    t(
      "Exercise 14.3 Q5. Lifetimes (hours) of 400 lamps: 1500 – 2000: 14, 2000 – 2500: 56, 2500 – 3000: 60, 3000 – 3500: 86, 3500 – 4000: 74, 4000 – 4500: 62, 4500 – 5000: 48. Find the median lifetime.",
      "प्रश्नावली 14.3 प्र5। 400 लैम्पों का जीवनकाल (घंटे): 1500 – 2000: 14, 2000 – 2500: 56, 2500 – 3000: 60, 3000 – 3500: 86, 3500 – 4000: 74, 4000 – 4500: 62, 4500 – 5000: 48। माध्यक जीवनकाल ज्ञात करो।",
    ),
    "3406.98",
    [
      [
        "2906.98",
        t(
          "cf is the cumulative frequency of the class before the median class, not of the median class itself.",
          "cf माध्यक वर्ग से पहले वाले वर्ग की संचयी बारंबारता है, ख़ुद माध्यक वर्ग की नहीं।",
        ),
      ],
      [
        "3000.81",
        t(
          "Multiply by h, the class size, too: l + ((n/2 − cf)/f) × h.",
          "h, यानी वर्ग माप, से भी गुणा करो: l + ((n/2 − cf)/f) × h।",
        ),
      ],
    ],
  ),
  q6: numItem(
    t(
      "Exercise 14.3 Q6. Letters in 100 surnames: 1 – 4: 6, 4 – 7: 30, 7 – 10: 40, 10 – 13: 16, 13 – 16: 4, 16 – 19: 4. Find the median number of letters.",
      "प्रश्नावली 14.3 प्र6। 100 उपनामों में अक्षर: 1 – 4: 6, 4 – 7: 30, 7 – 10: 40, 10 – 13: 16, 13 – 16: 4, 16 – 19: 4। अक्षरों की माध्यक संख्या ज्ञात करो।",
    ),
    "8.05",
    [
      [
        "5.05",
        t(
          "cf is the cumulative frequency of the class before the median class, not of the median class itself.",
          "cf माध्यक वर्ग से पहले वाले वर्ग की संचयी बारंबारता है, ख़ुद माध्यक वर्ग की नहीं।",
        ),
      ],
      [
        "7.35",
        t(
          "Multiply by h, the class size, too: l + ((n/2 − cf)/f) × h.",
          "h, यानी वर्ग माप, से भी गुणा करो: l + ((n/2 − cf)/f) × h।",
        ),
      ],
    ],
  ),
  q7: numItem(
    t(
      "Exercise 14.3 Q7. Weights (kg) of 30 students: 40 – 45: 2, 45 – 50: 3, 50 – 55: 8, 55 – 60: 6, 60 – 65: 6, 65 – 70: 3, 70 – 75: 2. Find the median weight.",
      "प्रश्नावली 14.3 प्र7। 30 विद्यार्थियों का भार (किग्रा): 40 – 45: 2, 45 – 50: 3, 50 – 55: 8, 55 – 60: 6, 60 – 65: 6, 65 – 70: 3, 70 – 75: 2। माध्यक भार ज्ञात करो।",
    ),
    "56.67",
    [
      [
        "51.67",
        t(
          "cf is the cumulative frequency of the class before the median class, not of the median class itself.",
          "cf माध्यक वर्ग से पहले वाले वर्ग की संचयी बारंबारता है, ख़ुद माध्यक वर्ग की नहीं।",
        ),
      ],
      [
        "56.25",
        t(
          "The cf first passes n/2 = 15 in 55 – 60 (cf 19), so that is the median class, not 50 – 55.",
          "cf पहली बार n/2 = 15 को 55 – 60 (cf 19) में पार करता है, तो वही माध्यक वर्ग है, 50 – 55 नहीं।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

export const medianGrouped = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.MedianOfGroupedData],
});
