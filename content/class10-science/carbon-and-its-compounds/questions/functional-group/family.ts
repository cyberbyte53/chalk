import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Section 4.2.3, Table 4.3: heteroatoms and functional groups. */
export const functionalGroup = factFamily([Concept.FunctionalGroupsAndSeries], {
  oh: {
    prompt: ["–OH is the functional group of…", "–OH किसका प्रकार्यात्मक समूह है?"],
    right: ["Alcohols", "ऐल्कोहॉल"],
    wrong: [
      ["Carboxylic acids", "कार्बोक्सिलिक अम्ल", "Acids have –COOH.", "अम्लों में –COOH होता है।"],
      ["Aldehydes", "ऐल्डिहाइड", "Aldehydes have –CHO.", "ऐल्डिहाइड में –CHO होता है।"],
    ],
  },
  cooh: {
    prompt: ["–COOH is the functional group of…", "–COOH किसका प्रकार्यात्मक समूह है?"],
    right: ["Carboxylic acids", "कार्बोक्सिलिक अम्ल"],
    wrong: [
      ["Alcohols (–OH)", "ऐल्कोहॉल (–OH)", "Alcohols have –OH.", "ऐल्कोहॉल में –OH होता है।"],
      [
        "Ketones (–CO–)",
        "कीटोन (–CO–)",
        "Ketones have >C=O inside the chain.",
        "कीटोन में शृंखला के अंदर >C=O होता है।",
      ],
    ],
  },
  cho: {
    prompt: ["–CHO is the functional group of…", "–CHO किसका प्रकार्यात्मक समूह है?"],
    right: ["Aldehydes", "ऐल्डिहाइड"],
    wrong: [
      [
        "Ketones (–CO–)",
        "कीटोन (–CO–)",
        "A ketone's C=O is inside the chain, not at the end.",
        "कीटोन का C=O शृंखला के अंदर है, सिरे पर नहीं।",
      ],
      ["Alcohols (–OH)", "ऐल्कोहॉल (–OH)", "Alcohols have –OH.", "ऐल्कोहॉल में –OH होता है।"],
    ],
  },
  ketone: {
    prompt: [
      "A C=O group in the middle of a carbon chain makes a…",
      "कार्बन शृंखला के बीच में C=O समूह बनाता है…",
    ],
    right: ["Ketone", "कीटोन"],
    wrong: [
      [
        "Aldehyde",
        "ऐल्डिहाइड",
        "An aldehyde's C=O is at the end, as –CHO.",
        "ऐल्डिहाइड का C=O सिरे पर है, –CHO के रूप में।",
      ],
    ],
  },
  heteroatom: {
    prompt: [
      "An element that replaces hydrogen in a hydrocarbon chain is a…",
      "हाइड्रोकार्बन शृंखला में हाइड्रोजन को बदलने वाला तत्व है…",
    ],
    right: ["Heteroatom", "विषम परमाणु"],
    wrong: [
      [
        "Isomer",
        "समावयव",
        "Isomers are compounds with the same formula.",
        "समावयव एक ही सूत्र वाले यौगिक हैं।",
      ],
      ["Catalyst", "उत्प्रेरक", "A catalyst speeds up a reaction.", "उत्प्रेरक अभिक्रिया तेज़ करता है।"],
    ],
  },
  halo: {
    prompt: ["–Cl or –Br on a carbon chain is a…", "कार्बन शृंखला पर –Cl या –Br है…"],
    right: ["Halo group", "हैलो समूह"],
    wrong: [["Alcohol group", "ऐल्कोहॉल समूह", "That's –OH.", "वह –OH है।"]],
  },
});
