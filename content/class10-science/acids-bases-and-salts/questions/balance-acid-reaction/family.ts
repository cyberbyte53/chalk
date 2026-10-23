import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { type Species, balanceGoal, sp } from "../../kit";

type Reaction = { words: { en: string; hi: string }; left: Species[]; right: Species[] };

const REACTIONS = {
  zincSulphuric: {
    words: {
      en: "Zinc + Sulphuric acid → Zinc sulphate + Hydrogen",
      hi: "जिंक + सल्फ़्यूरिक अम्ल → जिंक सल्फ़ेट + हाइड्रोजन",
    },
    left: [sp("Zn"), sp("H2SO4")],
    right: [sp("ZnSO4"), sp("H2")],
  },
  magnesiumHydrochloric: {
    words: {
      en: "Magnesium + Hydrochloric acid → Magnesium chloride + Hydrogen",
      hi: "मैग्नीशियम + हाइड्रोक्लोरिक अम्ल → मैग्नीशियम क्लोराइड + हाइड्रोजन",
    },
    left: [sp("Mg"), sp("HCl")],
    right: [sp("MgCl2"), sp("H2")],
  },
  aluminiumSulphuric: {
    words: {
      en: "Aluminium + Sulphuric acid → Aluminium sulphate + Hydrogen",
      hi: "ऐलुमिनियम + सल्फ़्यूरिक अम्ल → ऐलुमिनियम सल्फ़ेट + हाइड्रोजन",
    },
    left: [sp("Al"), sp("H2SO4")],
    right: [sp("Al2(SO4)3"), sp("H2")],
  },
  ironHydrochloric: {
    words: {
      en: "Iron + Hydrochloric acid → Iron(II) chloride + Hydrogen",
      hi: "आयरन + हाइड्रोक्लोरिक अम्ल → आयरन(II) क्लोराइड + हाइड्रोजन",
    },
    left: [sp("Fe"), sp("HCl")],
    right: [sp("FeCl2"), sp("H2")],
  },
  sodiumCarbonate: {
    words: {
      en: "Sodium carbonate + Hydrochloric acid → Sodium chloride + Water + Carbon dioxide",
      hi: "सोडियम कार्बोनेट + हाइड्रोक्लोरिक अम्ल → सोडियम क्लोराइड + जल + कार्बन डाइऑक्साइड",
    },
    left: [sp("Na2CO3"), sp("HCl")],
    right: [sp("NaCl"), sp("H2O"), sp("CO2")],
  },
  calciumCarbonate: {
    words: {
      en: "Calcium carbonate + Hydrochloric acid → Calcium chloride + Water + Carbon dioxide",
      hi: "कैल्सियम कार्बोनेट + हाइड्रोक्लोरिक अम्ल → कैल्सियम क्लोराइड + जल + कार्बन डाइऑक्साइड",
    },
    left: [sp("CaCO3"), sp("HCl")],
    right: [sp("CaCl2"), sp("H2O"), sp("CO2")],
  },
  copperOxide: {
    words: {
      en: "Copper oxide + Hydrochloric acid → Copper(II) chloride + Water",
      hi: "कॉपर ऑक्साइड + हाइड्रोक्लोरिक अम्ल → कॉपर(II) क्लोराइड + जल",
    },
    left: [sp("CuO"), sp("HCl")],
    right: [sp("CuCl2"), sp("H2O")],
  },
  limeAcid: {
    words: {
      en: "Calcium hydroxide + Hydrochloric acid → Calcium chloride + Water",
      hi: "कैल्सियम हाइड्रॉक्साइड + हाइड्रोक्लोरिक अम्ल → कैल्सियम क्लोराइड + जल",
    },
    left: [sp("Ca(OH)2"), sp("HCl")],
    right: [sp("CaCl2"), sp("H2O")],
  },
  zincBase: {
    words: {
      en: "Sodium hydroxide + Zinc → Sodium zincate + Hydrogen",
      hi: "सोडियम हाइड्रॉक्साइड + जिंक → सोडियम ज़िंकेट + हाइड्रोजन",
    },
    left: [sp("NaOH"), sp("Zn")],
    right: [sp("Na2ZnO2"), sp("H2")],
  },
  chlorAlkali: {
    words: {
      en: "Sodium chloride + Water → Sodium hydroxide + Chlorine + Hydrogen",
      hi: "सोडियम क्लोराइड + जल → सोडियम हाइड्रॉक्साइड + क्लोरीन + हाइड्रोजन",
    },
    left: [sp("NaCl"), sp("H2O")],
    right: [sp("NaOH"), sp("Cl2"), sp("H2")],
  },
  bakingSodaHeat: {
    words: {
      en: "Sodium hydrogencarbonate → Sodium carbonate + Water + Carbon dioxide (on heating)",
      hi: "सोडियम हाइड्रोजनकार्बोनेट → सोडियम कार्बोनेट + जल + कार्बन डाइऑक्साइड (गर्म करने पर)",
    },
    left: [sp("NaHCO3")],
    right: [sp("Na2CO3"), sp("H2O"), sp("CO2")],
  },
} satisfies Record<string, Reaction>;

type Key = keyof typeof REACTIONS;
const KEYS = Object.keys(REACTIONS) as [Key, ...Key[]];

/** Balance one of the chapter's equations with the coefficient steppers (NCERT Exercise 5 and the text). */
export const balanceAcidReaction = family({
  level: Level.Medium,
  tests: [Concept.AcidsWithMetals, Concept.Neutralisation, Concept.ChemicalsFromCommonSalt],
  params: z.object({ reaction: z.enum(KEYS) }).strict(),
  build: ({ reaction }, b) => {
    const r = REACTIONS[reaction];
    const { eq, goal } = balanceGoal(
      b,
      "eq",
      r.left,
      r.right,
      t(`Balance: ${r.words.en}.`, `संतुलित करो: ${r.words.hi}।`),
    );
    return column([eq, goal, space()]);
  },
});
