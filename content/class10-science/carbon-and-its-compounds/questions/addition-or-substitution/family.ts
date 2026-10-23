import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Sections 4.3.3–4.3.4: addition and substitution reactions. */
export const additionOrSubstitution = factFamily([Concept.AdditionAndSubstitution], {
  hydrogenation: {
    prompt: [
      "Vegetable oil + hydrogen with a nickel catalyst is…",
      "निकेल उत्प्रेरक के साथ वनस्पति तेल + हाइड्रोजन है…",
    ],
    right: ["An addition reaction", "संकलन अभिक्रिया"],
    wrong: [
      [
        "A substitution reaction",
        "प्रतिस्थापन अभिक्रिया",
        "Hydrogen adds across double bonds; nothing is replaced.",
        "हाइड्रोजन द्विआबंधों पर जुड़ती है; कुछ नहीं बदलता।",
      ],
      ["Combustion", "दहन", "Nothing burns.", "कुछ नहीं जलता।"],
    ],
  },
  chlorination: {
    prompt: ["CH₄ + Cl₂ → CH₃Cl + HCl in sunlight is…", "धूप में CH₄ + Cl₂ → CH₃Cl + HCl है…"],
    right: ["A substitution reaction", "प्रतिस्थापन अभिक्रिया"],
    wrong: [
      [
        "An addition reaction",
        "संकलन अभिक्रिया",
        "Methane has no double bond: a hydrogen is replaced.",
        "मेथेन में द्विआबंध नहीं: एक हाइड्रोजन बदलता है।",
      ],
    ],
  },
  sunlight: {
    prompt: [
      "What does the reaction of methane with chlorine need?",
      "मेथेन की क्लोरीन से अभिक्रिया को क्या चाहिए?",
    ],
    right: ["Sunlight", "धूप"],
    wrong: [
      [
        "A nickel catalyst",
        "निकेल उत्प्रेरक",
        "Nickel is for adding hydrogen.",
        "निकेल हाइड्रोजन जोड़ने के लिए है।",
      ],
      [
        "Concentrated sulphuric acid",
        "सांद्र सल्फ़्यूरिक अम्ल",
        "That's for dehydration and esters.",
        "वह निर्जलीकरण और एस्टर के लिए है।",
      ],
    ],
  },
  "which-adds": {
    prompt: [
      "Which compound can undergo an addition reaction?",
      "कौन-सा यौगिक संकलन अभिक्रिया कर सकता है?",
    ],
    right: ["Ethene", "एथीन"],
    wrong: [
      [
        "Ethane",
        "एथेन",
        "Ethane is saturated: no double bond to add across.",
        "एथेन संतृप्त है: जोड़ने को द्विआबंध नहीं।",
      ],
      ["Methane", "मेथेन", "Methane is saturated.", "मेथेन संतृप्त है।"],
    ],
  },
  welding: {
    prompt: [
      "NCERT in-text Q: why is ethyne burnt with oxygen, not air, for welding?",
      "NCERT पाठ्य प्रश्न: वेल्डिंग में एथाइन ऑक्सीजन के साथ क्यों जलाई जाती है, हवा के साथ क्यों नहीं?",
    ],
    right: [
      "In air it burns incompletely, with a sooty, cooler flame",
      "हवा में यह अधूरी जलती है, कालिख वाली, कम गर्म लौ से",
    ],
    wrong: [
      [
        "Air would make it explode",
        "हवा से विस्फोट होगा",
        "The problem is too little oxygen in air.",
        "समस्या हवा में कम ऑक्सीजन है।",
      ],
    ],
  },
});
