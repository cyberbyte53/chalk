import { column, family, space, t } from "@chalk/author";
import { Level, type Localized } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Problem = {
  TwoNumbers: "twoNumbers",
  Angles: "angles",
  BatsBalls: "batsBalls",
  Fraction: "fraction",
  Jacob: "jacob",
  Library: "library",
  Digits: "digits",
  Yash: "yash",
  Cars: "cars",
  Rectangle: "rectangle",
} as const;
type Problem = (typeof Problem)[keyof typeof Problem];

type Item = {
  prompt: Localized;
  pair: string;
  right: Localized;
  wrong: { label: Localized; why: Localized }[];
};

const items: Record<Problem, Item> = {
  twoNumbers: {
    prompt: t(
      "The difference between two numbers is 26 and one number is three times the other. Find them.",
      "दो संख्याओं का अंतर 26 है और एक संख्या दूसरी की तीन गुनी है। उन्हें निकालो।",
    ),
    pair: "x - y = 26,\\ x = 3y",
    right: t("39 and 13", "39 और 13"),
    wrong: [
      {
        label: t("26 and 78", "26 और 78"),
        why: t("Their difference is 52, not 26.", "उनका अंतर 52 है, 26 नहीं।"),
      },
      {
        label: t("52 and 26", "52 और 26"),
        why: t("52 is twice 26, not three times.", "52 तो 26 का दोगुना है, तीन गुना नहीं।"),
      },
    ],
  },
  angles: {
    prompt: t(
      "The larger of two supplementary angles exceeds the smaller by 18 degrees. Find them.",
      "दो संपूरक कोणों में बड़ा कोण छोटे से 18 अंश अधिक है। उन्हें निकालो।",
    ),
    pair: "x + y = 180,\\ x - y = 18",
    right: t("99° and 81°", "99° और 81°"),
    wrong: [
      {
        label: t("54° and 36°", "54° और 36°"),
        why: t(
          "Supplementary angles add up to 180°, not 90°.",
          "संपूरक कोण मिलकर 180° होते हैं, 90° नहीं।",
        ),
      },
      {
        label: t("98° and 80°", "98° और 80°"),
        why: t("$98 + 80 = 178$, not 180.", "$98 + 80 = 178$, 180 नहीं।"),
      },
    ],
  },
  batsBalls: {
    prompt: t(
      "A coach buys 7 bats and 6 balls for ₹3800, and later 3 bats and 5 balls for ₹1750. Find the cost of each bat and each ball.",
      "एक कोच ₹3800 में 7 बल्ले और 6 गेंदें, और बाद में ₹1750 में 3 बल्ले और 5 गेंदें ख़रीदती है। हर बल्ले और हर गेंद का दाम निकालो।",
    ),
    pair: "7x + 6y = 3800,\\ 3x + 5y = 1750",
    right: t("Bat ₹500, ball ₹50", "बल्ला ₹500, गेंद ₹50"),
    wrong: [
      {
        label: t("Bat ₹50, ball ₹500", "बल्ला ₹50, गेंद ₹500"),
        why: t("Check: $7(50) + 6(500) = 3350$.", "जाँचो: $7(50) + 6(500) = 3350$।"),
      },
      {
        label: t("Bat ₹400, ball ₹100", "बल्ला ₹400, गेंद ₹100"),
        why: t(
          "Check: $3(400) + 5(100) = 1700$, not 1750.",
          "जाँचो: $3(400) + 5(100) = 1700$, 1750 नहीं।",
        ),
      },
    ],
  },
  fraction: {
    prompt: t(
      "A fraction becomes $\\tfrac{9}{11}$ if 2 is added to both its top and bottom, and $\\tfrac{5}{6}$ if 3 is added to both. Find it.",
      "एक भिन्न के अंश और हर दोनों में 2 जोड़ने पर वह $\\tfrac{9}{11}$ हो जाती है, और दोनों में 3 जोड़ने पर $\\tfrac{5}{6}$। भिन्न निकालो।",
    ),
    pair: "11x - 9y = -4,\\ 6x - 5y = -3",
    right: t("$\\tfrac{7}{9}$", "$\\tfrac{7}{9}$"),
    wrong: [
      {
        label: t("$\\tfrac{9}{11}$", "$\\tfrac{9}{11}$"),
        why: t("That's what it becomes after adding 2.", "यह 2 जोड़ने के बाद का रूप है।"),
      },
      {
        label: t("$\\tfrac{9}{7}$", "$\\tfrac{9}{7}$"),
        why: t(
          "Adding 2 to each gives $\\tfrac{11}{9}$, not $\\tfrac{9}{11}$.",
          "हर एक में 2 जोड़ने पर $\\tfrac{11}{9}$ आता है, $\\tfrac{9}{11}$ नहीं।",
        ),
      },
    ],
  },
  jacob: {
    prompt: t(
      "Five years hence, Jacob's age will be three times his son's. Five years ago, Jacob's age was seven times his son's. What are their present ages?",
      "पाँच साल बाद जैकब की उम्र उसके बेटे की तीन गुनी होगी। पाँच साल पहले जैकब की उम्र बेटे की सात गुनी थी। उनकी अभी की उम्र क्या है?",
    ),
    pair: "x + 5 = 3(y + 5),\\ x - 5 = 7(y - 5)",
    right: t("Jacob 40, son 10", "जैकब 40, बेटा 10"),
    wrong: [
      {
        label: t("Jacob 35, son 5", "जैकब 35, बेटा 5"),
        why: t("Those were their ages five years ago.", "वे पाँच साल पहले की उम्रें थीं।"),
      },
      {
        label: t("Jacob 45, son 15", "जैकब 45, बेटा 15"),
        why: t("Those will be their ages in five years.", "वे पाँच साल बाद की उम्रें होंगी।"),
      },
    ],
  },
  library: {
    prompt: t(
      "A library charges a fixed amount for the first three days and a fixed rate for each day after. Saritha paid ₹27 for 7 days and Susy ₹21 for 5 days. Find the fixed charge and the charge per extra day.",
      "एक पुस्तकालय पहले तीन दिन का तय शुल्क और उसके बाद हर दिन का अलग शुल्क लेता है। सरिता ने 7 दिन के ₹27 दिए और सूज़ी ने 5 दिन के ₹21। तय शुल्क और हर अतिरिक्त दिन का शुल्क निकालो।",
    ),
    pair: "x + 4y = 27,\\ x + 2y = 21",
    right: t("₹15 fixed, ₹3 per extra day", "₹15 तय, ₹3 हर अतिरिक्त दिन"),
    wrong: [
      {
        label: t("₹13 fixed, ₹2 per extra day", "₹13 तय, ₹2 हर अतिरिक्त दिन"),
        why: t(
          "Count the extra days: 7 days is 4 extra, 5 days is 2 extra.",
          "अतिरिक्त दिन गिनो: 7 दिन यानी 4 अतिरिक्त, 5 दिन यानी 2 अतिरिक्त।",
        ),
      },
      {
        label: t("₹6 fixed, ₹3 per day", "₹6 तय, ₹3 हर दिन"),
        why: t(
          "The rate only starts after the first three days.",
          "दर पहले तीन दिन के बाद ही शुरू होती है।",
        ),
      },
    ],
  },
  digits: {
    prompt: t(
      "The digits of a two-digit number add up to 9, and nine times the number is twice the number with its digits reversed. Find the number.",
      "दो अंकों वाली एक संख्या के अंकों का योग 9 है, और संख्या का नौ गुना अंक उलटने पर बनी संख्या का दोगुना है। संख्या निकालो।",
    ),
    pair: "x + y = 9,\\ 9(10x + y) = 2(10y + x)",
    right: t("18", "18"),
    wrong: [
      {
        label: t("81", "81"),
        why: t(
          "$9 \\times 81 = 729$, but twice 18 is 36.",
          "$9 \\times 81 = 729$, पर 18 का दोगुना 36 है।",
        ),
      },
      {
        label: t("45", "45"),
        why: t(
          "$9 \\times 45 = 405$ and twice 54 is 108.",
          "$9 \\times 45 = 405$ और 54 का दोगुना 108।",
        ),
      },
    ],
  },
  yash: {
    prompt: t(
      "Yash scored 40 marks at 3 marks per right answer and −1 per wrong one. At 4 per right and −2 per wrong he'd have scored 50. How many questions were in the test?",
      "यश ने हर सही उत्तर पर 3 और हर ग़लत पर −1 अंक से 40 अंक पाए। हर सही पर 4 और ग़लत पर −2 होते तो 50 पाता। टेस्ट में कितने प्रश्न थे?",
    ),
    pair: "3x - y = 40,\\ 4x - 2y = 50",
    right: t("20 (15 right, 5 wrong)", "20 (15 सही, 5 ग़लत)"),
    wrong: [
      {
        label: t("15", "15"),
        why: t("15 is the right answers. Add the wrong ones too.", "15 सही उत्तर हैं। ग़लत भी जोड़ो।"),
      },
      {
        label: t("25", "25"),
        why: t(
          "Solve $3x - y = 40$ and $2x - y = 25$: $x = 15$, $y = 5$.",
          "$3x - y = 40$ और $2x - y = 25$ हल करो: $x = 15$, $y = 5$।",
        ),
      },
    ],
  },
  cars: {
    prompt: t(
      "Places A and B are 100 km apart. Two cars start from A and B at the same time. Going the same way they meet in 5 hours; going towards each other, in 1 hour. Find their speeds.",
      "स्थान A और B 100 km दूर हैं। दो कारें एक साथ A और B से चलती हैं। एक ही दिशा में चलें तो 5 घंटे में मिलती हैं; एक-दूसरे की ओर, तो 1 घंटे में। उनकी चालें निकालो।",
    ),
    pair: "x - y = 20,\\ x + y = 100",
    right: t("60 km/h and 40 km/h", "60 km/h और 40 km/h"),
    wrong: [
      {
        label: t("50 km/h each", "दोनों 50 km/h"),
        why: t(
          "At equal speeds, going the same way, they'd never meet.",
          "बराबर चाल पर, एक ही दिशा में, वे कभी नहीं मिलतीं।",
        ),
      },
      {
        label: t("100 km/h and 20 km/h", "100 km/h और 20 km/h"),
        why: t(
          "Going towards each other they'd close 120 km in an hour, not 100.",
          "एक-दूसरे की ओर वे एक घंटे में 120 km तय करतीं, 100 नहीं।",
        ),
      },
    ],
  },
  rectangle: {
    prompt: t(
      "A rectangle's area drops by 9 if its length is cut by 5 and its breadth increased by 3. It grows by 67 if the length is increased by 3 and the breadth by 2. Find its sides.",
      "किसी आयत की लंबाई 5 घटाने और चौड़ाई 3 बढ़ाने पर क्षेत्रफल 9 कम हो जाता है। लंबाई 3 और चौड़ाई 2 बढ़ाने पर क्षेत्रफल 67 बढ़ जाता है। उसकी भुजाएँ निकालो।",
    ),
    pair: "3x - 5y = 6,\\ 2x + 3y = 61",
    right: t("Length 17, breadth 9", "लंबाई 17, चौड़ाई 9"),
    wrong: [
      {
        label: t("Length 9, breadth 17", "लंबाई 9, चौड़ाई 17"),
        why: t(
          "Then the length couldn't lose 5 and still be longer.",
          "तब लंबाई 5 घटकर भी लंबी नहीं रहती।",
        ),
      },
      {
        label: t("Length 12, breadth 6", "लंबाई 12, चौड़ाई 6"),
        why: t(
          "Check: $(12 + 3)(6 + 2) = 120$, but $72 + 67 = 139$.",
          "जाँचो: $(12 + 3)(6 + 2) = 120$, पर $72 + 67 = 139$।",
        ),
      },
    ],
  },
};

/** NCERT's word problems (Exercises 3.3–3.5): form a pair, solve by any method, answer the question. */
export const wordProblems = family({
  level: Level.Hard,
  tests: [Concept.SubstitutionMethod, Concept.EliminationMethod, Concept.CrossMultiplication],
  params: z.object({ problem: z.nativeEnum(Problem) }).strict(),
  build: ({ problem }, bk) => {
    const it = items[problem as Problem];
    const options: Option[] = [
      { id: "right", label: it.right },
      ...it.wrong.map((w, i) => ({
        id: `w${i}`,
        label: w.label,
        feedback: t(
          `${w.why.en} One pair that fits: $${it.pair}$.`,
          `${w.why.hi} एक युग्म जो बैठता है: $${it.pair}$।`,
        ),
      })),
    ];
    const ask = choiceQuestion(bk, {
      prompt: it.prompt,
      options: settle(options, problem.length * 13),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
