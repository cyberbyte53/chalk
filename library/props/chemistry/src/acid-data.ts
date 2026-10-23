import type { Words } from "./words";

/**
 * The substances of the acids, bases and salts chapter, with their (approximate) pH, and how every
 * indicator in the chapter answers each one. One table so every prop agrees.
 */

export const Nature = { Acidic: "acidic", Basic: "basic", Neutral: "neutral" } as const;
export type Nature = (typeof Nature)[keyof typeof Nature];

export const SubstanceId = {
  // Table 2.1, the laboratory acids and bases.
  HydrochloricAcid: "hydrochloricAcid",
  SulphuricAcid: "sulphuricAcid",
  NitricAcid: "nitricAcid",
  AceticAcid: "aceticAcid",
  SodiumHydroxide: "sodiumHydroxide",
  CalciumHydroxide: "calciumHydroxide",
  PotassiumHydroxide: "potassiumHydroxide",
  MagnesiumHydroxide: "magnesiumHydroxide",
  AmmoniumHydroxide: "ammoniumHydroxide",
  // Table 2.2 and Fig 2.7.
  SalivaBeforeMeal: "salivaBeforeMeal",
  SalivaAfterMeal: "salivaAfterMeal",
  LemonJuice: "lemonJuice",
  AeratedDrink: "aeratedDrink",
  CarrotJuice: "carrotJuice",
  Coffee: "coffee",
  TomatoJuice: "tomatoJuice",
  TapWater: "tapWater",
  GastricJuice: "gastricJuice",
  Blood: "blood",
  MilkOfMagnesia: "milkOfMagnesia",
  // Around the house and the rest of the chapter.
  DistilledWater: "distilledWater",
  RainWater: "rainWater",
  Vinegar: "vinegar",
  Milk: "milk",
  Curd: "curd",
  SoapSolution: "soapSolution",
  Toothpaste: "toothpaste",
  BakingSodaSolution: "bakingSodaSolution",
  WashingSodaSolution: "washingSodaSolution",
  SaltWater: "saltWater",
  SugarSolution: "sugarSolution",
  GlucoseSolution: "glucoseSolution",
  Alcohol: "alcohol",
  LimeWater: "limeWater",
  SodaWater: "sodaWater",
} as const;
export type SubstanceId = (typeof SubstanceId)[keyof typeof SubstanceId];

export type Substance = {
  /** What it is called on screen. */
  name: Words;
  /** A formula when the book gives one (typeset by the view: digits become subscripts). */
  formula?: string;
  /** An approximate pH, as the book's tables and figures give it. */
  pH: number;
  /** Strong or weak (only for the laboratory acids and bases). */
  strength?: "strong" | "weak";
  /** A base that dissolves in water. */
  isAlkali?: boolean;
  /** Does its solution carry a current (Activity 2.8)? 0 none, 1 a little, 2 well. */
  conducts: 0 | 1 | 2;
};

const w = (en: string, hi: string): Words => ({ en, hi });

