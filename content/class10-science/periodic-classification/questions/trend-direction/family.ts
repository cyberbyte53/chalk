import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Which way each trend runs across a period and down a group. */
export const trendDirection = factFamily([Concept.TrendsAndFinale], {
  "size-across": {
    prompt: ["Across a period, left to right, atomic radius…", "आवर्त में, बाएँ से दाएँ, परमाणु त्रिज्या…"],
    right: ["decreases", "घटती है"],
    wrong: [
      [
        "increases",
        "बढ़ती है",
        "It shrinks: Li 152 pm down to O 66 pm.",
        "यह सिकुड़ती है: Li 152 pm से O 66 pm तक।",
      ],
      [
        "stays the same",
        "वही रहती है",
        "Same shells, but the pull grows, so it shrinks.",
        "कोश वही, पर खिंचाव बढ़ता है, इसलिए सिकुड़ती है।",
      ],
    ],
  },
  "size-down": {
    prompt: ["Down a group, atomic size…", "समूह में नीचे, परमाणु आकार…"],
    right: ["increases", "बढ़ता है"],
    wrong: [
      [
        "decreases",
        "घटता है",
        "New shells push it out: Li 152, Cs 262 pm.",
        "नए कोश इसे बाहर धकेलते हैं: Li 152, Cs 262 pm।",
      ],
      ["stays the same", "वही रहता है", "Each step adds a shell.", "हर क़दम एक कोश जोड़ता है।"],
    ],
  },
  "metal-across": {
    prompt: ["Across a period, metallic character…", "आवर्त में, धात्विक गुण…"],
    right: ["decreases", "घटता है"],
    wrong: [
      [
        "increases",
        "बढ़ता है",
        "Metals are on the left; it falls to the right.",
        "धातुएँ बाईं ओर हैं; दाईं ओर यह घटता है।",
      ],
      [
        "stays the same",
        "वही रहता है",
        "Na and Mg are metals; S and Cl are not.",
        "Na और Mg धातुएँ हैं; S और Cl नहीं।",
      ],
    ],
  },
  "metal-down": {
    prompt: ["Down a group, metallic character…", "समूह में नीचे, धात्विक गुण…"],
    right: ["increases", "बढ़ता है"],
    wrong: [
      [
        "decreases",
        "घटता है",
        "Outer electrons are farther and lost more easily.",
        "बाहरी इलेक्ट्रॉन दूर हैं और आसानी से खोते हैं।",
      ],
      [
        "stays the same",
        "वही रहता है",
        "It grows as the outer shell moves out.",
        "बाहरी कोश के दूर जाने से यह बढ़ता है।",
      ],
    ],
  },
  "en-down": {
    prompt: ["Down a group, the tendency to gain electrons…", "समूह में नीचे, इलेक्ट्रॉन लेने की प्रवृत्ति…"],
    right: ["decreases", "घटती है"],
    wrong: [
      [
        "increases",
        "बढ़ती है",
        "The nucleus pulls less on a farther shell.",
        "दूर के कोश पर नाभिक कम खींचता है।",
      ],
      [
        "stays the same",
        "वही रहती है",
        "It weakens as shells are added.",
        "कोश जुड़ने से यह कमज़ोर होती है।",
      ],
    ],
  },
  "valency-down": {
    prompt: ["Down a group, valency…", "समूह में नीचे, संयोजकता…"],
    right: ["stays the same", "वही रहती है"],
    wrong: [
      [
        "increases by one",
        "एक बढ़ती है",
        "Valence electrons stay the same down a group.",
        "समूह में नीचे संयोजकता इलेक्ट्रॉन वही रहते हैं।",
      ],
      [
        "decreases by one",
        "एक घटती है",
        "Valence electrons stay the same down a group.",
        "समूह में नीचे संयोजकता इलेक्ट्रॉन वही रहते हैं।",
      ],
    ],
  },
  oxides: {
    prompt: ["Across a period, the oxides become more…", "आवर्त में, ऑक्साइड अधिक होते जाते हैं…"],
    right: ["acidic", "अम्लीय"],
    wrong: [
      [
        "basic",
        "क्षारीय",
        "Metal oxides on the left are basic; they turn acidic to the right.",
        "बाईं ओर के धातु ऑक्साइड क्षारीय हैं; दाईं ओर अम्लीय होते जाते हैं।",
      ],
      [
        "neutral",
        "उदासीन",
        "Non-metal oxides on the right are generally acidic.",
        "दाईं ओर के अधातु ऑक्साइड सामान्यतः अम्लीय हैं।",
      ],
    ],
  },
});
