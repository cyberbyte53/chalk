import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Döbereiner's triads: is the middle mass the average of the outer two? */
export const triadCheck = factFamily([Concept.WhyClassify], {
  "li-na-k": {
    prompt: [
      "Li 6.9, Na 23.0, K 39.0. What is the average of Li and K?",
      "Li 6.9, Na 23.0, K 39.0। Li और K का औसत क्या है?",
    ],
    right: ["22.95, close to Na: a triad", "22.95, Na के पास: त्रिक"],
    wrong: [
      [
        "45.9, far from Na: not a triad",
        "45.9, Na से दूर: त्रिक नहीं",
        "45.9 is the sum. Halve it.",
        "45.9 योग है। उसे आधा करो।",
      ],
      [
        "16.1, far from Na: not a triad",
        "16.1, Na से दूर: त्रिक नहीं",
        "16.1 is Na − Li. Average the outer two.",
        "16.1, Na − Li है। बाहरी दो का औसत लो।",
      ],
    ],
  },
  "n-p-as": {
    prompt: [
      "N 14.0, P 31.0, As 74.9. Is it a Döbereiner triad?",
      "N 14.0, P 31.0, As 74.9। क्या यह डॉबेराइनर त्रिक है?",
    ],
    right: ["No: the average 44.5 is far from 31.0", "नहीं: औसत 44.5, 31.0 से दूर है"],
    wrong: [
      [
        "Yes: the average 44.5 is close to 31.0",
        "हाँ: औसत 44.5, 31.0 के पास है",
        "44.5 and 31.0 differ by 13.5: not close.",
        "44.5 और 31.0 में 13.5 का अंतर है: पास नहीं।",
      ],
      [
        "Yes: the average 31.0 equals P's mass",
        "हाँ: औसत 31.0, P के द्रव्यमान के बराबर",
        "(14.0 + 74.9) ÷ 2 is 44.45, not 31.0.",
        "(14.0 + 74.9) ÷ 2 = 44.45 है, 31.0 नहीं।",
      ],
    ],
  },
  "cl-br-i": {
    prompt: [
      "Cl 35.5, Br 79.9, I 126.9. Is it a triad?",
      "Cl 35.5, Br 79.9, I 126.9। क्या यह त्रिक है?",
    ],
    right: ["Yes: the average 81.2 is close to 79.9", "हाँ: औसत 81.2, 79.9 के पास है"],
    wrong: [
      [
        "No: the average 162.4 is far from 79.9",
        "नहीं: औसत 162.4, 79.9 से दूर है",
        "162.4 is the sum. The average is 81.2.",
        "162.4 योग है। औसत 81.2 है।",
      ],
      [
        "No: the average 91.4 is far from 79.9",
        "नहीं: औसत 91.4, 79.9 से दूर है",
        "91.4 is I − Cl. Add the outer two and halve.",
        "91.4, I − Cl है। बाहरी दो जोड़ो और आधा करो।",
      ],
    ],
  },
  "ca-sr-ba": {
    prompt: [
      "Ca 40.1, Sr 87.6, Ba 137.3. What is the average of Ca and Ba?",
      "Ca 40.1, Sr 87.6, Ba 137.3। Ca और Ba का औसत क्या है?",
    ],
    right: ["88.7, close to Sr: a triad", "88.7, Sr के पास: त्रिक"],
    wrong: [
      [
        "97.2, far from Sr: not a triad",
        "97.2, Sr से दूर: त्रिक नहीं",
        "97.2 is Ba − Ca. Add them and halve.",
        "97.2, Ba − Ca है। जोड़ो और आधा करो।",
      ],
      [
        "63.9, far from Sr: not a triad",
        "63.9, Sr से दूर: त्रिक नहीं",
        "That's the average of Ca and Sr. Use the outer two.",
        "यह Ca और Sr का औसत है। बाहरी दो लो।",
      ],
    ],
  },
  limit: {
    prompt: [
      "What was the main limit of Döbereiner's triads?",
      "डॉबेराइनर के त्रिकों की मुख्य सीमा क्या थी?",
    ],
    right: ["Only three triads were found", "केवल तीन त्रिक मिले"],
    wrong: [
      [
        "They worked only up to calcium",
        "वे केवल कैल्सियम तक चले",
        "That was Newlands' octaves.",
        "वह न्यूलैंड्स के अष्टकों की सीमा थी।",
      ],
      [
        "They gave hydrogen no place",
        "उन्होंने हाइड्रोजन को जगह नहीं दी",
        "That was a limit of Mendeléev's table.",
        "वह मेंडेलीफ़ की सारणी की सीमा थी।",
      ],
    ],
  },
});