export const SUBSTANCES: Record<SubstanceId, Substance> = {
  hydrochloricAcid: {
    name: w("hydrochloric acid", "हाइड्रोक्लोरिक अम्ल"),
    formula: "HCl",
    pH: 1,
    strength: "strong",
    conducts: 2,
  },
  sulphuricAcid: {
    name: w("sulphuric acid", "सल्फ़्यूरिक अम्ल"),
    formula: "H2SO4",
    pH: 1,
    strength: "strong",
    conducts: 2,
  },
  nitricAcid: {
    name: w("nitric acid", "नाइट्रिक अम्ल"),
    formula: "HNO3",
    pH: 1,
    strength: "strong",
    conducts: 2,
  },
  aceticAcid: {
    name: w("acetic acid", "ऐसीटिक अम्ल"),
    formula: "CH3COOH",
    pH: 3,
    strength: "weak",
    conducts: 1,
  },
  sodiumHydroxide: {
    name: w("sodium hydroxide", "सोडियम हाइड्रॉक्साइड"),
    formula: "NaOH",
    pH: 13,
    strength: "strong",
    isAlkali: true,
    conducts: 2,
  },
  calciumHydroxide: {
    name: w("calcium hydroxide", "कैल्सियम हाइड्रॉक्साइड"),
    formula: "Ca(OH)2",
    pH: 12,
    strength: "strong",
    isAlkali: true,
    conducts: 2,
  },
  potassiumHydroxide: {
    name: w("potassium hydroxide", "पोटैशियम हाइड्रॉक्साइड"),
    formula: "KOH",
    pH: 13,
    strength: "strong",
    isAlkali: true,
    conducts: 2,
  },
  magnesiumHydroxide: {
    name: w("magnesium hydroxide", "मैग्नीशियम हाइड्रॉक्साइड"),
    formula: "Mg(OH)2",
    pH: 10,
    strength: "weak",
    conducts: 1,
  },
  ammoniumHydroxide: {
    name: w("ammonium hydroxide", "अमोनियम हाइड्रॉक्साइड"),
    formula: "NH4OH",
    pH: 11,
    strength: "weak",
    isAlkali: true,
    conducts: 1,
  },
  salivaBeforeMeal: { name: w("saliva (before a meal)", "लार (भोजन से पहले)"), pH: 7.4, conducts: 1 },
  salivaAfterMeal: { name: w("saliva (after a meal)", "लार (भोजन के बाद)"), pH: 5.8, conducts: 1 },
  lemonJuice: { name: w("lemon juice", "नींबू का रस"), pH: 2.2, conducts: 1 },
  aeratedDrink: { name: w("colourless fizzy drink", "रंगहीन सोडा पेय"), pH: 3, conducts: 1 },
  carrotJuice: { name: w("carrot juice", "गाजर का रस"), pH: 6, conducts: 1 },
  coffee: { name: w("coffee", "कॉफ़ी"), pH: 5, conducts: 1 },
  tomatoJuice: { name: w("tomato juice", "टमाटर का रस"), pH: 4.2, conducts: 1 },
  tapWater: { name: w("tap water", "नल का पानी"), pH: 7, conducts: 1 },
  gastricJuice: { name: w("gastric juice", "जठर रस"), pH: 1.2, conducts: 2 },
  blood: { name: w("blood", "रक्त"), pH: 7.4, conducts: 2 },
  milkOfMagnesia: {
    name: w("milk of magnesia", "मिल्क ऑफ़ मैग्नीशिया"),
    formula: "Mg(OH)2",
    pH: 10,
    conducts: 1,
  },
  distilledWater: { name: w("distilled water", "आसुत जल"), pH: 7, conducts: 0 },
  rainWater: { name: w("rain water", "वर्षा का जल"), pH: 5.6, conducts: 1 },
  vinegar: { name: w("vinegar", "सिरका"), pH: 3, conducts: 1 },
  milk: { name: w("fresh milk", "ताज़ा दूध"), pH: 6, conducts: 1 },
  curd: { name: w("curd", "दही"), pH: 4.5, conducts: 1 },
  soapSolution: { name: w("soap solution", "साबुन का घोल"), pH: 10, conducts: 1 },
  toothpaste: { name: w("toothpaste", "टूथपेस्ट"), pH: 9, conducts: 1 },
  bakingSodaSolution: {
    name: w("baking soda solution", "खाने के सोडे का घोल"),
    formula: "NaHCO3",
    pH: 8.3,
    conducts: 2,
  },
  washingSodaSolution: {
    name: w("washing soda solution", "धोने के सोडे का घोल"),
    formula: "Na2CO3",
    pH: 11,
    conducts: 2,
  },
  saltWater: { name: w("salt water", "नमक का पानी"), formula: "NaCl", pH: 7, conducts: 2 },
  sugarSolution: { name: w("sugar solution", "चीनी का घोल"), pH: 7, conducts: 0 },
  glucoseSolution: {
    name: w("glucose solution", "ग्लूकोज़ का घोल"),
    formula: "C6H12O6",
    pH: 7,
    conducts: 0,
  },
  alcohol: { name: w("alcohol solution", "ऐल्कोहॉल का घोल"), pH: 7, conducts: 0 },
  limeWater: { name: w("lime water", "चूने का पानी"), formula: "Ca(OH)2", pH: 12.4, conducts: 2 },
  sodaWater: { name: w("soda water", "सोडा वाटर"), pH: 4, conducts: 1 },
};

/** Acidic below 7, basic above, neutral at 7 (the book treats 7 exactly as neutral). */
export function natureOfPh(pH: number): Nature {
  if (pH < 6.95) return Nature.Acidic;
  if (pH > 7.05) return Nature.Basic;
  return Nature.Neutral;
}

export const natureOf = (id: SubstanceId): Nature => natureOfPh(SUBSTANCES[id].pH);

