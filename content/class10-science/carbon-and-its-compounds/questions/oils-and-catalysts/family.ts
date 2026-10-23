import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Catalysts; vegetable oils and animal fats. */
export const oilsAndCatalysts = factFamily([Concept.AdditionAndSubstitution], {
  catalyst: {
    prompt: ["A catalyst…", "उत्प्रेरक…"],
    right: ["Speeds up a reaction without being changed itself", "स्वयं बदले बिना अभिक्रिया तेज़ करता है"],
    wrong: [
      [
        "Is used up in the reaction",
        "अभिक्रिया में ख़र्च होता है",
        "It's left unchanged.",
        "यह बिना बदले बचता है।",
      ],
    ],
  },
  nickel: {
    prompt: [
      "Which is used as a catalyst for hydrogenating oils?",
      "तेलों के हाइड्रोजनीकरण में उत्प्रेरक कौन-सा है?",
    ],
    right: ["Nickel", "निकेल"],
    wrong: [
      [
        "Sodium",
        "सोडियम",
        "Sodium reacts violently; nickel is the catalyst.",
        "सोडियम तेज़ी से अभिक्रिया करता है; उत्प्रेरक निकेल है।",
      ],
      ["Chlorine", "क्लोरीन", "Chlorine is for substitution.", "क्लोरीन प्रतिस्थापन के लिए है।"],
    ],
  },
  "veg-oil": {
    prompt: ["Vegetable oils generally have…", "वनस्पति तेलों में सामान्यतः होती हैं…"],
    right: ["Long unsaturated carbon chains", "लंबी असंतृप्त कार्बन शृंखलाएँ"],
    wrong: [
      [
        "Saturated chains, like animal fats",
        "जंतु वसा जैसी संतृप्त शृंखलाएँ",
        "Animal fats are the saturated ones.",
        "जंतु वसा संतृप्त होती हैं।",
      ],
    ],
  },
  healthier: {
    prompt: ["Which is advised for cooking?", "खाना पकाने के लिए किसकी सलाह दी जाती है?"],
    right: ["Oils with unsaturated fatty acids", "असंतृप्त वसीय अम्लों वाले तेल"],
    wrong: [
      [
        "Saturated fats",
        "संतृप्त वसा",
        "Saturated fats are said to be harmful for health.",
        "संतृप्त वसा को स्वास्थ्य के लिए हानिकारक बताया जाता है।",
      ],
    ],
  },
  vanaspati: {
    prompt: ["Vanaspati ghee is made from oil by…", "वनस्पति घी तेल से बनता है…"],
    right: ["Hydrogenation", "हाइड्रोजनीकरण से"],
    wrong: [
      [
        "Oxidation",
        "ऑक्सीकरण से",
        "Oxidation adds oxygen; vanaspati is made by adding hydrogen.",
        "ऑक्सीकरण ऑक्सीजन जोड़ता है; वनस्पति हाइड्रोजन जोड़कर बनता है।",
      ],
      [
        "Esterification",
        "एस्टरीकरण से",
        "That makes esters from acids and alcohols.",
        "वह अम्ल और ऐल्कोहॉल से एस्टर बनाता है।",
      ],
    ],
  },
});
