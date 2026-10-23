import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Where Mendeléev's table falls short. */
export const mendeleevProblems = factFamily([Concept.MendeleevLimits], {
  "which-not": {
    prompt: [
      "Which was NOT a limitation of Mendeléev's table?",
      "कौन-सी मेंडेलीफ़ की सारणी की सीमा नहीं थी?",
    ],
    right: ["Leaving gaps for undiscovered elements", "अज्ञात तत्वों के लिए ख़ाली जगहें छोड़ना"],
    wrong: [
      [
        "No fixed position for hydrogen",
        "हाइड्रोजन के लिए कोई पक्की जगह नहीं",
        "That is a limitation.",
        "यह एक सीमा है।",
      ],
      [
        "No clear place for the isotopes",
        "समस्थानिकों के लिए कोई साफ़ जगह नहीं",
        "That is a limitation.",
        "यह एक सीमा है।",
      ],
    ],
  },
  steps: {
    prompt: [
      "Why couldn't Mendeléev tell how many elements were missing between two heavy ones?",
      "मेंडेलीफ़ क्यों नहीं बता सकते थे कि दो भारी तत्वों के बीच कितने छूटे हैं?",
    ],
    right: ["Masses don't rise in regular steps", "द्रव्यमान नियमित क़दमों में नहीं बढ़ते"],
    wrong: [
      [
        "Heavy elements form no compounds",
        "भारी तत्व यौगिक नहीं बनाते",
        "They do. The masses jump unevenly.",
        "बनाते हैं। द्रव्यमान असमान छलाँग लगाते हैं।",
      ],
      [
        "Heavy elements were all isotopes",
        "सभी भारी तत्व समस्थानिक थे",
        "Isotopes are a separate problem.",
        "समस्थानिक अलग समस्या है।",
      ],
    ],
  },
  root: {
    prompt: [
      "All three limitations come from ordering elements by…",
      "तीनों सीमाएँ तत्वों को किससे क्रम देने के कारण हैं…",
    ],
    right: ["atomic mass", "परमाणु द्रव्यमान"],
    wrong: [
      [
        "atomic number",
        "परमाणु संख्या",
        "Ordering by atomic number is what fixed them.",
        "परमाणु संख्या से क्रम ने इन्हें ठीक किया।",
      ],
      [
        "valency",
        "संयोजकता",
        "Mendeléev's basis was mass, with chemistry.",
        "मेंडेलीफ़ का आधार द्रव्यमान था, रसायन के साथ।",
      ],
    ],
  },
});
