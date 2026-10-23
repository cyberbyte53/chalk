import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** How Mendeléev built his table, and what it achieved. */
export const mendeleevAchievements = factFamily([Concept.MendeleevTable], {
  criteria: {
    prompt: [
      "What did Mendeléev use to place each element?",
      "मेंडेलीफ़ ने हर तत्व को रखने के लिए क्या इस्तेमाल किया?",
    ],
    right: [
      "Its atomic mass and its oxide and hydride formulae",
      "उसका परमाणु द्रव्यमान और ऑक्साइड व हाइड्राइड सूत्र",
    ],
    wrong: [
      [
        "Its atomic number and its outer-shell electrons",
        "उसकी परमाणु संख्या और बाहरी कोश के इलेक्ट्रॉन",
        "Atomic number came after Mendeléev, with Moseley.",
        "परमाणु संख्या मेंडेलीफ़ के बाद, मोज़ले के साथ आई।",
      ],
      [
        "Its colour and whether it was a solid or a gas",
        "उसका रंग और कि वह ठोस है या गैस",
        "He used mass and chemical properties.",
        "उन्होंने द्रव्यमान और रासायनिक गुण लिए।",
      ],
    ],
  },
  law: {
    prompt: [
      "Mendeléev's periodic law says properties are a periodic function of…",
      "मेंडेलीफ़ का आवर्त नियम कहता है कि गुण किसके आवर्ती फलन हैं…",
    ],
    right: ["atomic mass", "परमाणु द्रव्यमान"],
    wrong: [
      ["atomic number", "परमाणु संख्या", "That's the modern periodic law.", "यह आधुनिक आवर्त नियम है।"],
      [
        "atomic size",
        "परमाणु आकार",
        "Size is a trend, not the basis of the law.",
        "आकार एक प्रवृत्ति है, नियम का आधार नहीं।",
      ],
    ],
  },
  gaps: {
    prompt: [
      "Which elements later filled gaps that Mendeléev had left?",
      "किन तत्वों ने बाद में मेंडेलीफ़ की छोड़ी ख़ाली जगहें भरीं?",
    ],
    right: ["Scandium, gallium and germanium", "स्कैंडियम, गैलियम और जर्मेनियम"],
    wrong: [
      [
        "Helium, neon and argon",
        "हीलियम, नियॉन और आर्गन",
        "The noble gases formed a new group; they didn't fill gaps.",
        "उत्कृष्ट गैसों ने नया समूह बनाया; उन्होंने ख़ाली जगहें नहीं भरीं।",
      ],
      [
        "Lithium, sodium and potassium",
        "लीथियम, सोडियम और पोटैशियम",
        "Those were known and already placed.",
        "वे ज्ञात थे और पहले से रखे गए थे।",
      ],
    ],
  },
  eka: {
    prompt: [
      "Eka-aluminium was predicted with mass 68 and oxide E₂O₃. Which element matched it?",
      "एका-ऐलुमिनियम का अनुमान द्रव्यमान 68 और ऑक्साइड E₂O₃ के साथ था। कौन-सा तत्व इससे मिला?",
    ],
    right: ["Gallium, mass 69.7, oxide Ga₂O₃", "गैलियम, द्रव्यमान 69.7, ऑक्साइड Ga₂O₃"],
    wrong: [
      [
        "Germanium, mass 72.6, oxide GeO₂",
        "जर्मेनियम, द्रव्यमान 72.6, ऑक्साइड GeO₂",
        "Germanium matched eka-silicon.",
        "जर्मेनियम एका-सिलिकॉन से मिला।",
      ],
      [
        "Scandium, mass 45.0, oxide Sc₂O₃",
        "स्कैंडियम, द्रव्यमान 45.0, ऑक्साइड Sc₂O₃",
        "Scandium matched eka-boron; its mass is far from 68.",
        "स्कैंडियम एका-बोरॉन से मिला; उसका द्रव्यमान 68 से दूर है।",
      ],
    ],
  },
  "eka-word": {
    prompt: ["What does the prefix eka mean?", "उपसर्ग एका का क्या अर्थ है?"],
    right: ["One, in Sanskrit", "एक, संस्कृत में"],
    wrong: [
      ["New, in Russian", "नया, रूसी में", "It's Sanskrit, for 'one'.", "यह संस्कृत है, 'एक' के लिए।"],
      [
        "Missing, in Greek",
        "छूटा हुआ, ग्रीक में",
        "It's Sanskrit, for 'one'.",
        "यह संस्कृत है, 'एक' के लिए।",
      ],
    ],
  },
  noble: {
    prompt: [
      "When the noble gases were discovered, what happened to Mendeléev's table?",
      "जब उत्कृष्ट गैसें खोजी गईं, मेंडेलीफ़ की सारणी का क्या हुआ?",
    ],
    right: ["They became a new group; the order stayed", "वे नया समूह बनीं; क्रम वही रहा"],
    wrong: [
      [
        "They broke it; it had to be redone",
        "उन्होंने इसे तोड़ा; इसे फिर से बनाना पड़ा",
        "They fitted in without disturbing the existing order.",
        "वे मौजूदा क्रम को बिना छेड़े फ़िट हो गईं।",
      ],
      [
        "They filled the gaps left for eka-elements",
        "उन्होंने एका-तत्वों की ख़ाली जगहें भरीं",
        "The gaps were filled by Sc, Ga and Ge.",
        "ख़ाली जगहें Sc, Ga और Ge ने भरीं।",
      ],
    ],
  },
});
