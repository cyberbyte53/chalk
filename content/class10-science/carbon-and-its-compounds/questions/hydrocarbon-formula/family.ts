import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Table 4.2 and the general formulae: alkanes, alkenes, alkynes. */
export const hydrocarbonFormula = factFamily([Concept.ChainsBranchesRings], {
  "c3-alkane": {
    prompt: ["What is the formula of the alkane with 3 carbons?", "3 कार्बन वाले ऐल्केन का सूत्र क्या है?"],
    right: ["C₃H₈", "C₃H₈"],
    wrong: [
      ["C₃H₆", "C₃H₆", "That's the alkene, propene.", "वह ऐल्कीन है, प्रोपीन।"],
      ["C₃H₄", "C₃H₄", "That's the alkyne, propyne.", "वह ऐल्काइन है, प्रोपाइन।"],
    ],
  },
  "c4-alkane": {
    prompt: ["What is the formula of butane?", "ब्यूटेन का सूत्र क्या है?"],
    right: ["C₄H₁₀", "C₄H₁₀"],
    wrong: [
      ["C₄H₈", "C₄H₈", "That's butene, with a double bond.", "वह ब्यूटीन है, द्विआबंध के साथ।"],
      ["C₄H₁₂", "C₄H₁₂", "Alkanes are CₙH₂ₙ₊₂: 2×4 + 2 = 10.", "ऐल्केन CₙH₂ₙ₊₂ हैं: 2×4 + 2 = 10।"],
    ],
  },
  "c5-alkane": {
    prompt: ["What is the formula of pentane?", "पेंटेन का सूत्र क्या है?"],
    right: ["C₅H₁₂", "C₅H₁₂"],
    wrong: [
      ["C₅H₁₀", "C₅H₁₀", "That's pentene.", "वह पेंटीन है।"],
      ["C₅H₁₄", "C₅H₁₄", "2×5 + 2 = 12.", "2×5 + 2 = 12।"],
    ],
  },
  "c6-alkane": {
    prompt: ["What is the formula of hexane?", "हेक्सेन का सूत्र क्या है?"],
    right: ["C₆H₁₄", "C₆H₁₄"],
    wrong: [
      [
        "C₆H₁₂",
        "C₆H₁₂",
        "That's hexene, or the ring cyclohexane.",
        "वह हेक्सीन है, या वलय साइक्लोहेक्सेन।",
      ],
      ["C₆H₆", "C₆H₆", "That's benzene.", "वह बेंज़ीन है।"],
    ],
  },
  "c3-alkene": {
    prompt: ["What is the formula of propene?", "प्रोपीन का सूत्र क्या है?"],
    right: ["C₃H₆", "C₃H₆"],
    wrong: [
      ["C₃H₈", "C₃H₈", "That's propane, saturated.", "वह प्रोपेन है, संतृप्त।"],
      ["C₃H₄", "C₃H₄", "That's propyne.", "वह प्रोपाइन है।"],
    ],
  },
  "c2-alkyne": {
    prompt: ["What is the formula of ethyne?", "एथाइन का सूत्र क्या है?"],
    right: ["C₂H₂", "C₂H₂"],
    wrong: [
      ["C₂H₄", "C₂H₄", "That's ethene.", "वह एथीन है।"],
      ["C₂H₆", "C₂H₆", "That's ethane.", "वह एथेन है।"],
    ],
  },
  "c4-alkyne": {
    prompt: ["What is the formula of butyne?", "ब्यूटाइन का सूत्र क्या है?"],
    right: ["C₄H₆", "C₄H₆"],
    wrong: [
      ["C₄H₈", "C₄H₈", "That's butene.", "वह ब्यूटीन है।"],
      ["C₄H₁₀", "C₄H₁₀", "That's butane.", "वह ब्यूटेन है।"],
    ],
  },
});
