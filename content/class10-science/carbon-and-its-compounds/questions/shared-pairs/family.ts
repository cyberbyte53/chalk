import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Section 4.1: shared pairs and bond types in simple molecules; in-text Q1 (CO₂). */
export const sharedPairs = factFamily([Concept.CovalentBond], {
  h2: {
    prompt: [
      "How many electron pairs do the two atoms share in H₂?",
      "H₂ में दोनों परमाणु कितनी इलेक्ट्रॉन जोड़ियाँ साझा करते हैं?",
    ],
    right: ["One: a single bond", "एक: एकल आबंध"],
    wrong: [
      [
        "Two: a double bond",
        "दो: द्विआबंध",
        "Each hydrogen needs only one more electron.",
        "हर हाइड्रोजन को केवल एक और इलेक्ट्रॉन चाहिए।",
      ],
      [
        "None: hydrogen forms ions",
        "कोई नहीं: हाइड्रोजन आयन बनाता है",
        "Two hydrogen atoms share a pair.",
        "दो हाइड्रोजन परमाणु एक जोड़ी साझा करते हैं।",
      ],
    ],
  },
  o2: {
    prompt: [
      "What kind of bond joins the two atoms in O₂?",
      "O₂ में दोनों परमाणुओं को कौन-सा आबंध जोड़ता है?",
    ],
    right: ["A double bond: two shared pairs", "द्विआबंध: दो साझा जोड़ियाँ"],
    wrong: [
      [
        "A single bond: one shared pair",
        "एकल बंध: एक साझा युग्म",
        "Oxygen has 6 valence electrons and needs 2 more: two pairs.",
        "ऑक्सीजन के 6 संयोजकता इलेक्ट्रॉन हैं और उसे 2 और चाहिए: दो जोड़ियाँ।",
      ],
      [
        "A triple bond: three shared pairs",
        "त्रिबंध: तीन साझा युग्म",
        "That's nitrogen, which needs 3.",
        "वह नाइट्रोजन है, जिसे 3 चाहिए।",
      ],
    ],
  },
  n2: {
    prompt: [
      "What kind of bond joins the two atoms in N₂?",
      "N₂ में दोनों परमाणुओं को कौन-सा आबंध जोड़ता है?",
    ],
    right: ["A triple bond: three shared pairs", "त्रिआबंध: तीन साझा जोड़ियाँ"],
    wrong: [
      [
        "A double bond: two shared pairs",
        "द्विबंध: दो साझा युग्म",
        "Nitrogen has 5 valence electrons and needs 3: three pairs.",
        "नाइट्रोजन के 5 संयोजकता इलेक्ट्रॉन हैं और उसे 3 चाहिए: तीन जोड़ियाँ।",
      ],
      [
        "A single bond: one shared pair",
        "एकल बंध: एक साझा युग्म",
        "One pair would leave each nitrogen 2 short.",
        "एक जोड़ी से हर नाइट्रोजन 2 कम रहेगी।",
      ],
    ],
  },
  ch4: {
    prompt: [
      "How many single bonds does carbon make in methane, CH₄?",
      "मेथेन, CH₄, में कार्बन कितने एकल आबंध बनाता है?",
    ],
    right: ["Four, one with each hydrogen", "चार, हर हाइड्रोजन से एक"],
    wrong: [
      [
        "Two, one for each pair of hydrogens",
        "दो, हाइड्रोजनों के हर जोड़े के लिए एक",
        "Carbon has 4 valence electrons and shares one with each of 4 hydrogens.",
        "कार्बन के 4 संयोजकता इलेक्ट्रॉन हैं और वह 4 हाइड्रोजनों में से हर एक से एक साझा करता है।",
      ],
      [
        "Eight, one for each outer electron",
        "आठ, हर बाहरी इलेक्ट्रॉन के लिए एक",
        "8 is the electrons carbon ends up with: 4 bonds.",
        "8 वे इलेक्ट्रॉन हैं जो अंत में कार्बन के पास होते हैं: 4 आबंध।",
      ],
    ],
  },
  nh3: {
    prompt: [
      "In ammonia, NH₃, how many pairs does nitrogen share?",
      "अमोनिया, NH₃, में नाइट्रोजन कितनी जोड़ियाँ साझा करती है?",
    ],
    right: ["Three, one with each hydrogen", "तीन, हर हाइड्रोजन से एक"],
    wrong: [
      [
        "Four, one more for the lone pair",
        "चार, एक अकेले युग्म के लिए",
        "There are only three hydrogens.",
        "केवल तीन हाइड्रोजन हैं।",
      ],
      [
        "Five, one with each outer electron",
        "पाँच, हर बाहरी इलेक्ट्रॉन के साथ एक",
        "5 is nitrogen's valence electrons; it shares 3 of them.",
        "5 नाइट्रोजन के संयोजकता इलेक्ट्रॉन हैं; वह उनमें से 3 साझा करती है।",
      ],
    ],
  },
  co2: {
    prompt: [
      "NCERT in-text Q1: what bonds join carbon to the oxygens in CO₂?",
      "NCERT पाठ्य प्रश्न 1: CO₂ में कार्बन ऑक्सीजनों से किन आबंधों से जुड़ा है?",
    ],
    right: ["A double bond to each oxygen", "हर ऑक्सीजन से द्विआबंध"],
    wrong: [
      [
        "A single bond to each oxygen",
        "हर ऑक्सीजन से एकल आबंध",
        "Then carbon would have only 6 electrons around it.",
        "तब कार्बन के चारों ओर केवल 6 इलेक्ट्रॉन होंगे।",
      ],
      [
        "A triple bond to one oxygen only",
        "केवल एक ऑक्सीजन से त्रिआबंध",
        "Both oxygens are joined the same way.",
        "दोनों ऑक्सीजन एक ही तरह जुड़ी हैं।",
      ],
    ],
  },
  c2h6: {
    prompt: [
      "NCERT Exercise 1: how many covalent bonds are there in ethane, C₂H₆?",
      "NCERT अभ्यास 1: एथेन, C₂H₆, में कितने सहसंयोजक आबंध हैं?",
    ],
    right: ["7", "7"],
    wrong: [
      ["6", "6", "Six C–H bonds plus the C–C bond.", "छह C–H आबंध और C–C आबंध।"],
      [
        "8",
        "8",
        "Count: 6 hydrogens each make one bond, plus one C–C.",
        "गिनो: 6 हाइड्रोजन, हर एक का एक आबंध, और एक C–C।",
      ],
    ],
  },
  c2h2: {
    prompt: [
      "How many electron pairs do the two carbons share in ethyne, C₂H₂?",
      "एथाइन, C₂H₂, में दोनों कार्बन कितनी इलेक्ट्रॉन जोड़ियाँ साझा करते हैं?",
    ],
    right: ["Three", "तीन"],
    wrong: [
      ["Two", "दो", "Two pairs is ethene, C₂H₄.", "दो जोड़ियाँ एथीन, C₂H₄, है।"],
      ["One", "एक", "One pair is ethane, C₂H₆.", "एक जोड़ी एथेन, C₂H₆, है।"],
    ],
  },
});
