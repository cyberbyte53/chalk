import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Electronic configuration and an element's place (Exercise 3, 5). */
export const configAndPlace = factFamily([Concept.ModernPeriodicTable], {
  "two-filled": {
    prompt: [
      "Which element has two shells, both completely filled?",
      "किस तत्व के दो कोश हैं, दोनों पूरे भरे?",
    ],
    right: ["Neon: 2, 8", "नियॉन: 2, 8"],
    wrong: [
      ["Helium: 2", "हीलियम: 2", "Helium has one shell.", "हीलियम में एक कोश है।"],
      [
        "Oxygen: 2, 6",
        "ऑक्सीजन: 2, 6",
        "Its second shell holds 6 of 8.",
        "इसके दूसरे कोश में 8 में से 6 हैं।",
      ],
    ],
  },
  "config-282": {
    prompt: ["Which element has the configuration 2, 8, 2?", "किस तत्व का विन्यास 2, 8, 2 है?"],
    right: ["Magnesium", "मैग्नीशियम"],
    wrong: [
      ["Beryllium", "बेरिलियम", "Beryllium is 2, 2.", "बेरिलियम 2, 2 है।"],
      ["Calcium", "कैल्सियम", "Calcium is 2, 8, 8, 2.", "कैल्सियम 2, 8, 8, 2 है।"],
    ],
  },
  "three-four": {
    prompt: [
      "Which element has three shells, with four valence electrons?",
      "किस तत्व के तीन कोश हैं, चार संयोजकता इलेक्ट्रॉनों के साथ?",
    ],
    right: ["Silicon: 2, 8, 4", "सिलिकॉन: 2, 8, 4"],
    wrong: [
      ["Carbon: 2, 4", "कार्बन: 2, 4", "Carbon has only two shells.", "कार्बन में केवल दो कोश हैं।"],
      [
        "Sulphur: 2, 8, 6",
        "सल्फ़र: 2, 8, 6",
        "Sulphur has six valence electrons.",
        "सल्फ़र में छह संयोजकता इलेक्ट्रॉन हैं।",
      ],
    ],
  },
  "two-three": {
    prompt: [
      "Which element has two shells, with three valence electrons?",
      "किस तत्व के दो कोश हैं, तीन संयोजकता इलेक्ट्रॉनों के साथ?",
    ],
    right: ["Boron: 2, 3", "बोरॉन: 2, 3"],
    wrong: [
      [
        "Aluminium: 2, 8, 3",
        "ऐलुमिनियम: 2, 8, 3",
        "Aluminium has three shells.",
        "ऐलुमिनियम में तीन कोश हैं।",
      ],
      [
        "Nitrogen: 2, 5",
        "नाइट्रोजन: 2, 5",
        "Nitrogen has five valence electrons.",
        "नाइट्रोजन में पाँच संयोजकता इलेक्ट्रॉन हैं।",
      ],
    ],
  },
  twice: {
    prompt: [
      "Which element has twice as many electrons in its second shell as in its first?",
      "किस तत्व के दूसरे कोश में पहले से दोगुने इलेक्ट्रॉन हैं?",
    ],
    right: ["Carbon: 2, 4", "कार्बन: 2, 4"],
    wrong: [
      ["Oxygen: 2, 6", "ऑक्सीजन: 2, 6", "6 is three times 2.", "6, 2 का तीन गुना है।"],
      [
        "Beryllium: 2, 2",
        "बेरिलियम: 2, 2",
        "2 equals 2; it's not twice.",
        "2 बराबर 2 है; दोगुना नहीं।",
      ],
    ],
  },
  "config-287": {
    prompt: [
      "An atom is 2, 8, 7. What is its atomic number, and which is it like?",
      "एक परमाणु 2, 8, 7 है। उसकी परमाणु संख्या क्या है, और वह किस जैसा है?",
    ],
    right: ["17, like fluorine (9)", "17, फ़्लुओरीन (9) जैसा"],
    wrong: [
      [
        "17, like argon (18)",
        "17, आर्गन (18) जैसा",
        "Argon's outer shell is full; this one is one short, like F.",
        "आर्गन का बाहरी कोश भरा है; इसमें एक कम है, F जैसा।",
      ],
      [
        "7, like nitrogen (7)",
        "7, नाइट्रोजन (7) जैसा",
        "Add all electrons: 2 + 8 + 7 = 17.",
        "सारे इलेक्ट्रॉन जोड़ो: 2 + 8 + 7 = 17।",
      ],
    ],
  },
});
