import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Section 4.2.5, Table 4.4: naming; NCERT in-text Q. */
export const nameTheCompound = factFamily([Concept.NamingCarbonCompounds], {
  ethanoic: {
    prompt: ["Name CH₃COOH.", "CH₃COOH का नाम बताओ।"],
    right: ["Ethanoic acid", "एथेनॉइक अम्ल"],
    wrong: [
      [
        "Methanoic acid",
        "मेथेनॉइक अम्ल",
        "Count carbons: two, so eth-.",
        "कार्बन गिनो: दो, इसलिए एथ-।",
      ],
      ["Ethanol", "एथेनॉल", "–COOH is an acid, not –OH.", "–COOH अम्ल है, –OH नहीं।"],
    ],
  },
  propanone: {
    prompt: ["Name CH₃COCH₃.", "CH₃COCH₃ का नाम बताओ।"],
    right: ["Propanone", "प्रोपेनोन"],
    wrong: [
      [
        "Propanal",
        "प्रोपेनैल",
        "The C=O is in the middle: a ketone, -one.",
        "C=O बीच में है: कीटोन, -ोन।",
      ],
      ["Ethanone", "एथेनोन", "There are three carbons.", "तीन कार्बन हैं।"],
    ],
  },
  bromopentane: {
    prompt: ["A five-carbon chain with one –Br is named…", "एक –Br वाली पाँच-कार्बन शृंखला का नाम है…"],
    right: ["Bromopentane", "ब्रोमोपेंटेन"],
    wrong: [
      ["Pentanol", "पेंटेनॉल", "–Br is a halo group: prefix bromo-.", "–Br हैलो समूह है: उपसर्ग ब्रोमो-।"],
      ["Bromobutane", "ब्रोमोब्यूटेन", "Five carbons: pent-.", "पाँच कार्बन: पेंट-।"],
    ],
  },
  hexanal: {
    prompt: [
      "A six-carbon chain ending in –CHO is named…",
      "–CHO पर ख़त्म होने वाली छह-कार्बन शृंखला का नाम है…",
    ],
    right: ["Hexanal", "हेक्सेनैल"],
    wrong: [
      ["Hexanol", "हेक्सेनॉल", "–ol is –OH; –CHO is -al.", "-ॉल –OH है; –CHO -ैल है।"],
      ["Hexanone", "हेक्सेनोन", "-one is a ketone in the middle.", "-ोन बीच वाला कीटोन है।"],
    ],
  },
  methanal: {
    prompt: ["Name HCHO.", "HCHO का नाम बताओ।"],
    right: ["Methanal", "मेथेनैल"],
    wrong: [
      ["Methanol", "मेथेनॉल", "–CHO is an aldehyde: -al.", "–CHO ऐल्डिहाइड है: -ैल।"],
      ["Ethanal", "एथेनैल", "One carbon: meth-.", "एक कार्बन: मेथ-।"],
    ],
  },
  propene: {
    prompt: [
      "A three-carbon chain with one double bond is named…",
      "एक द्विआबंध वाली तीन-कार्बन शृंखला का नाम है…",
    ],
    right: ["Propene", "प्रोपीन"],
    wrong: [
      ["Propyne", "प्रोपाइन", "-yne is a triple bond.", "-ाइन त्रिआबंध है।"],
      ["Propane", "प्रोपेन", "-ane is single bonds only.", "-ेन केवल एकल आबंध है।"],
    ],
  },
});
