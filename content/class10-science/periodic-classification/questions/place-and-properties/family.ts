import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Using an element's place to predict its properties. */
export const placeAndProperties = factFamily([Concept.TrendsAndFinale], {
  "like-mg": {
    prompt: [
      "Which two elements react most like magnesium?",
      "कौन-से दो तत्व मैग्नीशियम जैसी सबसे अधिक अभिक्रिया करते हैं?",
    ],
    right: ["Beryllium and calcium: same group", "बेरिलियम और कैल्सियम: एक समूह"],
    wrong: [
      [
        "Sodium and aluminium: same period",
        "सोडियम और ऐलुमिनियम: एक आवर्त",
        "A period changes properties. The group shares them.",
        "आवर्त गुण बदलता है। समूह उन्हें बाँटता है।",
      ],
      [
        "Neon and argon: full shells",
        "नियॉन और आर्गन: भरे कोश",
        "Noble gases barely react at all.",
        "उत्कृष्ट गैसें मुश्किल से अभिक्रिया करती हैं।",
      ],
    ],
  },
  xcl2: {
    prompt: [
      "X forms XCl₂, a solid with a high melting point. X is in the group of…",
      "X, XCl₂ बनाता है, ऊँचे गलनांक वाला ठोस। X किसके समूह में है…",
    ],
    right: ["Mg", "Mg"],
    wrong: [
      ["Na", "Na", "Na forms NaCl: valency 1.", "Na, NaCl बनाता है: संयोजकता 1।"],
      ["Al", "Al", "Al forms AlCl₃: valency 3.", "Al, AlCl₃ बनाता है: संयोजकता 3।"],
    ],
  },
  calcium: {
    prompt: [
      "Calcium is Z = 20. Of Z = 12, 19, 21 and 38, which resemble it?",
      "कैल्सियम Z = 20 है। Z = 12, 19, 21 और 38 में से कौन उस जैसे हैं?",
    ],
    right: ["12 and 38", "12 और 38"],
    wrong: [
      ["19 and 21", "19 और 21", "Those are its neighbours in a period.", "वे आवर्त में उसके पड़ोसी हैं।"],
      ["21 and 38", "21 और 38", "21 is scandium, in group 3.", "21 स्कैंडियम है, समूह 3 में।"],
    ],
  },
  "n-p": {
    prompt: [
      "Nitrogen (2, 5) or phosphorus (2, 8, 5): which is more electronegative?",
      "नाइट्रोजन (2, 5) या फ़ॉस्फ़ोरस (2, 8, 5): कौन अधिक विद्युत ऋणात्मक है?",
    ],
    right: ["Nitrogen: fewer shells, stronger pull", "नाइट्रोजन: कम कोश, अधिक खिंचाव"],
    wrong: [
      [
        "Phosphorus: more shells, stronger pull",
        "फ़ॉस्फ़ोरस: अधिक कोश, अधिक खिंचाव",
        "More shells put the outer electrons farther away: a weaker pull.",
        "अधिक कोश बाहरी इलेक्ट्रॉनों को दूर रखते हैं: कमज़ोर खिंचाव।",
      ],
      [
        "Neither: same five valence electrons",
        "कोई नहीं: वही पाँच संयोजकता इलेक्ट्रॉन",
        "Down a group the pull weakens.",
        "समूह में नीचे खिंचाव कमज़ोर होता है।",
      ],
    ],
  },
  "a-c": {
    prompt: [
      "A and C are in group 17, A above C. Which is more reactive?",
      "A और C समूह 17 में हैं, A, C के ऊपर। कौन अधिक क्रियाशील है?",
    ],
    right: ["A: it gains an electron more easily", "A: यह आसानी से इलेक्ट्रॉन लेता है"],
    wrong: [
      [
        "C: it gains an electron more easily",
        "C: यह आसानी से इलेक्ट्रॉन लेता है",
        "Lower in the group the pull is weaker.",
        "समूह में नीचे खिंचाव कमज़ोर है।",
      ],
      [
        "Neither: same group, same reactivity",
        "कोई नहीं: एक समूह, एक क्रियाशीलता",
        "Same valence electrons, but reactivity changes down the group.",
        "संयोजकता इलेक्ट्रॉन वही, पर क्रियाशीलता समूह में बदलती है।",
      ],
    ],
  },
  "b-c": {
    prompt: [
      "B is in group 16 and C in group 17, in the same period. Which is larger?",
      "B समूह 16 में और C समूह 17 में है, एक ही आवर्त में। कौन बड़ा है?",
    ],
    right: ["B: size falls left to right", "B: बाएँ से दाएँ आकार घटता है"],
    wrong: [
      [
        "C: size grows left to right",
        "C: बाएँ से दाएँ आकार बढ़ता है",
        "Across a period the radius decreases.",
        "आवर्त में त्रिज्या घटती है।",
      ],
      [
        "Equal: same number of shells",
        "बराबर: कोशों की संख्या एक",
        "Same shells, but C's nucleus pulls harder.",
        "कोश वही, पर C का नाभिक अधिक खींचता है।",
      ],
    ],
  },
  "first-ten": {
    prompt: ["Among the first ten elements, which are metals?", "पहले दस तत्वों में कौन-सी धातुएँ हैं?"],
    right: ["Lithium and beryllium", "लीथियम और बेरिलियम"],
    wrong: [
      [
        "Lithium, beryllium and boron",
        "लीथियम, बेरिलियम और बोरॉन",
        "Boron is a metalloid.",
        "बोरॉन एक उपधातु है।",
      ],
      [
        "Hydrogen and lithium",
        "हाइड्रोजन और लीथियम",
        "Hydrogen is a non-metal.",
        "हाइड्रोजन एक अधातु है।",
      ],
    ],
  },
});
