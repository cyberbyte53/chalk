import { Concept } from "../../concepts.gen";
import { factFamily } from "../../qkit";

/** Section 4.2.4: homologous series, CH₂ and 14 u, general formulae. */
export const homologousSeries = factFamily([Concept.FunctionalGroupsAndSeries], {
  mass: {
    prompt: [
      "Neighbours in a homologous series differ in mass by…",
      "समजातीय श्रेणी के पड़ोसियों के द्रव्यमान में अंतर है…",
    ],
    right: ["14 u", "14 u"],
    wrong: [
      ["12 u", "12 u", "Add 2 u for the two hydrogens of CH₂.", "CH₂ के दो हाइड्रोजनों के 2 u जोड़ो।"],
      ["16 u", "16 u", "The step is CH₂ = 12 + 2.", "क़दम CH₂ = 12 + 2 है।"],
    ],
  },
  step: {
    prompt: [
      "Neighbours in a homologous series differ by…",
      "समजातीय श्रेणी के पड़ोसी किससे अलग होते हैं?",
    ],
    right: ["One –CH₂– unit", "एक –CH₂– इकाई"],
    wrong: [
      [
        "One –OH group",
        "एक –OH समूह",
        "The functional group stays the same.",
        "प्रकार्यात्मक समूह वही रहता है।",
      ],
      ["One whole CH₄", "एक पूरा CH₄", "It's CH₂.", "यह CH₂ है।"],
    ],
  },
  "alkene-general": {
    prompt: ["Which is the general formula of alkenes?", "ऐल्कीन का सामान्य सूत्र कौन-सा है?"],
    right: ["CₙH₂ₙ", "CₙH₂ₙ"],
    wrong: [
      ["CₙH₂ₙ₊₂", "CₙH₂ₙ₊₂", "That's alkanes.", "वह ऐल्केन है।"],
      ["CₙH₂ₙ₋₂", "CₙH₂ₙ₋₂", "That's alkynes.", "वह ऐल्काइन है।"],
    ],
  },
  "same-series": {
    prompt: [
      "Which pair belongs to the same homologous series?",
      "कौन-सी जोड़ी एक ही समजातीय श्रेणी की है?",
    ],
    right: ["CH₃OH and C₂H₅OH", "CH₃OH और C₂H₅OH"],
    wrong: [
      [
        "CH₄ and C₂H₄",
        "CH₄ और C₂H₄",
        "One is an alkane, the other an alkene.",
        "एक ऐल्केन है, दूसरा ऐल्कीन।",
      ],
      [
        "C₂H₅OH and CH₃COOH",
        "C₂H₅OH और CH₃COOH",
        "Different functional groups.",
        "अलग प्रकार्यात्मक समूह।",
      ],
    ],
  },
  properties: {
    prompt: ["In a homologous series, what stays similar?", "समजातीय श्रेणी में क्या एक जैसा रहता है?"],
    right: ["Chemical properties", "रासायनिक गुण"],
    wrong: [
      [
        "Boiling point",
        "क्वथनांक",
        "Boiling points rise along the series.",
        "श्रेणी में आगे क्वथनांक बढ़ते हैं।",
      ],
      ["Molecular mass", "आण्विक द्रव्यमान", "It rises by 14 u each step.", "यह हर क़दम 14 u बढ़ता है।"],
    ],
  },
});
