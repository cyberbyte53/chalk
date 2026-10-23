import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Section 4.4.2: ethanoic acid, esters, saponification; NCERT Exercise (telling alcohol from acid). */
export const ethanoicAcidFacts = factFamily([Concept.EthanolAndEthanoicAcid], {
  vinegar: {
    prompt: ["Vinegar is…", "सिरका है…"],
    right: ["A 5–8% solution of ethanoic acid in water", "जल में एथेनॉइक अम्ल का 5–8% घोल"],
    wrong: [
      ["Pure ethanol", "शुद्ध एथेनॉल", "Vinegar is dilute acetic acid.", "सिरका तनु ऐसीटिक अम्ल है।"],
    ],
  },
  carbonate: {
    prompt: [
      "Ethanoic acid + sodium hydrogencarbonate gives off…",
      "एथेनॉइक अम्ल + सोडियम हाइड्रोजनकार्बोनेट से निकलती है…",
    ],
    right: ["Carbon dioxide", "कार्बन डाइऑक्साइड"],
    wrong: [
      [
        "Hydrogen gas, which pops",
        "हाइड्रोजन गैस, जो पॉप करती है",
        "Hydrogen comes from metals. Carbonates give CO₂.",
        "हाइड्रोजन धातुओं से आती है। कार्बोनेट CO₂ देते हैं।",
      ],
    ],
  },
  ester: {
    prompt: [
      "An acid and an alcohol react, with an acid catalyst, to form…",
      "अम्ल और ऐल्कोहॉल, अम्ल उत्प्रेरक के साथ, बनाते हैं…",
    ],
    right: ["A sweet-smelling ester", "मीठी खुशबू वाला एस्टर"],
    wrong: [
      [
        "A soap and water",
        "साबुन और पानी",
        "Soap comes from an ester and an alkali.",
        "साबुन एस्टर और क्षार से बनता है।",
      ],
      [
        "Hydrogen gas, which pops",
        "हाइड्रोजन गैस, जो पॉप करती है",
        "No hydrogen is given off.",
        "कोई हाइड्रोजन नहीं निकलती।",
      ],
    ],
  },
  saponification: {
    prompt: [
      "An ester heated with sodium hydroxide gives an alcohol and…",
      "सोडियम हाइड्रॉक्साइड के साथ गर्म एस्टर देता है एक ऐल्कोहॉल और…",
    ],
    right: ["The sodium salt of the acid: soap", "अम्ल का सोडियम लवण: साबुन"],
    wrong: [
      [
        "Hydrogen gas",
        "हाइड्रोजन गैस",
        "This is saponification: soap is formed.",
        "यह साबुनीकरण है: साबुन बनता है।",
      ],
    ],
  },
  "tell-apart": {
    prompt: [
      "NCERT Exercise: how do you tell ethanol from ethanoic acid?",
      "NCERT अभ्यास: एथेनॉल और एथेनॉइक अम्ल में अंतर कैसे बताओगे?",
    ],
    right: ["Add NaHCO₃: only the acid fizzes with CO₂", "NaHCO₃ डालो: केवल अम्ल CO₂ से बुदबुदाता है"],
    wrong: [
      [
        "Add sodium: only the acid fizzes",
        "सोडियम डालो: केवल अम्ल बुदबुदाता है",
        "Ethanol fizzes with sodium too.",
        "एथेनॉल भी सोडियम से बुदबुदाता है।",
      ],
    ],
  },
  weak: {
    prompt: ["Ethanoic acid is a weak acid because…", "एथेनॉइक अम्ल दुर्बल अम्ल है क्योंकि…"],
    right: ["It is only partly ionised in water", "यह जल में केवल आंशिक आयनित होता है"],
    wrong: [
      [
        "It has no hydrogen",
        "इसमें हाइड्रोजन नहीं",
        "It has hydrogen; only a little ionises.",
        "इसमें हाइड्रोजन है; केवल थोड़ा आयनित होता है।",
      ],
    ],
  },
});
