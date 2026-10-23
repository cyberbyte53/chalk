import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Section 4.2: catenation, tetravalency, strong bonds; organic compounds. */
export const carbonVersatility = factFamily([Concept.VersatileCarbon], {
  catenation: {
    prompt: [
      "The property of carbon atoms to link with each other in long chains is…",
      "कार्बन परमाणुओं का आपस में लंबी शृंखलाओं में जुड़ने का गुण है…",
    ],
    right: ["Catenation", "शृंखलन"],
    wrong: [
      ["Tetravalency", "चतुःसंयोजकता", "That's having valency 4.", "वह संयोजकता 4 होना है।"],
      ["Allotropy", "अपररूपता", "That's existing in different forms.", "वह अलग-अलग रूपों में होना है।"],
    ],
  },
  tetravalency: {
    prompt: [
      "Carbon can bond with four other atoms. This is…",
      "कार्बन चार अन्य परमाणुओं से जुड़ सकता है। यह है…",
    ],
    right: ["Tetravalency", "चतुःसंयोजकता"],
    wrong: [
      [
        "Catenation",
        "शृंखलन",
        "Catenation is bonding with other carbons in chains.",
        "शृंखलन दूसरे कार्बनों से शृंखला में जुड़ना है।",
      ],
    ],
  },
  silicon: {
    prompt: [
      "Which other element shows catenation, but only up to 7–8 atoms?",
      "कौन-सा दूसरा तत्व शृंखलन दिखाता है, पर केवल 7–8 परमाणुओं तक?",
    ],
    right: ["Silicon", "सिलिकॉन"],
    wrong: [
      ["Oxygen", "ऑक्सीजन", "Oxygen doesn't form long chains.", "ऑक्सीजन लंबी शृंखलाएँ नहीं बनाती।"],
      ["Sodium", "सोडियम", "Sodium is a metal that forms ions.", "सोडियम आयन बनाने वाली धातु है।"],
    ],
  },
  wohler: {
    prompt: [
      "Who first made an organic compound, urea, in a laboratory?",
      "प्रयोगशाला में पहला कार्बनिक यौगिक, यूरिया, किसने बनाया?",
    ],
    right: ["Friedrich Wöhler, in 1828", "फ़्रेडरिक वोहलर, 1828 में"],
    wrong: [
      [
        "Gregor Mendel, in 1866",
        "ग्रेगर मेंडल, 1866 में",
        "Mendel studied pea plants.",
        "मेंडल ने मटर के पौधों का अध्ययन किया।",
      ],
      [
        "Buckminster Fuller, in 1985",
        "बकमिन्स्टर फ़ुलर, 1985 में",
        "Fuller was the architect fullerenes are named after.",
        "फ़ुलर वे वास्तुकार हैं जिनके नाम पर फ़ुलरीन है।",
      ],
    ],
  },
  stable: {
    prompt: ["Why are carbon's bonds so strong?", "कार्बन के आबंध इतने प्रबल क्यों हैं?"],
    right: [
      "Carbon atoms are small, so the nucleus holds the shared pairs tightly",
      "कार्बन परमाणु छोटे हैं, इसलिए नाभिक साझा जोड़ियों को कसकर पकड़ता है",
    ],
    wrong: [
      [
        "Carbon atoms are large",
        "कार्बन परमाणु बड़े हैं",
        "It's the small size that makes the bonds strong.",
        "छोटा आकार आबंधों को प्रबल बनाता है।",
      ],
    ],
  },
});
