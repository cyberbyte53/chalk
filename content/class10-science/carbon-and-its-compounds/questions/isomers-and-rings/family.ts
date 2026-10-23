import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Section 4.2.2: isomers, rings, benzene; NCERT Exercise 2 (pentane's isomers). */
export const isomersAndRings = factFamily([Concept.ChainsBranchesRings], {
  isomer: {
    prompt: ["Structural isomers have…", "संरचनात्मक समावयवों में होता है…"],
    right: ["The same molecular formula but different structures", "एक ही आण्विक सूत्र पर अलग संरचनाएँ"],
    wrong: [
      [
        "The same structure but different formulae",
        "एक ही संरचना पर अलग सूत्र",
        "It's the other way round.",
        "उल्टा है।",
      ],
      [
        "Different elements in the same structure",
        "एक ही संरचना में अलग-अलग तत्व",
        "They contain the same atoms.",
        "उनमें वही परमाणु होते हैं।",
      ],
    ],
  },
  butane: {
    prompt: ["How many structural isomers does butane have?", "ब्यूटेन के कितने संरचनात्मक समावयव हैं?"],
    right: ["Two", "दो"],
    wrong: [
      ["One", "एक", "It can be a straight chain or branched.", "यह सीधी शृंखला या शाखित हो सकता है।"],
      ["Four", "चार", "Four is its carbons.", "चार उसके कार्बन हैं।"],
    ],
  },
  pentane: {
    prompt: [
      "NCERT Exercise 2: how many structural isomers does pentane have?",
      "NCERT अभ्यास 2: पेंटेन के कितने संरचनात्मक समावयव हैं?",
    ],
    right: ["Three", "तीन"],
    wrong: [
      ["Two", "दो", "Two is butane; pentane has one more.", "दो ब्यूटेन है; पेंटेन का एक और है।"],
      ["Five", "पाँच", "Five is its carbons.", "पाँच उसके कार्बन हैं।"],
    ],
  },
  benzene: {
    prompt: ["Benzene is…", "बेंज़ीन है…"],
    right: [
      "A ring of six carbons, single and double bonds in turn, C₆H₆",
      "छह कार्बनों का वलय, बारी-बारी से एकल और द्विबंध, C₆H₆",
    ],
    wrong: [
      [
        "A straight chain of six carbons with single bonds, C₆H₁₄",
        "एकल बंधों वाली छह कार्बनों की सीधी शृंखला, C₆H₁₄",
        "That's hexane.",
        "वह हेक्सेन है।",
      ],
      [
        "A ring of six carbons with single bonds, C₆H₁₂",
        "एकल आबंधों वाला छह कार्बनों का वलय, C₆H₁₂",
        "That's cyclohexane.",
        "वह साइक्लोहेक्सेन है।",
      ],
    ],
  },
  hydrocarbon: {
    prompt: ["A compound of only carbon and hydrogen is a…", "केवल कार्बन और हाइड्रोजन का यौगिक है…"],
    right: ["Hydrocarbon", "हाइड्रोकार्बन"],
    wrong: [
      [
        "Carbohydrate",
        "कार्बोहाइड्रेट",
        "Carbohydrates also contain oxygen.",
        "कार्बोहाइड्रेट में ऑक्सीजन भी होती है।",
      ],
      [
        "Functional group",
        "प्रकार्यात्मक समूह",
        "A functional group contains a heteroatom.",
        "प्रकार्यात्मक समूह में विषम परमाणु होता है।",
      ],
    ],
  },
});
