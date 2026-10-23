import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Naming backwards: from a name to its formula. */
export const formulaFromName = factFamily([Concept.NamingCarbonCompounds], {
  ethanol: {
    prompt: ["Which is ethanol?", "एथेनॉल कौन-सा है?"],
    right: ["CH₃CH₂OH", "CH₃CH₂OH"],
    wrong: [
      ["CH₃OH", "CH₃OH", "That's methanol: one carbon.", "वह मेथेनॉल है: एक कार्बन।"],
      ["CH₃COOH", "CH₃COOH", "That's ethanoic acid.", "वह एथेनॉइक अम्ल है।"],
    ],
  },
  chloropropane: {
    prompt: ["Which is chloropropane?", "क्लोरोप्रोपेन कौन-सा है?"],
    right: ["CH₃CH₂CH₂Cl", "CH₃CH₂CH₂Cl"],
    wrong: [
      ["CH₃CH₂Cl", "CH₃CH₂Cl", "That's chloroethane: two carbons.", "वह क्लोरोएथेन है: दो कार्बन।"],
      ["CH₃CH₂CH₂OH", "CH₃CH₂CH₂OH", "That's propanol.", "वह प्रोपेनॉल है।"],
    ],
  },
  butanone: {
    prompt: ["Which is butanone?", "ब्यूटेनोन कौन-सा है?"],
    right: ["CH₃COCH₂CH₃", "CH₃COCH₂CH₃"],
    wrong: [
      ["CH₃COCH₃", "CH₃COCH₃", "That's propanone: three carbons.", "वह प्रोपेनोन है: तीन कार्बन।"],
      ["CH₃CH₂CH₂CHO", "CH₃CH₂CH₂CHO", "That's butanal, an aldehyde.", "वह ब्यूटेनैल है, एक ऐल्डिहाइड।"],
    ],
  },
  methanoic: {
    prompt: ["Which is methanoic acid?", "मेथेनॉइक अम्ल कौन-सा है?"],
    right: ["HCOOH", "HCOOH"],
    wrong: [
      ["CH₃COOH", "CH₃COOH", "That has two carbons.", "उसमें दो कार्बन हैं।"],
      ["HCHO", "HCHO", "That's methanal.", "वह मेथेनैल है।"],
    ],
  },
  ethyne: {
    prompt: ["Which is ethyne?", "एथाइन कौन-सा है?"],
    right: ["HC≡CH", "HC≡CH"],
    wrong: [
      ["H₂C=CH₂", "H₂C=CH₂", "That's ethene.", "वह एथीन है।"],
      ["CH₃–CH₃", "CH₃–CH₃", "That's ethane.", "वह एथेन है।"],
    ],
  },
});