/** Fig 2.6's words: strongly or weakly acidic or basic, or neutral. */
export function strengthOfPh(pH: number): Words {
  const n = natureOfPh(pH);
  if (n === Nature.Neutral) return w("neutral", "उदासीन");
  if (n === Nature.Acidic)
    return pH <= 3 ? w("strongly acidic", "प्रबल अम्लीय") : w("weakly acidic", "दुर्बल अम्लीय");
  return pH >= 11 ? w("strongly basic", "प्रबल क्षारीय") : w("weakly basic", "दुर्बल क्षारीय");
}

export const NATURE_WORDS: Record<Nature, Words> = {
  acidic: w("acidic", "अम्लीय"),
  basic: w("basic", "क्षारीय"),
  neutral: w("neutral", "उदासीन"),
};

/** The colours the chapter's indicators show. Each has a CSS class `ab-hue-<hue>`. */
export const Hue = {
  Red: "red",
  Pink: "pink",
  Orange: "orange",
  Yellow: "yellow",
  Green: "green",
  Blue: "blue",
  Purple: "purple",
  ReddishBrown: "reddishBrown",
  Colourless: "colourless",
} as const;
export type Hue = (typeof Hue)[keyof typeof Hue];

export const HUE_WORDS: Record<Hue, Words> = {
  red: w("red", "लाल"),
  pink: w("pink", "गुलाबी"),
  orange: w("orange", "नारंगी"),
  yellow: w("yellow", "पीला"),
  green: w("green", "हरा"),
  blue: w("blue", "नीला"),
  purple: w("purple", "बैंगनी"),
  reddishBrown: w("reddish brown", "लाल-भूरा"),
  colourless: w("colourless", "रंगहीन"),
};

export const IndicatorId = {
  RedLitmus: "redLitmus",
  BlueLitmus: "blueLitmus",
  LitmusSolution: "litmusSolution",
  Phenolphthalein: "phenolphthalein",
  MethylOrange: "methylOrange",
  Turmeric: "turmeric",
  RedCabbage: "redCabbage",
  Universal: "universal",
  Onion: "onion",
  Vanilla: "vanilla",
  Clove: "clove",
} as const;
export type IndicatorId = (typeof IndicatorId)[keyof typeof IndicatorId];

export type Indicator = {
  name: Words;
  /** Paper strip, a solution dropped in, or a smell (an olfactory indicator). */
  form: "paper" | "solution" | "smell";
  /** Natural (from a plant or lichen) or synthetic (made in a factory). */
  origin: "natural" | "synthetic";
  /** Its colour before it meets anything. */
  own: Hue;
};

export const INDICATORS: Record<IndicatorId, Indicator> = {
  redLitmus: { name: w("red litmus", "लाल लिटमस"), form: "paper", origin: "natural", own: "red" },
  blueLitmus: {
    name: w("blue litmus", "नीला लिटमस"),
    form: "paper",
    origin: "natural",
    own: "blue",
  },
  litmusSolution: {
    name: w("litmus solution", "लिटमस विलयन"),
    form: "solution",
    origin: "natural",
    own: "purple",
  },
  phenolphthalein: {
    name: w("phenolphthalein", "फ़ीनॉल्फ़्थेलिन"),
    form: "solution",
    origin: "synthetic",
    own: "colourless",
  },
  methylOrange: {
    name: w("methyl orange", "मेथिल ऑरेंज"),
    form: "solution",
    origin: "synthetic",
    own: "orange",
  },
  turmeric: { name: w("turmeric", "हल्दी"), form: "paper", origin: "natural", own: "yellow" },
  redCabbage: {
    name: w("red cabbage juice", "लाल पत्तागोभी का रस"),
    form: "solution",
    origin: "natural",
    own: "purple",
  },
  universal: {
    name: w("universal indicator", "सार्वत्रिक सूचक"),
    form: "paper",
    origin: "synthetic",
    own: "green",
  },
  onion: {
    name: w("onion cloth", "प्याज़ वाला कपड़ा"),
    form: "smell",
    origin: "natural",
    own: "colourless",
  },
  vanilla: {
    name: w("vanilla essence", "वनीला एसेंस"),
    form: "smell",
    origin: "natural",
    own: "colourless",
  },
  clove: { name: w("clove oil", "लौंग का तेल"), form: "smell", origin: "natural", own: "colourless" },
};

/** What an indicator shows in a solution of this pH: a hue (and, for universal, the pH band). */
export type Response =
  | { kind: "colour"; hue: Hue; changed: boolean }
  | { kind: "universal"; band: number }
  | { kind: "smell"; isSmelt: boolean };

