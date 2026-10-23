import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Section 4.2.1: saturated and unsaturated compounds. */
export const saturatedOrNot = factFamily([Concept.VersatileCarbon], {
  ethane: {
    prompt: ["Ethane, C₂H₆, is…", "एथेन, C₂H₆, है…"],
    right: ["Saturated: single bonds only", "संतृप्त: केवल एकल आबंध"],
    wrong: [
      [
        "Unsaturated",
        "असंतृप्त",
        "Ethane has no double or triple bond.",
        "एथेन में कोई द्वि या त्रि आबंध नहीं।",
      ],
    ],
  },
  ethene: {
    prompt: ["Ethene, C₂H₄, is…", "एथीन, C₂H₄, है…"],
    right: ["Unsaturated: it has a double bond", "असंतृप्त: इसमें द्विआबंध है"],
    wrong: [
      [
        "Saturated",
        "संतृप्त",
        "With 4 hydrogens on 2 carbons, the carbons must share two pairs.",
        "2 कार्बनों पर 4 हाइड्रोजन हों, तो कार्बन दो जोड़ियाँ साझा करेंगे।",
      ],
    ],
  },
  ethyne: {
    prompt: ["Ethyne, C₂H₂, is…", "एथाइन, C₂H₂, है…"],
    right: ["Unsaturated: it has a triple bond", "असंतृप्त: इसमें त्रिआबंध है"],
    wrong: [
      [
        "Saturated",
        "संतृप्त",
        "Only 2 hydrogens: the carbons share three pairs.",
        "केवल 2 हाइड्रोजन: कार्बन तीन जोड़ियाँ साझा करते हैं।",
      ],
    ],
  },
  propane: {
    prompt: ["Propane, C₃H₈, is…", "प्रोपेन, C₃H₈, है…"],
    right: ["Saturated", "संतृप्त"],
    wrong: [
      [
        "Unsaturated",
        "असंतृप्त",
        "C₃H₈ fits CₙH₂ₙ₊₂: single bonds only.",
        "C₃H₈, CₙH₂ₙ₊₂ में आता है: केवल एकल आबंध।",
      ],
    ],
  },
  reactive: {
    prompt: ["Which are more reactive?", "कौन अधिक क्रियाशील हैं?"],
    right: ["Unsaturated compounds", "असंतृप्त यौगिक"],
    wrong: [
      [
        "Saturated compounds",
        "संतृप्त यौगिक",
        "Saturated compounds are fairly unreactive.",
        "संतृप्त यौगिक काफ़ी अक्रियाशील हैं।",
      ],
    ],
  },
});
