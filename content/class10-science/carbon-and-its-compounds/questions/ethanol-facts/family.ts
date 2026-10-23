import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Section 4.4.1: ethanol, its reactions and its effects. */
export const ethanolFacts = factFamily([Concept.EthanolAndEthanoicAcid], {
  sodium: {
    prompt: [
      "Ethanol + sodium gives sodium ethoxide and…",
      "एथेनॉल + सोडियम से सोडियम एथॉक्साइड और … मिलता है",
    ],
    right: ["Hydrogen", "हाइड्रोजन"],
    wrong: [
      [
        "Oxygen",
        "ऑक्सीजन",
        "The gas pops near a flame: hydrogen.",
        "गैस लौ के पास 'पॉप' करती है: हाइड्रोजन।",
      ],
      [
        "Carbon dioxide",
        "कार्बन डाइऑक्साइड",
        "CO₂ comes from acids and carbonates.",
        "CO₂ अम्लों और कार्बोनेटों से आती है।",
      ],
    ],
  },
  dehydration: {
    prompt: [
      "Ethanol heated with excess conc. H₂SO₄ at 443 K gives…",
      "443 K पर अधिक सांद्र H₂SO₄ के साथ गर्म एथेनॉल देता है…",
    ],
    right: ["Ethene", "एथीन"],
    wrong: [
      ["Ethanoic acid", "एथेनॉइक अम्ल", "That's oxidation, with KMnO₄.", "वह ऑक्सीकरण है, KMnO₄ से।"],
      [
        "Ethyl ethanoate",
        "एथिल एथेनोएट",
        "That's an ester, made with ethanoic acid.",
        "वह एस्टर है, एथेनॉइक अम्ल से बना।",
      ],
    ],
  },
  methanol: {
    prompt: [
      "Why is methanol dangerous to drink, even in small amounts?",
      "मेथेनॉल की थोड़ी मात्रा पीना भी ख़तरनाक क्यों है?",
    ],
    right: [
      "The liver turns it into methanal, which can kill",
      "यकृत इसे मेथेनैल बना देता है, जो जानलेवा हो सकता है",
    ],
    wrong: [
      [
        "It is a strong acid",
        "यह प्रबल अम्ल है",
        "It's an alcohol; the danger is methanal.",
        "यह ऐल्कोहॉल है; ख़तरा मेथेनैल है।",
      ],
    ],
  },
  denatured: {
    prompt: ["Denatured alcohol is…", "विकृत ऐल्कोहॉल है…"],
    right: [
      "Ethanol made poisonous with methanol and dyed blue",
      "मेथेनॉल से ज़हरीला और नीला किया गया एथेनॉल",
    ],
    wrong: [["Pure ethanol", "शुद्ध एथेनॉल", "It has methanol added.", "इसमें मेथेनॉल मिलाया जाता है।"]],
  },
  fuel: {
    prompt: ["Why is ethanol considered a cleaner fuel?", "एथेनॉल को स्वच्छ ईंधन क्यों माना जाता है?"],
    right: [
      "It burns to give only carbon dioxide and water",
      "यह जलकर केवल कार्बन डाइऑक्साइड और जल देता है",
    ],
    wrong: [
      [
        "It doesn't burn",
        "यह जलता नहीं",
        "It burns well; its products are clean.",
        "यह अच्छे से जलता है; इसके उत्पाद साफ़ हैं।",
      ],
    ],
  },
});
