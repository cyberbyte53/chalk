import { t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Item, bankFamily, numItem } from "../../kit";

const nSteps = t("From the first to the nth is n − 1 steps.", "पहले से n वें तक n − 1 क़दम हैं।");

/** Examples 8–10, Exercise 5.2 Q17, Q19, Q20, and Grandpa's ladder. */
const items = {
  ex8: numItem(
    t(
      "Find the 11th term from the last of the AP 10, 7, 4, …, −62.",
      "AP 10, 7, 4, …, −62 का अंतिम पद से 11वाँ पद ज्ञात करो।",
    ),
    "−32",
    [
      [
        "−29",
        t(
          "That's the 14th term. The 25th term is the 1st from the end, so the 11th from the end is the 15th.",
          "यह 14वाँ पद है। 25वाँ पद अंत से पहला है, तो अंत से 11वाँ, 15वाँ है।",
        ),
      ],
      [
        "−20",
        t(
          "Read backwards, the AP starts at −62 with d = 3: −62 + 10 × 3.",
          "उलटा पढ़ने पर AP −62 से d = 3 के साथ शुरू होती है: −62 + 10 × 3।",
        ),
      ],
    ],
  ),
  q17: numItem(
    t(
      "Find the 20th term from the last of the AP 3, 8, 13, …, 253.",
      "AP 3, 8, 13, …, 253 का अंतिम पद से 20वाँ पद ज्ञात करो।",
    ),
    "158",
    [
      ["153", nSteps],
      [
        "98",
        t(
          "That's the 20th term from the start. Reverse: a = 253, d = −5, so 253 − 19 × 5.",
          "यह शुरुआत से 20वाँ पद है। उलटो: a = 253, d = −5, तो 253 − 19 × 5।",
        ),
      ],
    ],
  ),
  ex10: numItem(
    t(
      "A rose bed has 23 plants in the first row, 21 in the second, 19 in the third, …, and 5 in the last. How many rows?",
      "गुलाब की एक क्यारी में पहली पंक्ति में 23 पौधे, दूसरी में 21, तीसरी में 19, …, और आख़िरी में 5 हैं। कितनी पंक्तियाँ?",
    ),
    "10",
    [
      [
        "9",
        t(
          "23 + (n − 1)(−2) = 5 gives n − 1 = 9, so n = 10.",
          "23 + (n − 1)(−2) = 5 से n − 1 = 9, तो n = 10।",
        ),
      ],
      [
        "18",
        t(
          "18 is how many plants fewer the last row has. Each row has 2 fewer.",
          "18 यह है कि आख़िरी पंक्ति में कितने पौधे कम हैं। हर पंक्ति में 2 कम हैं।",
        ),
      ],
    ],
  ),
  q19: numItem(
    t(
      "Subba Rao started work in 1995 at ₹5000 a year, rising by ₹200 a year. In which year did his income reach ₹7000?",
      "सुब्बा राव ने 1995 में ₹5000 सालाना पर काम शुरू किया, हर साल ₹200 बढ़ोतरी के साथ। किस साल उनकी आय ₹7000 पहुँची?",
    ),
    "2005",
    [
      [
        "2006",
        t(
          "1995 is the 1st year, so the 11th year is 1995 + 10.",
          "1995 पहला साल है, तो 11वाँ साल 1995 + 10 है।",
        ),
      ],
      [
        "2004",
        t(
          "7000 = 5000 + (n − 1) × 200 gives n = 11: the 11th year is 2005.",
          "7000 = 5000 + (n − 1) × 200 से n = 11: 11वाँ साल 2005 है।",
        ),
      ],
    ],
  ),
  q20: numItem(
    t(
      "Ramkali saved ₹5 in week 1 and ₹1.75 more each week. In which week did she save ₹20.75?",
      "रामकली ने पहले हफ़्ते ₹5 बचाए और हर हफ़्ते ₹1.75 ज़्यादा। किस हफ़्ते उसने ₹20.75 बचाए?",
    ),
    "Week 10",
    [
      ["Week 9", t("You found n − 1 = 9. Add 1.", "तुम्हें n − 1 = 9 मिला। 1 जोड़ो।")],
      [
        "Week 12",
        t(
          "Start from her first week's ₹5: 20.75 = 5 + (n − 1) × 1.75.",
          "उसके पहले हफ़्ते के ₹5 से शुरू करो: 20.75 = 5 + (n − 1) × 1.75।",
        ),
      ],
    ],
  ),
  ladder: numItem(
    t(
      "A ladder has 8 rungs: 45 cm at the bottom, each 2 cm shorter than the one below. How long is the top rung?",
      "एक सीढ़ी में 8 डंडे हैं: नीचे 45 cm, हर डंडा नीचे वाले से 2 cm छोटा। सबसे ऊपर का डंडा कितना लंबा है?",
    ),
    "31 cm",
    [
      ["29 cm", nSteps],
      ["61 cm", t("Going up the rungs get shorter: d = −2.", "ऊपर जाते हुए डंडे छोटे होते हैं: d = −2।")],
    ],
  ),
  kabir200: numItem(
    t(
      "Kabir saves ₹100, 105, 110, … each week. In which week does one week's saving first reach ₹200?",
      "कबीर हर हफ़्ते ₹100, 105, 110, … बचाता है। किस हफ़्ते एक हफ़्ते की बचत पहली बार ₹200 होती है?",
    ),
    "Week 21",
    [
      ["Week 20", t("Week 20 is ₹195.", "हफ़्ता 20 ₹195 का है।")],
      [
        "Week 40",
        t(
          "That's 200 ÷ 5. Start from ₹100: 200 = 100 + (n − 1) × 5.",
          "यह 200 ÷ 5 है। ₹100 से शुरू करो: 200 = 100 + (n − 1) × 5।",
        ),
      ],
    ],
  ),
} satisfies Record<string, Item>;

/** Real questions answered with the nth term, including counting from the end. */
export const nthTermStories = bankFamily(items, {
  level: Level.Medium,
  tests: [Concept.UsingTheNthTerm],
});
