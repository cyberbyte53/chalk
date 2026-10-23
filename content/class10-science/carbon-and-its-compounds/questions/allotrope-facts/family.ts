import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** More to Know: allotropes of carbon. */
export const allotropeFacts = factFamily([Concept.AllotropesOfCarbon], {
  define: {
    prompt: ["What are allotropes?", "अपररूप क्या हैं?"],
    right: ["Different forms of the same element", "एक ही तत्व के अलग-अलग रूप"],
    wrong: [
      [
        "Different elements that look alike",
        "एक जैसे दिखने वाले अलग तत्व",
        "Allotropes are one element arranged differently.",
        "अपररूप एक ही तत्व हैं, अलग व्यवस्था में।",
      ],
      [
        "Compounds of carbon and hydrogen",
        "कार्बन और हाइड्रोजन के यौगिक",
        "Those are hydrocarbons.",
        "वे हाइड्रोकार्बन हैं।",
      ],
    ],
  },
  "diamond-bonds": {
    prompt: [
      "In diamond, each carbon atom is bonded to how many others?",
      "हीरे में हर कार्बन परमाणु कितने अन्य से जुड़ा है?",
    ],
    right: ["Four, in a rigid 3-D structure", "चार, एक कठोर त्रि-आयामी संरचना में"],
    wrong: [
      [
        "Three, in flat layers stacked one on another",
        "तीन, एक-दूसरे पर रखी सपाट परतों में",
        "That's graphite.",
        "वह ग्रेफ़ाइट है।",
      ],
      [
        "Two, in a long chain",
        "दो, एक लंबी शृंखला में",
        "Diamond is a 3-D network.",
        "हीरा त्रि-आयामी जाल है।",
      ],
    ],
  },
  "graphite-bonds": {
    prompt: [
      "In graphite, each carbon atom is bonded to how many others?",
      "ग्रेफ़ाइट में हर कार्बन परमाणु कितने अन्य से जुड़ा है?",
    ],
    right: ["Three, in the same plane", "तीन, एक ही तल में"],
    wrong: [
      ["Four, in a 3-D net", "चार, एक त्रिविम जाल में", "That's diamond.", "वह हीरा है।"],
      [
        "Six, in a closed ring",
        "छह, एक बंद वलय में",
        "Six is the hexagon's corners, not one atom's bonds.",
        "छह षट्कोण के कोने हैं, एक परमाणु के आबंध नहीं।",
      ],
    ],
  },
  fullerene: {
    prompt: ["C-60 is named fullerene after…", "C-60 का नाम फ़ुलरीन किसके नाम पर है?"],
    right: [
      "Buckminster Fuller, an architect whose domes it resembles",
      "बकमिन्स्टर फ़ुलर, एक वास्तुकार जिनके गुंबद जैसा यह दिखता है",
    ],
    wrong: [
      [
        "Its being completely 'full' of carbon atoms",
        "कार्बन परमाणुओं से पूरी तरह 'भरा' होना",
        "The name comes from Buckminster Fuller.",
        "नाम बकमिन्स्टर फ़ुलर से आता है।",
      ],
      [
        "The scientist who first burnt it in the laboratory",
        "वह वैज्ञानिक जिसने उसे पहली बार प्रयोगशाला में जलाया",
        "It's named for an architect's domes.",
        "इसका नाम एक वास्तुकार के गुंबदों पर है।",
      ],
    ],
  },
  synthetic: {
    prompt: ["How are synthetic diamonds made?", "कृत्रिम हीरे कैसे बनाए जाते हैं?"],
    right: [
      "Pure carbon under very high pressure and temperature",
      "शुद्ध कार्बन को बहुत ऊँचे दाब और ताप पर रखकर",
    ],
    wrong: [
      [
        "By melting graphite and cooling it in water",
        "ग्रेफ़ाइट पिघलाकर पानी में ठंडा करके",
        "It needs very high pressure and temperature.",
        "इसके लिए बहुत ऊँचा दाब और ताप चाहिए।",
      ],
      [
        "By burning coal slowly in very little air for many days",
        "बहुत कम हवा में कई दिनों तक धीरे-धीरे कोयला जलाकर",
        "Burning gives carbon dioxide, not diamond.",
        "जलाने से कार्बन डाइऑक्साइड मिलती है, हीरा नहीं।",
      ],
    ],
  },
});
