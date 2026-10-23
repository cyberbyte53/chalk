import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Hydrogen's two families, and isotopes. */
export const hydrogenAndIsotopes = factFamily([Concept.MendeleevLimits], {
  "like-alkali": {
    prompt: [
      "Hydrogen forms HCl, H₂O and H₂S. Which family has compounds with matching formulae?",
      "हाइड्रोजन HCl, H₂O और H₂S बनाता है। किस परिवार के यौगिकों के सूत्र मिलते हैं?",
    ],
    right: ["The alkali metals: NaCl, Na₂O, Na₂S", "क्षार धातुएँ: NaCl, Na₂O, Na₂S"],
    wrong: [
      [
        "The noble gases: no compounds",
        "उत्कृष्ट गैसें: कोई यौगिक नहीं",
        "Noble gases hardly form compounds.",
        "उत्कृष्ट गैसें मुश्किल से यौगिक बनाती हैं।",
      ],
      [
        "The halogens: Cl₂, F₂, Br₂",
        "हैलोजन: Cl₂, F₂, Br₂",
        "Those are the halogens' molecules, not matching compounds.",
        "वे हैलोजनों के अणु हैं, मिलते यौगिक नहीं।",
      ],
    ],
  },
  "like-halogen": {
    prompt: ["In which way is hydrogen like the halogens?", "हाइड्रोजन किस तरह हैलोजनों जैसा है?"],
    right: ["It forms diatomic molecules, H₂", "यह द्विपरमाणुक अणु, H₂, बनाता है"],
    wrong: [
      [
        "It is a soft, shiny metal",
        "यह एक नरम, चमकीली धातु है",
        "That would be the alkali metals, and hydrogen isn't one.",
        "वह क्षार धातुएँ होतीं, और हाइड्रोजन धातु नहीं है।",
      ],
      [
        "It forms an oxide like Na₂O",
        "यह Na₂O जैसा ऑक्साइड बनाता है",
        "H₂O matching Na₂O is its likeness to the alkali metals.",
        "H₂O का Na₂O से मिलना क्षार धातुओं से समानता है।",
      ],
    ],
  },
  "isotope-def": {
    prompt: ["What are isotopes?", "समस्थानिक क्या हैं?"],
    right: ["Atoms of one element with different masses", "एक ही तत्व के अलग द्रव्यमान वाले परमाणु"],
    wrong: [
      [
        "Atoms of different elements with one mass",
        "अलग तत्वों के एक द्रव्यमान वाले परमाणु",
        "Isotopes belong to the same element.",
        "समस्थानिक एक ही तत्व के होते हैं।",
      ],
      [
        "Atoms of one element with different chemistry",
        "एक ही तत्व के अलग रसायन वाले परमाणु",
        "Isotopes have the same chemical properties.",
        "समस्थानिकों के रासायनिक गुण समान होते हैं।",
      ],
    ],
  },
  "cl-slots": {
    prompt: [
      "Why did Cl-35 and Cl-37 trouble Mendeléev's law?",
      "Cl-35 और Cl-37 ने मेंडेलीफ़ के नियम को क्यों परेशान किया?",
    ],
    right: ["Mass splits them; chemistry joins them", "द्रव्यमान उन्हें अलग करता है; रसायन जोड़ता है"],
    wrong: [
      [
        "Chemistry splits them; mass joins them",
        "रसायन उन्हें अलग करता है; द्रव्यमान जोड़ता है",
        "It's the other way round: same chemistry, different mass.",
        "उल्टा है: रसायन वही, द्रव्यमान अलग।",
      ],
      [
        "Neither fits: both are noble gases",
        "कोई फ़िट नहीं: दोनों उत्कृष्ट गैसें हैं",
        "Both are chlorine, a halogen.",
        "दोनों क्लोरीन हैं, एक हैलोजन।",
      ],
    ],
  },
});
