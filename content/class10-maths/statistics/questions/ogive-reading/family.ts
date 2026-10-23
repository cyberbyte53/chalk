import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

/** Reading the median and counts off ogives (Section 14.5, Example 9, Exercise 14.4 Q1–Q3). */
const items = {
  height: numItem(
    t(
      "To read the median off a less-than ogive of 53 students, at what height do you go across?",
      "53 विद्यार्थियों के से कम प्रकार के तोरण से माध्यक पढ़ने के लिए किस ऊँचाई से आड़े चलते हो?",
    ),
    "26.5",
    [
      [
        "53",
        t(
          "53 is the top of the curve, everyone. Half of them is n/2 = 26.5.",
          "53 वक्र का शीर्ष है, यानी सभी। उनका आधा n/2 = 26.5 है।",
        ),
      ],
      [
        "27",
        t(
          "Don't round n/2: go across at exactly 53/2 = 26.5.",
          "n/2 को पूर्णांकित मत करो: ठीक 53/2 = 26.5 से आड़े चलो।",
        ),
      ],
    ],
  ),
  ex9: numItem(
    t(
      "Example 9. The two ogives of the 30 shops' profits cross. What is the x-value of the crossing?",
      "उदाहरण 9। 30 दुकानों के लाभ के दोनों तोरण काटते हैं। काटने के बिंदु का x-मान क्या है?",
    ),
    "17.5",
    [
      [
        "15.0",
        t(
          "15 is the height of the crossing, n/2. Its x-value is the median: 17.5.",
          "15 काटने के बिंदु की ऊँचाई, n/2, है। उसका x-मान माध्यक है: 17.5।",
        ),
      ],
      [
        "12.5",
        t(
          "12.5 is the class mark of the modal class 10 – 15. The ogives cross at the median, 17.5.",
          "12.5 बहुलक वर्ग 10 – 15 का वर्ग चिह्न है। तोरण माध्यक, 17.5, पर काटते हैं।",
        ),
      ],
    ],
  ),
  income: numItem(
    t(
      "Exercise 14.4 Q1. Read the median daily income off the less-than ogive: 100 – 120: 12, 120 – 140: 14, 140 – 160: 8, 160 – 180: 6, 180 – 200: 10.",
      "प्रश्नावली 14.4 प्र1। से कम प्रकार के तोरण से माध्यक दैनिक आय पढ़ो: 100 – 120: 12, 120 – 140: 14, 140 – 160: 8, 160 – 180: 6, 180 – 200: 10।",
    ),
    "138.57",
    [
      [
        "118.57",
        t(
          "cf is the cumulative frequency of the class before the median class, not of the median class itself.",
          "cf माध्यक वर्ग से पहले वाले वर्ग की संचयी बारंबारता है, ख़ुद माध्यक वर्ग की नहीं।",
        ),
      ],
      [
        "130.00",
        t(
          "130 is the middle of 120 – 140. The curve reaches 25 at 120 + 13/14 × 20 = 138.57.",
          "130, 120 – 140 का बीच है। वक्र 25 पर पहुँचता है 120 + 13/14 × 20 = 138.57 पर।",
        ),
      ],
    ],
  ),
  weights: numItem(
    t(
      "Exercise 14.4 Q2. Weights of 35 students: less than 38: 0, 40: 3, 42: 5, 44: 9, 46: 14, 48: 28, 50: 32, 52: 35. Read the median weight off the ogive.",
      "प्रश्नावली 14.4 प्र2। 35 विद्यार्थियों का भार: 38 से कम: 0, 40: 3, 42: 5, 44: 9, 46: 14, 48: 28, 50: 32, 52: 35। तोरण से माध्यक भार पढ़ो।",
    ),
    "46.5",
    [
      [
        "47.0",
        t(
          "47 is the middle of 46 – 48. The count reaches 17.5 at 46 + 3.5/14 × 2 = 46.5.",
          "47, 46 – 48 का बीच है। गिनती 17.5 पर पहुँचती है 46 + 3.5/14 × 2 = 46.5 पर।",
        ),
      ],
      [
        "44.4",
        t(
          "Only 14 students are below 46, so 17.5 lies past 46: 46.5.",
          "46 से नीचे सिर्फ़ 14 विद्यार्थी हैं, तो 17.5, 46 के बाद है: 46.5।",
        ),
      ],
    ],
  ),
  farms: numItem(
    t(
      "Exercise 14.4 Q3. Read the median yield of the 100 farms off their ogive: 50 – 55: 2, 55 – 60: 8, 60 – 65: 12, 65 – 70: 24, 70 – 75: 38, 75 – 80: 16.",
      "प्रश्नावली 14.4 प्र3। 100 खेतों के तोरण से माध्यक उपज पढ़ो: 50 – 55: 2, 55 – 60: 8, 60 – 65: 12, 65 – 70: 24, 70 – 75: 38, 75 – 80: 16।",
    ),
    "70.53",
    [
      [
        "65.53",
        t(
          "cf is the cumulative frequency of the class before the median class, not of the median class itself.",
          "cf माध्यक वर्ग से पहले वाले वर्ग की संचयी बारंबारता है, ख़ुद माध्यक वर्ग की नहीं।",
        ),
      ],
      [
        "72.50",
        t(
          "72.5 is the class mark of the fullest class. The curve reaches 50 at 70 + 4/38 × 5 = 70.53.",
          "72.5 सबसे भरे वर्ग का वर्ग चिह्न है। वक्र 50 पर पहुँचता है 70 + 4/38 × 5 = 70.53 पर।",
        ),
      ],
    ],
  ),
  below50: numItem(
    t(
      "Table 14.12's less-than ogive passes through (40, 15), (50, 18) and (60, 22). How many students scored below 50?",
      "तालिका 14.12 का से कम प्रकार का तोरण (40, 15), (50, 18) और (60, 22) से गुज़रता है। कितनों के 50 से कम अंक आए?",
    ),
    "18",
    [
      [
        "35",
        t(
          "35 is the more-than count at 50, those at or above it. Below 50 is the less-than height: 18.",
          "35, 50 पर से अधिक प्रकार की गिनती है, उस पर या ऊपर वाले। 50 से कम, से कम प्रकार की ऊँचाई है: 18।",
        ),
      ],
      [
        "3",
        t(
          "3 is just 40 – 50. The curve's height at 50 counts everyone below: 18.",
          "3 सिर्फ़ 40 – 50 है। 50 पर वक्र की ऊँचाई नीचे के सबको गिनती है: 18।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

export const ogiveReading = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.Ogives],
});