/** The universal indicator's band (0–14) for a pH. */
export const universalBand = (pH: number): number => Math.max(0, Math.min(14, Math.round(pH)));

export function responseOf(indicator: IndicatorId, pH: number): Response {
  const n = natureOfPh(pH);
  const colour = (hue: Hue): Response => ({
    kind: "colour",
    hue,
    changed: hue !== INDICATORS[indicator].own,
  });
  switch (indicator) {
    case IndicatorId.RedLitmus:
      return colour(n === Nature.Basic ? Hue.Blue : Hue.Red);
    case IndicatorId.BlueLitmus:
      return colour(n === Nature.Acidic ? Hue.Red : Hue.Blue);
    case IndicatorId.LitmusSolution:
      return colour(n === Nature.Acidic ? Hue.Red : n === Nature.Basic ? Hue.Blue : Hue.Purple);
    // Phenolphthalein turns pink only from about pH 8.2 up.
    case IndicatorId.Phenolphthalein:
      return colour(pH >= 8.2 ? Hue.Pink : Hue.Colourless);
    // Methyl orange: red below about 3.1, orange to 4.4, yellow above.
    case IndicatorId.MethylOrange:
      return colour(pH < 3.1 ? Hue.Red : pH <= 4.4 ? Hue.Orange : Hue.Yellow);
    // Turmeric turns reddish brown in a base (the curry stain and soap).
    case IndicatorId.Turmeric:
      return colour(pH >= 8 ? Hue.ReddishBrown : Hue.Yellow);
    case IndicatorId.RedCabbage:
      return colour(
        pH < 3.5
          ? Hue.Red
          : pH < 6.5
            ? Hue.Pink
            : pH <= 7.5
              ? Hue.Purple
              : pH < 9
                ? Hue.Blue
                : pH < 12
                  ? Hue.Green
                  : Hue.Yellow,
      );
    case IndicatorId.Universal:
      return { kind: "universal", band: universalBand(pH) };
    // Olfactory indicators: the smell is lost in a base and stays in an acid (or water).
    case IndicatorId.Onion:
    case IndicatorId.Vanilla:
    case IndicatorId.Clove:
      return { kind: "smell", isSmelt: n !== Nature.Basic };
  }
}

/** A response in words: "turns blue", "stays red", "smell stays", "pH 7, green". */
export function responseWords(indicator: IndicatorId, pH: number): Words {
  const r = responseOf(indicator, pH);
  if (r.kind === "smell")
    return r.isSmelt ? w("smell stays", "गंध बनी रहती है") : w("smell is gone", "गंध चली जाती है");
  if (r.kind === "universal") {
    const hue = UNIVERSAL_HUES[r.band] ?? Hue.Green;
    return w(`${HUE_WORDS[hue].en} (pH ${r.band})`, `${HUE_WORDS[hue].hi} (pH ${r.band})`);
  }
  const h = HUE_WORDS[r.hue];
  return r.changed
    ? w(`turns ${h.en}`, `${h.hi} हो जाता है`)
    : w(`stays ${h.en}`, `${h.hi} ही रहता है`);
}

/** The universal indicator's colour word for each pH 0–14 (Fig 2.6, roughly). */
export const UNIVERSAL_HUES: readonly Hue[] = [
  Hue.Red,
  Hue.Red,
  Hue.Red,
  Hue.Orange,
  Hue.Orange,
  Hue.Yellow,
  Hue.Yellow,
  Hue.Green,
  Hue.Green,
  Hue.Blue,
  Hue.Blue,
  Hue.Blue,
  Hue.Purple,
  Hue.Purple,
  Hue.Purple,
];

/** Writes a formula's digits as subscripts (H2SO4 → H₂SO₄); a leading coefficient stays. */
export function subscripted(formula: string): string {
  const SUB = "₀₁₂₃₄₅₆₇₈₉";
  let out = "";
  for (let i = 0; i < formula.length; i++) {
    const c = formula[i] ?? "";
    const prev = formula[i - 1];
    const isDigit = c >= "0" && c <= "9";
    const afterAtom = prev !== undefined && /[A-Za-z)]/.test(prev);
    const afterSub =
      prev !== undefined && out.length > 0 && SUB.includes(out[out.length - 1] ?? "");
    out += isDigit && (afterAtom || afterSub) ? (SUB[Number(c)] ?? c) : c;
  }
  return out;
}
