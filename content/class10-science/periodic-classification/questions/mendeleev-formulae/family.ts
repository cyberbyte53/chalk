import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Predicting oxides from Mendeléev's group formulae (R₂O, RO, R₂O₃, RO₂, …). */
export const mendeleevFormulae = factFamily([Concept.MendeleevTable], {
  k: {
    prompt: [
      "Potassium is in group I (oxide R₂O). What is its oxide?",
      "पोटैशियम समूह I (ऑक्साइड R₂O) में है। उसका ऑक्साइड क्या है?",
    ],
    right: ["K₂O", "K₂O"],
    wrong: [
      ["KO", "KO", "RO is group II's formula.", "RO समूह II का सूत्र है।"],
      ["KO₂", "KO₂", "RO₂ is group IV's formula.", "RO₂ समूह IV का सूत्र है।"],
    ],
  },
  c: {
    prompt: [
      "Carbon is in group IV (oxide RO₂). What is its oxide?",
      "कार्बन समूह IV (ऑक्साइड RO₂) में है। उसका ऑक्साइड क्या है?",
    ],
    right: ["CO₂", "CO₂"],
    wrong: [
      ["C₂O", "C₂O", "R₂O is group I's formula.", "R₂O समूह I का सूत्र है।"],
      ["CO", "CO", "RO is group II's formula.", "RO समूह II का सूत्र है।"],
    ],
  },
  al: {
    prompt: [
      "Aluminium is in group III (oxide R₂O₃). What is its oxide?",
      "ऐलुमिनियम समूह III (ऑक्साइड R₂O₃) में है। उसका ऑक्साइड क्या है?",
    ],
    right: ["Al₂O₃", "Al₂O₃"],
    wrong: [
      ["Al₃O₂", "Al₃O₂", "The formula is R₂O₃: two Al, three O.", "सूत्र R₂O₃ है: दो Al, तीन O।"],
      ["AlO₃", "AlO₃", "Group III's oxide has two R atoms.", "समूह III के ऑक्साइड में दो R परमाणु हैं।"],
    ],
  },
  si: {
    prompt: [
      "Silicon is in group IV, under carbon. What is its oxide?",
      "सिलिकॉन समूह IV में, कार्बन के नीचे है। उसका ऑक्साइड क्या है?",
    ],
    right: ["SiO₂", "SiO₂"],
    wrong: [
      ["Si₂O₃", "Si₂O₃", "R₂O₃ is group III's formula.", "R₂O₃ समूह III का सूत्र है।"],
      ["SiO", "SiO", "RO is group II's formula.", "RO समूह II का सूत्र है।"],
    ],
  },
  ba: {
    prompt: [
      "Barium is in group II (oxide RO). What is its oxide?",
      "बेरियम समूह II (ऑक्साइड RO) में है। उसका ऑक्साइड क्या है?",
    ],
    right: ["BaO", "BaO"],
    wrong: [
      ["Ba₂O", "Ba₂O", "R₂O is group I's formula.", "R₂O समूह I का सूत्र है।"],
      ["BaO₂", "BaO₂", "RO₂ is group IV's formula.", "RO₂ समूह IV का सूत्र है।"],
    ],
  },
  hydride: {
    prompt: [
      "Carbon's hydride is CH₄, written RH₄ for group IV. What would silicon's hydride be?",
      "कार्बन का हाइड्राइड CH₄ है, समूह IV के लिए RH₄ लिखा जाता है। सिलिकॉन का हाइड्राइड क्या होगा?",
    ],
    right: ["SiH₄", "SiH₄"],
    wrong: [
      ["SiH₂", "SiH₂", "RH₂ is for groups II and VI.", "RH₂ समूह II और VI के लिए है।"],
      [
        "Si₂H",
        "Si₂H",
        "Hydrides are written RH, RH₂, RH₃ or RH₄.",
        "हाइड्राइड RH, RH₂, RH₃ या RH₄ लिखे जाते हैं।",
      ],
    ],
  },
});
