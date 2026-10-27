/**
 * The equations of NCERT Class 10, Chapter 1, ready to drop into an equation balancer: each with
 * its formulae, the states of matter the book gives, any condition written on the arrow, and its
 * name in words.
 */

/** A state of matter, written after a formula: (s), (l), (g), (aq). */
export const PhysicalState = { Solid: "s", Liquid: "l", Gas: "g", Aqueous: "aq" } as const;
export type PhysicalState = (typeof PhysicalState)[keyof typeof PhysicalState];

/** What is written on the arrow, when the reaction needs it. */
export const ArrowCondition = {
  None: "none",
  Heat: "heat",
  Sunlight: "sunlight",
  Electricity: "electricity",
  SunlightChlorophyll: "sunlightChlorophyll",
  Pressure: "pressure",
} as const;
export type ArrowCondition = (typeof ArrowCondition)[keyof typeof ArrowCondition];

export const CONDITION_WORDS: Record<ArrowCondition, { en: string; hi: string }> = {
  [ArrowCondition.None]: { en: "", hi: "" },
  [ArrowCondition.Heat]: { en: "Heat", hi: "ऊष्मा" },
  [ArrowCondition.Sunlight]: { en: "Sunlight", hi: "सूर्य का प्रकाश" },
  [ArrowCondition.Electricity]: { en: "Electricity", hi: "विद्युत" },
  [ArrowCondition.SunlightChlorophyll]: {
    en: "Sunlight, chlorophyll",
    hi: "सूर्य का प्रकाश, क्लोरोफ़िल",
  },
  [ArrowCondition.Pressure]: { en: "340 atm", hi: "340 atm" },
};

export type Species = { formula: string; state?: PhysicalState };

export type Equation = {
  /** In words, as the book writes it. */
  words: { en: string; hi: string };
  left: readonly Species[];
  right: readonly Species[];
  condition?: ArrowCondition;
};

const s = PhysicalState.Solid;
const l = PhysicalState.Liquid;
const g = PhysicalState.Gas;
const aq = PhysicalState.Aqueous;
const sp = (formula: string, state?: PhysicalState): Species =>
  state === undefined ? { formula } : { formula, state };

