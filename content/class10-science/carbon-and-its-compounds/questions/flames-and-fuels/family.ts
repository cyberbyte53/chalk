import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Activities 4.3–4.4: clean and sooty flames; flames and glows; pollutants. */
export const flamesAndFuels = factFamily([Concept.CombustionAndOxidation], {
  naphthalene: {
    prompt: ["Naphthalene burns with…", "नैफ़्थलीन जलती है…"],
    right: ["A yellow, sooty flame", "पीली, कालिख वाली लौ से"],
    wrong: [
      [
        "A clean blue flame",
        "साफ़ नीली लौ से",
        "Naphthalene is unsaturated: it burns sooty.",
        "नैफ़्थलीन असंतृप्त है: कालिख से जलती है।",
      ],
    ],
  },
  "air-hole": {
    prompt: [
      "A burner's air hole is closed. The flame becomes…",
      "बर्नर का हवा का छेद बंद है। लौ हो जाती है…",
    ],
    right: ["Yellow and sooty", "पीली और कालिख वाली"],
    wrong: [
      [
        "Bluer and hotter",
        "ज़्यादा नीली और गर्म",
        "Less air means incomplete burning.",
        "कम हवा से अधूरा दहन।",
      ],
    ],
  },
  pan: {
    prompt: [
      "NCERT Exercise: vessel bottoms turn black on a gas stove. What does it mean?",
      "NCERT अभ्यास: गैस चूल्हे पर बर्तनों के तले काले हो जाते हैं। इसका क्या अर्थ है?",
    ],
    right: ["The air holes are blocked: fuel is wasted", "हवा के छेद बंद हैं: ईंधन बर्बाद होता है"],
    wrong: [
      [
        "The vessel is cheap and thin",
        "बर्तन सस्ता और पतला है",
        "The soot comes from incomplete burning.",
        "कालिख अधूरे दहन से आती है।",
      ],
      [
        "The gas is very pure, so it burns extra hot",
        "गैस बहुत शुद्ध है, इसलिए बहुत गर्म जलती है",
        "Black soot means not enough air.",
        "काली कालिख का अर्थ है पर्याप्त हवा नहीं।",
      ],
    ],
  },
  glow: {
    prompt: ["Why does charcoal only glow?", "लकड़ी का कोयला केवल दहकता क्यों है?"],
    right: ["It gives off no gases to burn as a flame", "यह लौ बनाने को जलने वाली गैसें नहीं छोड़ता"],
    wrong: [
      [
        "It contains no carbon",
        "उसमें कार्बन नहीं",
        "Charcoal is mostly carbon.",
        "लकड़ी का कोयला ज़्यादातर कार्बन है।",
      ],
    ],
  },
  pollutant: {
    prompt: [
      "Burning coal and petroleum gives which pollutants?",
      "कोयला और पेट्रोलियम जलाने से कौन-से प्रदूषक बनते हैं?",
    ],
    right: ["Oxides of sulphur and nitrogen", "सल्फ़र और नाइट्रोजन के ऑक्साइड"],
    wrong: [
      [
        "Only water vapour and heat",
        "केवल जलवाष्प और ऊष्मा",
        "They contain sulphur and nitrogen, which burn to oxides.",
        "उनमें सल्फ़र और नाइट्रोजन है, जो जलकर ऑक्साइड बनाते हैं।",
      ],
      [
        "Pure oxygen and steam",
        "शुद्ध ऑक्सीजन और भाप",
        "Burning uses oxygen up.",
        "जलने में ऑक्सीजन ख़र्च होती है।",
      ],
    ],
  },
});
