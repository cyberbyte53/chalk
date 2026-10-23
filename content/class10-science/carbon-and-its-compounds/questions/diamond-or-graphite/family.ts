import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Diamond vs graphite: properties from structure. */
export const diamondOrGraphite = factFamily([Concept.AllotropesOfCarbon], {
  hardest: {
    prompt: ["Which is the hardest substance known?", "सबसे कठोर ज्ञात पदार्थ कौन-सा है?"],
    right: ["Diamond", "हीरा"],
    wrong: [["Graphite", "ग्रेफ़ाइट", "Graphite is soft and slippery.", "ग्रेफ़ाइट नरम और फिसलन भरा है।"]],
  },
  conducts: {
    prompt: [
      "Which allotrope is a very good conductor of electricity?",
      "कौन-सा अपररूप विद्युत का बहुत अच्छा चालक है?",
    ],
    right: ["Graphite", "ग्रेफ़ाइट"],
    wrong: [["Diamond", "हीरा", "Diamond doesn't conduct.", "हीरा चालन नहीं करता।"]],
  },
  lubricant: {
    prompt: [
      "Which allotrope's layers slide over each other, so it can be used as a lubricant?",
      "किस अपररूप की परतें एक-दूसरे पर फिसलती हैं, जिससे वह स्नेहक बन सकता है?",
    ],
    right: ["Graphite", "ग्रेफ़ाइट"],
    wrong: [
      [
        "Diamond",
        "हीरा",
        "Diamond has no layers; it's a rigid 3-D network.",
        "हीरे में परतें नहीं; वह कठोर त्रि-आयामी जाल है।",
      ],
    ],
  },
  pencil: {
    prompt: ["A pencil's grey 'lead' is…", "पेंसिल का धूसर 'लेड' है…"],
    right: ["Graphite", "ग्रेफ़ाइट"],
    wrong: [
      ["The metal lead", "धातु लेड", "Pencils contain no lead metal.", "पेंसिलों में लेड धातु नहीं होती।"],
      ["Charcoal", "लकड़ी का कोयला", "It's graphite, mixed with clay.", "यह ग्रेफ़ाइट है, मिट्टी के साथ।"],
    ],
  },
  cutting: {
    prompt: ["Which allotrope would you use to cut glass?", "काँच काटने के लिए कौन-सा अपररूप लोगे?"],
    right: ["Diamond", "हीरा"],
    wrong: [["Graphite", "ग्रेफ़ाइट", "Graphite is too soft.", "ग्रेफ़ाइट बहुत नरम है।"]],
  },
});