/** Every equation of the chapter (text and exercises), by a short name. */
export const EQUATIONS = {
  magnesiumBurns: {
    words: {
      en: "Magnesium + Oxygen → Magnesium oxide",
      hi: "मैग्नीशियम + ऑक्सीजन → मैग्नीशियम ऑक्साइड",
    },
    left: [sp("Mg", s), sp("O2", g)],
    right: [sp("MgO", s)],
  },
  zincSulphuricAcid: {
    words: {
      en: "Zinc + Sulphuric acid → Zinc sulphate + Hydrogen",
      hi: "जिंक + सल्फ़्यूरिक अम्ल → जिंक सल्फ़ेट + हाइड्रोजन",
    },
    left: [sp("Zn", s), sp("H2SO4", aq)],
    right: [sp("ZnSO4", aq), sp("H2", g)],
  },
  ironSteam: {
    words: {
      en: "Iron + Water (steam) → Iron oxide + Hydrogen",
      hi: "लोहा + जल (भाप) → आयरन ऑक्साइड + हाइड्रोजन",
    },
    left: [sp("Fe", s), sp("H2O", g)],
    right: [sp("Fe3O4", s), sp("H2", g)],
  },
  hydrogenChlorine: {
    words: {
      en: "Hydrogen + Chlorine → Hydrogen chloride",
      hi: "हाइड्रोजन + क्लोरीन → हाइड्रोजन क्लोराइड",
    },
    left: [sp("H2", g), sp("Cl2", g)],
    right: [sp("HCl", g)],
  },
  bariumChlorideAluminiumSulphate: {
    words: {
      en: "Barium chloride + Aluminium sulphate → Barium sulphate + Aluminium chloride",
      hi: "बेरियम क्लोराइड + ऐलुमिनियम सल्फ़ेट → बेरियम सल्फ़ेट + ऐलुमिनियम क्लोराइड",
    },
    left: [sp("BaCl2", aq), sp("Al2(SO4)3", aq)],
    right: [sp("BaSO4", s), sp("AlCl3", aq)],
  },
  sodiumWater: {
    words: {
      en: "Sodium + Water → Sodium hydroxide + Hydrogen",
      hi: "सोडियम + जल → सोडियम हाइड्रॉक्साइड + हाइड्रोजन",
    },
    left: [sp("Na", s), sp("H2O", l)],
    right: [sp("NaOH", aq), sp("H2", g)],
  },
  bariumChlorideSodiumSulphate: {
    words: {
      en: "Barium chloride + Sodium sulphate → Barium sulphate + Sodium chloride",
      hi: "बेरियम क्लोराइड + सोडियम सल्फ़ेट → बेरियम सल्फ़ेट + सोडियम क्लोराइड",
    },
    left: [sp("BaCl2", aq), sp("Na2SO4", aq)],
    right: [sp("BaSO4", s), sp("NaCl", aq)],
  },
  sodiumHydroxideHydrochloricAcid: {
    words: {
      en: "Sodium hydroxide + Hydrochloric acid → Sodium chloride + Water",
      hi: "सोडियम हाइड्रॉक्साइड + हाइड्रोक्लोरिक अम्ल → सोडियम क्लोराइड + जल",
    },
    left: [sp("NaOH", aq), sp("HCl", aq)],
    right: [sp("NaCl", aq), sp("H2O", l)],
  },
  quickLimeWater: {
    words: {
      en: "Calcium oxide + Water → Calcium hydroxide",
      hi: "कैल्शियम ऑक्साइड + जल → कैल्शियम हाइड्रॉक्साइड",
    },
    left: [sp("CaO", s), sp("H2O", l)],
    right: [sp("Ca(OH)2", aq)],
  },
  whitewashSets: {
    words: {
      en: "Calcium hydroxide + Carbon dioxide → Calcium carbonate + Water",
      hi: "कैल्शियम हाइड्रॉक्साइड + कार्बन डाइऑक्साइड → कैल्शियम कार्बोनेट + जल",
    },
    left: [sp("Ca(OH)2", aq), sp("CO2", g)],
    right: [sp("CaCO3", s), sp("H2O", l)],
  },
  coalBurns: {
    words: { en: "Carbon + Oxygen → Carbon dioxide", hi: "कार्बन + ऑक्सीजन → कार्बन डाइऑक्साइड" },
    left: [sp("C", s), sp("O2", g)],
    right: [sp("CO2", g)],
  },
  waterFormation: {
    words: { en: "Hydrogen + Oxygen → Water", hi: "हाइड्रोजन + ऑक्सीजन → जल" },
    left: [sp("H2", g), sp("O2", g)],
    right: [sp("H2O", l)],
  },
  methaneBurns: {
    words: {
      en: "Methane + Oxygen → Carbon dioxide + Water",
      hi: "मीथेन + ऑक्सीजन → कार्बन डाइऑक्साइड + जल",
    },
    left: [sp("CH4", g), sp("O2", g)],
    right: [sp("CO2", g), sp("H2O", g)],
  },
  respiration: {
    words: {
      en: "Glucose + Oxygen → Carbon dioxide + Water + energy",
      hi: "ग्लूकोज़ + ऑक्सीजन → कार्बन डाइऑक्साइड + जल + ऊर्जा",
    },
    left: [sp("C6H12O6", aq), sp("O2", aq)],
    right: [sp("CO2", aq), sp("H2O", l)],
  },
  ferrousSulphateHeat: {
    words: {
      en: "Ferrous sulphate → Ferric oxide + Sulphur dioxide + Sulphur trioxide",
      hi: "फ़ेरस सल्फ़ेट → फ़ेरिक ऑक्साइड + सल्फ़र डाइऑक्साइड + सल्फ़र ट्राइऑक्साइड",
    },
    left: [sp("FeSO4", s)],
    right: [sp("Fe2O3", s), sp("SO2", g), sp("SO3", g)],
    condition: ArrowCondition.Heat,
  },
  limestoneHeat: {
    words: {
      en: "Calcium carbonate → Calcium oxide + Carbon dioxide",
      hi: "कैल्शियम कार्बोनेट → कैल्शियम ऑक्साइड + कार्बन डाइऑक्साइड",
    },
    left: [sp("CaCO3", s)],
    right: [sp("CaO", s), sp("CO2", g)],
    condition: ArrowCondition.Heat,
  },
  leadNitrateHeat: {
    words: {
      en: "Lead nitrate → Lead oxide + Nitrogen dioxide + Oxygen",
      hi: "लेड नाइट्रेट → लेड ऑक्साइड + नाइट्रोजन डाइऑक्साइड + ऑक्सीजन",
    },
    left: [sp("Pb(NO3)2", s)],
    right: [sp("PbO", s), sp("NO2", g), sp("O2", g)],
    condition: ArrowCondition.Heat,
  },
  electrolysisOfWater: {
    words: { en: "Water → Hydrogen + Oxygen", hi: "जल → हाइड्रोजन + ऑक्सीजन" },
    left: [sp("H2O", l)],
    right: [sp("H2", g), sp("O2", g)],
    condition: ArrowCondition.Electricity,
  },
  silverChlorideLight: {
    words: { en: "Silver chloride → Silver + Chlorine", hi: "सिल्वर क्लोराइड → सिल्वर + क्लोरीन" },
    left: [sp("AgCl", s)],
    right: [sp("Ag", s), sp("Cl2", g)],
    condition: ArrowCondition.Sunlight,
  },
  silverBromideLight: {
    words: { en: "Silver bromide → Silver + Bromine", hi: "सिल्वर ब्रोमाइड → सिल्वर + ब्रोमीन" },
    left: [sp("AgBr", s)],
    right: [sp("Ag", s), sp("Br2", g)],
    condition: ArrowCondition.Sunlight,
  },
  ironCopperSulphate: {
    words: {
      en: "Iron + Copper sulphate → Iron sulphate + Copper",
      hi: "लोहा + कॉपर सल्फ़ेट → आयरन सल्फ़ेट + कॉपर",
    },
    left: [sp("Fe", s), sp("CuSO4", aq)],
    right: [sp("FeSO4", aq), sp("Cu", s)],
  },
  zincCopperSulphate: {
    words: {
      en: "Zinc + Copper sulphate → Zinc sulphate + Copper",
      hi: "जिंक + कॉपर सल्फ़ेट → जिंक सल्फ़ेट + कॉपर",
    },
    left: [sp("Zn", s), sp("CuSO4", aq)],
    right: [sp("ZnSO4", aq), sp("Cu", s)],
  },
  leadCopperChloride: {
    words: {
      en: "Lead + Copper chloride → Lead chloride + Copper",
      hi: "लेड + कॉपर क्लोराइड → लेड क्लोराइड + कॉपर",
    },
    left: [sp("Pb", s), sp("CuCl2", aq)],
    right: [sp("PbCl2", aq), sp("Cu", s)],
  },
  sodiumSulphateBariumChloride: {
    words: {
      en: "Sodium sulphate + Barium chloride → Barium sulphate + Sodium chloride",
      hi: "सोडियम सल्फ़ेट + बेरियम क्लोराइड → बेरियम सल्फ़ेट + सोडियम क्लोराइड",
    },
    left: [sp("Na2SO4", aq), sp("BaCl2", aq)],
    right: [sp("BaSO4", s), sp("NaCl", aq)],
  },
  leadNitratePotassiumIodide: {
    words: {
      en: "Lead nitrate + Potassium iodide → Lead iodide + Potassium nitrate",
      hi: "लेड नाइट्रेट + पोटैशियम आयोडाइड → लेड आयोडाइड + पोटैशियम नाइट्रेट",
    },
    left: [sp("Pb(NO3)2", aq), sp("KI", aq)],
    right: [sp("PbI2", s), sp("KNO3", aq)],
  },
  copperHeated: {
    words: { en: "Copper + Oxygen → Copper(II) oxide", hi: "कॉपर + ऑक्सीजन → कॉपर(II) ऑक्साइड" },
    left: [sp("Cu", s), sp("O2", g)],
    right: [sp("CuO", s)],
    condition: ArrowCondition.Heat,
  },
  copperOxideHydrogen: {
    words: {
      en: "Copper(II) oxide + Hydrogen → Copper + Water",
      hi: "कॉपर(II) ऑक्साइड + हाइड्रोजन → कॉपर + जल",
    },
    left: [sp("CuO", s), sp("H2", g)],
    right: [sp("Cu", s), sp("H2O", l)],
    condition: ArrowCondition.Heat,
  },
  zincOxideCarbon: {
    words: {
      en: "Zinc oxide + Carbon → Zinc + Carbon monoxide",
      hi: "जिंक ऑक्साइड + कार्बन → जिंक + कार्बन मोनोऑक्साइड",
    },
    left: [sp("ZnO", s), sp("C", s)],
    right: [sp("Zn", s), sp("CO", g)],
  },
  manganeseDioxideHydrochloricAcid: {
    words: {
      en: "Manganese dioxide + Hydrochloric acid → Manganese chloride + Water + Chlorine",
      hi: "मैंगनीज़ डाइऑक्साइड + हाइड्रोक्लोरिक अम्ल → मैंगनीज़ क्लोराइड + जल + क्लोरीन",
    },
    left: [sp("MnO2", s), sp("HCl", aq)],
    right: [sp("MnCl2", aq), sp("H2O", l), sp("Cl2", g)],
  },
  sodiumBurns: {
    words: { en: "Sodium + Oxygen → Sodium oxide", hi: "सोडियम + ऑक्सीजन → सोडियम ऑक्साइड" },
    left: [sp("Na", s), sp("O2", g)],
    right: [sp("Na2O", s)],
  },
  leadOxideCarbon: {
    words: {
      en: "Lead oxide + Carbon → Lead + Carbon dioxide",
      hi: "लेड ऑक्साइड + कार्बन → लेड + कार्बन डाइऑक्साइड",
    },
    left: [sp("PbO", s), sp("C", s)],
    right: [sp("Pb", s), sp("CO2", g)],
  },
  thermite: {
    words: {
      en: "Iron oxide + Aluminium → Aluminium oxide + Iron",
      hi: "आयरन ऑक्साइड + ऐलुमिनियम → ऐलुमिनियम ऑक्साइड + लोहा",
    },
    left: [sp("Fe2O3", s), sp("Al", s)],
    right: [sp("Al2O3", s), sp("Fe", s)],
  },
  ironHydrochloricAcid: {
    words: {
      en: "Iron + Hydrochloric acid → Iron chloride + Hydrogen",
      hi: "लोहा + हाइड्रोक्लोरिक अम्ल → आयरन क्लोराइड + हाइड्रोजन",
    },
    left: [sp("Fe", s), sp("HCl", aq)],
    right: [sp("FeCl2", aq), sp("H2", g)],
  },
  ammonia: {
    words: { en: "Hydrogen + Nitrogen → Ammonia", hi: "हाइड्रोजन + नाइट्रोजन → अमोनिया" },
    left: [sp("H2", g), sp("N2", g)],
    right: [sp("NH3", g)],
  },
  hydrogenSulphideBurns: {
    words: {
      en: "Hydrogen sulphide + Oxygen → Water + Sulphur dioxide",
      hi: "हाइड्रोजन सल्फ़ाइड + ऑक्सीजन → जल + सल्फ़र डाइऑक्साइड",
    },
    left: [sp("H2S", g), sp("O2", g)],
    right: [sp("H2O", l), sp("SO2", g)],
  },
  potassiumWater: {
    words: {
      en: "Potassium + Water → Potassium hydroxide + Hydrogen",
      hi: "पोटैशियम + जल → पोटैशियम हाइड्रॉक्साइड + हाइड्रोजन",
    },
    left: [sp("K", s), sp("H2O", l)],
    right: [sp("KOH", aq), sp("H2", g)],
  },
  nitricAcidSlakedLime: {
    words: {
      en: "Nitric acid + Calcium hydroxide → Calcium nitrate + Water",
      hi: "नाइट्रिक अम्ल + कैल्शियम हाइड्रॉक्साइड → कैल्शियम नाइट्रेट + जल",
    },
    left: [sp("HNO3", aq), sp("Ca(OH)2", aq)],
    right: [sp("Ca(NO3)2", aq), sp("H2O", l)],
  },
  sodiumHydroxideSulphuricAcid: {
    words: {
      en: "Sodium hydroxide + Sulphuric acid → Sodium sulphate + Water",
      hi: "सोडियम हाइड्रॉक्साइड + सल्फ़्यूरिक अम्ल → सोडियम सल्फ़ेट + जल",
    },
    left: [sp("NaOH", aq), sp("H2SO4", aq)],
    right: [sp("Na2SO4", aq), sp("H2O", l)],
  },
  sodiumChlorideSilverNitrate: {
    words: {
      en: "Sodium chloride + Silver nitrate → Silver chloride + Sodium nitrate",
      hi: "सोडियम क्लोराइड + सिल्वर नाइट्रेट → सिल्वर क्लोराइड + सोडियम नाइट्रेट",
    },
    left: [sp("NaCl", aq), sp("AgNO3", aq)],
    right: [sp("AgCl", s), sp("NaNO3", aq)],
  },
  bariumChlorideSulphuricAcid: {
    words: {
      en: "Barium chloride + Sulphuric acid → Barium sulphate + Hydrochloric acid",
      hi: "बेरियम क्लोराइड + सल्फ़्यूरिक अम्ल → बेरियम सल्फ़ेट + हाइड्रोक्लोरिक अम्ल",
    },
    left: [sp("BaCl2", aq), sp("H2SO4", aq)],
    right: [sp("BaSO4", s), sp("HCl", aq)],
  },
  zincSilverNitrate: {
    words: {
      en: "Zinc + Silver nitrate → Zinc nitrate + Silver",
      hi: "जिंक + सिल्वर नाइट्रेट → जिंक नाइट्रेट + सिल्वर",
    },
    left: [sp("Zn", s), sp("AgNO3", aq)],
    right: [sp("Zn(NO3)2", aq), sp("Ag", s)],
  },
  aluminiumCopperChloride: {
    words: {
      en: "Aluminium + Copper chloride → Aluminium chloride + Copper",
      hi: "ऐलुमिनियम + कॉपर क्लोराइड → ऐलुमिनियम क्लोराइड + कॉपर",
    },
    left: [sp("Al", s), sp("CuCl2", aq)],
    right: [sp("AlCl3", aq), sp("Cu", s)],
  },
  bariumChloridePotassiumSulphate: {
    words: {
      en: "Barium chloride + Potassium sulphate → Barium sulphate + Potassium chloride",
      hi: "बेरियम क्लोराइड + पोटैशियम सल्फ़ेट → बेरियम सल्फ़ेट + पोटैशियम क्लोराइड",
    },
    left: [sp("BaCl2", aq), sp("K2SO4", aq)],
    right: [sp("BaSO4", s), sp("KCl", aq)],
  },
  potassiumBromideBariumIodide: {
    words: {
      en: "Potassium bromide + Barium iodide → Potassium iodide + Barium bromide",
      hi: "पोटैशियम ब्रोमाइड + बेरियम आयोडाइड → पोटैशियम आयोडाइड + बेरियम ब्रोमाइड",
    },
    left: [sp("KBr", aq), sp("BaI2", aq)],
    right: [sp("KI", aq), sp("BaBr2", s)],
  },
  zincCarbonateHeat: {
    words: {
      en: "Zinc carbonate → Zinc oxide + Carbon dioxide",
      hi: "जिंक कार्बोनेट → जिंक ऑक्साइड + कार्बन डाइऑक्साइड",
    },
    left: [sp("ZnCO3", s)],
    right: [sp("ZnO", s), sp("CO2", g)],
    condition: ArrowCondition.Heat,
  },
  magnesiumHydrochloricAcid: {
    words: {
      en: "Magnesium + Hydrochloric acid → Magnesium chloride + Hydrogen",
      hi: "मैग्नीशियम + हाइड्रोक्लोरिक अम्ल → मैग्नीशियम क्लोराइड + हाइड्रोजन",
    },
    left: [sp("Mg", s), sp("HCl", aq)],
    right: [sp("MgCl2", aq), sp("H2", g)],
  },
  copperSilverNitrate: {
    words: {
      en: "Copper + Silver nitrate → Copper nitrate + Silver",
      hi: "कॉपर + सिल्वर नाइट्रेट → कॉपर नाइट्रेट + सिल्वर",
    },
    left: [sp("Cu", s), sp("AgNO3", aq)],
    right: [sp("Cu(NO3)2", aq), sp("Ag", s)],
  },
  photosynthesis: {
    words: {
      en: "Carbon dioxide + Water → Glucose + Oxygen + Water",
      hi: "कार्बन डाइऑक्साइड + जल → ग्लूकोज़ + ऑक्सीजन + जल",
    },
    left: [sp("CO2", aq), sp("H2O", l)],
    right: [sp("C6H12O6", aq), sp("O2", aq), sp("H2O", l)],
    condition: ArrowCondition.SunlightChlorophyll,
  },
  methanol: {
    words: {
      en: "Carbon monoxide + Hydrogen → Methanol",
      hi: "कार्बन मोनोऑक्साइड + हाइड्रोजन → मेथेनॉल",
    },
    left: [sp("CO", g), sp("H2", g)],
    right: [sp("CH3OH", l)],
    condition: ArrowCondition.Pressure,
  },
} as const satisfies Record<string, Equation>;

export type EquationName = keyof typeof EQUATIONS;
export const EQUATION_NAMES = Object.keys(EQUATIONS) as EquationName[];
