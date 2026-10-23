import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Section 4.1: why carbon shares, and the properties of covalent compounds (Table 4.1). */
export const covalentFacts = factFamily([Concept.CovalentBond], {
  "why-share": {
    prompt: [
      "Why does carbon share electrons instead of forming ions?",
      "कार्बन आयन बनाने के बजाय इलेक्ट्रॉन साझा क्यों करता है?",
    ],
    right: ["Gaining or losing four electrons is too hard", "चार इलेक्ट्रॉन पाना या खोना बहुत कठिन है"],
    wrong: [
      [
        "Carbon already has a full outer shell",
        "कार्बन का बाहरी कोश पहले से भरा है",
        "It has 4 of the 8 it needs.",
        "उसके पास ज़रूरी 8 में से 4 हैं।",
      ],
      [
        "Carbon is a metal, and metals always share",
        "कार्बन धातु है, और धातुएँ हमेशा साझा करती हैं",
        "Carbon is a non-metal.",
        "कार्बन अधातु है।",
      ],
    ],
  },
  valence: {
    prompt: ["How many valence electrons does carbon have?", "कार्बन के कितने संयोजकता इलेक्ट्रॉन हैं?"],
    right: ["4", "4"],
    wrong: [
      [
        "6: all of its electrons",
        "6: उसके सभी इलेक्ट्रॉन",
        "6 is carbon's atomic number: 2 inner + 4 outer.",
        "6 कार्बन की परमाणु संख्या है: 2 अंदर + 4 बाहर।",
      ],
      [
        "2: the ones in its first shell",
        "2: उसके पहले कोश वाले",
        "2 are in the inner shell.",
        "2 भीतरी कोश में हैं।",
      ],
    ],
  },
  conduct: {
    prompt: [
      "Why are most carbon compounds poor conductors of electricity?",
      "अधिकांश कार्बन यौगिक विद्युत के कुचालक क्यों हैं?",
    ],
    right: ["They have no ions", "उनमें आयन नहीं हैं"],
    wrong: [
      [
        "They are always solids",
        "वे हमेशा ठोस होते हैं",
        "Many are liquids or gases; what matters is that there are no ions.",
        "कई द्रव या गैस हैं; मायने यह रखता है कि आयन नहीं हैं।",
      ],
      [
        "Their bonds are ionic",
        "उनके आबंध आयनिक हैं",
        "Ionic compounds conduct when molten. Carbon compounds are covalent.",
        "आयनिक यौगिक पिघलकर चालन करते हैं। कार्बन यौगिक सहसंयोजक हैं।",
      ],
    ],
  },
  "low-mp": {
    prompt: [
      "Why do covalent compounds generally have low melting and boiling points?",
      "सहसंयोजक यौगिकों के गलनांक और क्वथनांक सामान्यतः कम क्यों होते हैं?",
    ],
    right: ["The forces between their molecules are weak", "उनके अणुओं के बीच बल दुर्बल हैं"],
    wrong: [
      [
        "Their covalent bonds are weak and break",
        "उनके सहसंयोजक बंध कमज़ोर हैं और टूटते हैं",
        "Bonds inside a molecule are strong; it's between molecules that forces are weak.",
        "अणु के अंदर के आबंध प्रबल हैं; अणुओं के बीच बल दुर्बल हैं।",
      ],
      [
        "They contain ions held loosely",
        "उनमें ढीले बँधे आयन होते हैं",
        "They don't; ionic compounds have high melting points.",
        "नहीं हैं; आयनिक यौगिकों के गलनांक ऊँचे होते हैं।",
      ],
    ],
  },
  valency: {
    prompt: ["What is carbon's valency?", "कार्बन की संयोजकता क्या है?"],
    right: ["4: it is tetravalent", "4: यह चतुःसंयोजक है"],
    wrong: [
      [
        "2: it is divalent",
        "2: यह द्विसंयोजी है",
        "Carbon forms four bonds.",
        "कार्बन चार आबंध बनाता है।",
      ],
      [
        "6: one for each electron shell",
        "6: हर कोश के लिए एक",
        "6 is its atomic number.",
        "6 उसकी परमाणु संख्या है।",
      ],
    ],
  },
});
