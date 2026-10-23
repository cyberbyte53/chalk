import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Section 4.5: soap molecules and micelles; NCERT Exercises (micelles in ethanol, agitation). */
export const micelleFacts = factFamily([Concept.SoapsAndDetergents], {
  head: {
    prompt: ["The ionic end of a soap molecule is…", "साबुन के अणु का आयनिक सिरा है…"],
    right: ["Hydrophilic: it dissolves in water", "जलरागी: जल में घुलता है"],
    wrong: [
      [
        "Hydrophobic",
        "जलविरागी",
        "The tail is hydrophobic; the head loves water.",
        "पूँछ जलविरागी है; सिरा जल पसंद करता है।",
      ],
    ],
  },
  micelle: {
    prompt: ["In a micelle, where are the hydrocarbon tails?", "मिसेल में हाइड्रोकार्बन पूँछें कहाँ होती हैं?"],
    right: ["Inside, around the oily dirt", "अंदर, तैलीय मैल के चारों ओर"],
    wrong: [
      [
        "Outside, in the water",
        "बाहर, पानी में",
        "The ionic heads face the water; the tails hide inside.",
        "आयनिक सिरे पानी की ओर; पूँछें अंदर छिपती हैं।",
      ],
    ],
  },
  ethanol: {
    prompt: [
      "NCERT Exercise: will soap form micelles in ethanol?",
      "NCERT अभ्यास: क्या साबुन एथेनॉल में मिसेल बनाएगा?",
    ],
    right: ["No: the tails dissolve in ethanol", "नहीं: पूँछें एथेनॉल में घुल जाती हैं"],
    wrong: [
      [
        "Yes, as in water",
        "हाँ, पानी जैसे",
        "Micelles form only to hide the tails from water.",
        "मिसेल केवल पूँछों को पानी से छिपाने के लिए बनते हैं।",
      ],
    ],
  },
  cloudy: {
    prompt: ["Why does soap solution look cloudy?", "साबुन का घोल धुँधला क्यों दिखता है?"],
    right: ["Micelles are large enough to scatter light", "मिसेल प्रकाश फैलाने जितने बड़े हैं"],
    wrong: [
      [
        "Soap doesn't dissolve at all",
        "साबुन बिल्कुल नहीं घुलता",
        "It forms micelles, which scatter light.",
        "यह मिसेल बनाता है, जो प्रकाश फैलाते हैं।",
      ],
    ],
  },
  agitation: {
    prompt: [
      "NCERT Exercise: why do we scrub or beat clothes while washing?",
      "NCERT अभ्यास: धोते समय कपड़ों को रगड़ते या पीटते क्यों हैं?",
    ],
    right: ["To help the micelles pull the oily dirt off", "मिसेलों को तैलीय मैल खींचने में मदद के लिए"],
    wrong: [
      [
        "To make the soap react with the cloth",
        "साबुन को कपड़े से अभिक्रिया कराने के लिए",
        "Soap surrounds the dirt; it doesn't react with the cloth.",
        "साबुन मैल को घेरता है; कपड़े से अभिक्रिया नहीं करता।",
      ],
    ],
  },
  "what-soap": {
    prompt: ["Soaps are…", "साबुन हैं…"],
    right: [
      "Sodium or potassium salts of long-chain carboxylic acids",
      "लंबी शृंखला वाले कार्बोक्सिलिक अम्लों के सोडियम या पोटैशियम लवण",
    ],
    wrong: [
      ["Sulphonic acids", "सल्फ़ोनिक अम्ल", "Their salts are detergents.", "उनके लवण अपमार्जक हैं।"],
    ],
  },
});
