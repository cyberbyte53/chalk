import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Groups, periods and atomic number in the modern table. */
export const groupOrPeriod = factFamily([Concept.ModernPeriodicTable], {
  "group-share": {
    prompt: ["Elements in the same group have the same…", "एक ही समूह के तत्वों में समान होते हैं…"],
    right: ["number of valence electrons", "संयोजकता इलेक्ट्रॉनों की संख्या"],
    wrong: [
      [
        "number of electron shells",
        "इलेक्ट्रॉन कोशों की संख्या",
        "That's what a period shares.",
        "यह आवर्त में समान होता है।",
      ],
      [
        "atomic mass, near enough",
        "परमाणु द्रव्यमान, लगभग",
        "Masses grow a lot down a group.",
        "समूह में नीचे द्रव्यमान बहुत बढ़ते हैं।",
      ],
    ],
  },
  "period-share": {
    prompt: ["Elements in the same period have the same…", "एक ही आवर्त के तत्वों में समान होता है…"],
    right: ["number of electron shells", "इलेक्ट्रॉन कोशों की संख्या"],
    wrong: [
      [
        "number of valence electrons",
        "संयोजकता इलेक्ट्रॉनों की संख्या",
        "That's what a group shares.",
        "यह समूह में समान होता है।",
      ],
      [
        "valency, all the way across",
        "संयोजकता, पूरी पंक्ति में",
        "Valency changes across a period: 1, 2, 3, 4, 3, 2, 1, 0.",
        "आवर्त में संयोजकता बदलती है: 1, 2, 3, 4, 3, 2, 1, 0।",
      ],
    ],
  },
  law: {
    prompt: [
      "The modern periodic law says properties are a periodic function of…",
      "आधुनिक आवर्त नियम कहता है कि गुण किसके आवर्ती फलन हैं…",
    ],
    right: ["atomic number", "परमाणु संख्या"],
    wrong: [
      ["atomic mass", "परमाणु द्रव्यमान", "That was Mendeléev's law.", "वह मेंडेलीफ़ का नियम था।"],
      [
        "atomic size",
        "परमाणु आकार",
        "Size is a trend, not the basis.",
        "आकार एक प्रवृत्ति है, आधार नहीं।",
      ],
    ],
  },
  counts: {
    prompt: [
      "How many groups and periods does the modern table have?",
      "आधुनिक सारणी में कितने समूह और आवर्त हैं?",
    ],
    right: ["18 groups and 7 periods", "18 समूह और 7 आवर्त"],
    wrong: [
      [
        "7 groups and 18 periods",
        "7 समूह और 18 आवर्त",
        "Groups are the 18 columns; periods the 7 rows.",
        "समूह 18 स्तंभ हैं; आवर्त 7 पंक्तियाँ।",
      ],
      [
        "8 groups and 7 periods",
        "8 समूह और 7 आवर्त",
        "Mendeléev had 8 groups. The modern table has 18.",
        "मेंडेलीफ़ के 8 समूह थे। आधुनिक सारणी में 18 हैं।",
      ],
    ],
  },
  "second-period": {
    prompt: ["Why does the second period have 8 elements?", "दूसरे आवर्त में 8 तत्व क्यों हैं?"],
    right: ["The L shell holds 2 × 2² = 8", "L कोश में 2 × 2² = 8 आते हैं"],
    wrong: [
      [
        "The L shell holds 2 × 2 = 4, twice",
        "L कोश में 2 × 2 = 4, दो बार",
        "The rule is 2n², so 2 × 2² = 8.",
        "नियम 2n² है, इसलिए 2 × 2² = 8।",
      ],
      [
        "Every eighth element is alike",
        "हर आठवाँ तत्व समान है",
        "That's Newlands' idea, not the shell rule.",
        "यह न्यूलैंड्स का विचार है, कोश-नियम नहीं।",
      ],
    ],
  },
  moseley: {
    prompt: [
      "How did the modern table fix the order of cobalt (Z = 27) and nickel (Z = 28)?",
      "आधुनिक सारणी ने कोबाल्ट (Z = 27) और निकेल (Z = 28) का क्रम कैसे ठीक किया?",
    ],
    right: ["By Z, cobalt simply comes first", "Z से, कोबाल्ट अपने आप पहले आता है"],
    wrong: [
      [
        "By mass, nickel now comes first",
        "द्रव्यमान से, निकेल अब पहले आता है",
        "The modern table doesn't order by mass.",
        "आधुनिक सारणी द्रव्यमान से क्रम नहीं देती।",
      ],
      [
        "By likeness, they share one slot",
        "समानता से, वे एक खाना बाँटते हैं",
        "Different Z means different slots.",
        "अलग Z मतलब अलग खाने।",
      ],
    ],
  },
});
