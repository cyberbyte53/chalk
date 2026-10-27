import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { NATURE_WORDS, Nature } from "./acid-data";
import type { Words } from "./words";

/**
 * Families of salts (Activities 2.13, 2.14): each salt is made of a positive part from a base and
 * a negative part from an acid. Salts sharing a part are one family (sodium salts, chloride
 * salts). Whether a salt's solution is neutral, acidic or basic depends on whether its acid and
 * base were strong or weak.
 */

export const Cation = {
  Sodium: "sodium",
  Potassium: "potassium",
  Calcium: "calcium",
  Magnesium: "magnesium",
  Copper: "copper",
  Ammonium: "ammonium",
  Zinc: "zinc",
  Aluminium: "aluminium",
} as const;
export type Cation = (typeof Cation)[keyof typeof Cation];

export const Anion = {
  Chloride: "chloride",
  Sulphate: "sulphate",
  Nitrate: "nitrate",
  Carbonate: "carbonate",
  Hydrogencarbonate: "hydrogencarbonate",
  Acetate: "acetate",
} as const;
export type Anion = (typeof Anion)[keyof typeof Anion];

type Parent = { formula: string; name: Words; isStrong: boolean };

export const CATIONS: Record<Cation, { ion: string; name: Words; base: Parent }> = {
  sodium: {
    ion: "Na⁺",
    name: { en: "sodium", hi: "सोडियम" },
    base: {
      formula: "NaOH",
      name: { en: "sodium hydroxide", hi: "सोडियम हाइड्रॉक्साइड" },
      isStrong: true,
    },
  },
  potassium: {
    ion: "K⁺",
    name: { en: "potassium", hi: "पोटैशियम" },
    base: {
      formula: "KOH",
      name: { en: "potassium hydroxide", hi: "पोटैशियम हाइड्रॉक्साइड" },
      isStrong: true,
    },
  },
  calcium: {
    ion: "Ca²⁺",
    name: { en: "calcium", hi: "कैल्सियम" },
    base: {
      formula: "Ca(OH)2",
      name: { en: "calcium hydroxide", hi: "कैल्सियम हाइड्रॉक्साइड" },
      isStrong: true,
    },
  },
  magnesium: {
    ion: "Mg²⁺",
    name: { en: "magnesium", hi: "मैग्नीशियम" },
    base: {
      formula: "Mg(OH)2",
      name: { en: "magnesium hydroxide", hi: "मैग्नीशियम हाइड्रॉक्साइड" },
      isStrong: false,
    },
  },
  copper: {
    ion: "Cu²⁺",
    name: { en: "copper", hi: "कॉपर" },
    base: {
      formula: "Cu(OH)2",
      name: { en: "copper hydroxide", hi: "कॉपर हाइड्रॉक्साइड" },
      isStrong: false,
    },
  },
  ammonium: {
    ion: "NH₄⁺",
    name: { en: "ammonium", hi: "अमोनियम" },
    base: {
      formula: "NH4OH",
      name: { en: "ammonium hydroxide", hi: "अमोनियम हाइड्रॉक्साइड" },
      isStrong: false,
    },
  },
  zinc: {
    ion: "Zn²⁺",
    name: { en: "zinc", hi: "जिंक" },
    base: {
      formula: "Zn(OH)2",
      name: { en: "zinc hydroxide", hi: "जिंक हाइड्रॉक्साइड" },
      isStrong: false,
    },
  },
  aluminium: {
    ion: "Al³⁺",
    name: { en: "aluminium", hi: "ऐलुमिनियम" },
    base: {
      formula: "Al(OH)3",
      name: { en: "aluminium hydroxide", hi: "ऐलुमिनियम हाइड्रॉक्साइड" },
      isStrong: false,
    },
  },
};

export const ANIONS: Record<Anion, { ion: string; name: Words; acid: Parent }> = {
  chloride: {
    ion: "Cl⁻",
    name: { en: "chloride", hi: "क्लोराइड" },
    acid: {
      formula: "HCl",
      name: { en: "hydrochloric acid", hi: "हाइड्रोक्लोरिक अम्ल" },
      isStrong: true,
    },
  },
  sulphate: {
    ion: "SO₄²⁻",
    name: { en: "sulphate", hi: "सल्फ़ेट" },
    acid: { formula: "H2SO4", name: { en: "sulphuric acid", hi: "सल्फ़्यूरिक अम्ल" }, isStrong: true },
  },
  nitrate: {
    ion: "NO₃⁻",
    name: { en: "nitrate", hi: "नाइट्रेट" },
    acid: { formula: "HNO3", name: { en: "nitric acid", hi: "नाइट्रिक अम्ल" }, isStrong: true },
  },
  carbonate: {
    ion: "CO₃²⁻",
    name: { en: "carbonate", hi: "कार्बोनेट" },
    acid: { formula: "H2CO3", name: { en: "carbonic acid", hi: "कार्बोनिक अम्ल" }, isStrong: false },
  },
  hydrogencarbonate: {
    ion: "HCO₃⁻",
    name: { en: "hydrogencarbonate", hi: "हाइड्रोजनकार्बोनेट" },
    acid: { formula: "H2CO3", name: { en: "carbonic acid", hi: "कार्बोनिक अम्ल" }, isStrong: false },
  },
  acetate: {
    ion: "CH₃COO⁻",
    name: { en: "acetate", hi: "ऐसीटेट" },
    acid: { formula: "CH3COOH", name: { en: "acetic acid", hi: "ऐसीटिक अम्ल" }, isStrong: false },
  },
};

export const SaltId = {
  SodiumChloride: "sodiumChloride",
  SodiumSulphate: "sodiumSulphate",
  SodiumNitrate: "sodiumNitrate",
  SodiumCarbonate: "sodiumCarbonate",
  SodiumHydrogencarbonate: "sodiumHydrogencarbonate",
  SodiumAcetate: "sodiumAcetate",
  PotassiumChloride: "potassiumChloride",
  PotassiumSulphate: "potassiumSulphate",
  PotassiumNitrate: "potassiumNitrate",
  CalciumChloride: "calciumChloride",
  CalciumSulphate: "calciumSulphate",
  MagnesiumChloride: "magnesiumChloride",
  MagnesiumSulphate: "magnesiumSulphate",
  CopperSulphate: "copperSulphate",
  CopperChloride: "copperChloride",
  AmmoniumChloride: "ammoniumChloride",
  ZincSulphate: "zincSulphate",
  AluminiumChloride: "aluminiumChloride",
} as const;
export type SaltId = (typeof SaltId)[keyof typeof SaltId];

export const SALTS: Record<SaltId, { formula: string; cation: Cation; anion: Anion }> = {
  sodiumChloride: { formula: "NaCl", cation: "sodium", anion: "chloride" },
  sodiumSulphate: { formula: "Na2SO4", cation: "sodium", anion: "sulphate" },
  sodiumNitrate: { formula: "NaNO3", cation: "sodium", anion: "nitrate" },
  sodiumCarbonate: { formula: "Na2CO3", cation: "sodium", anion: "carbonate" },
  sodiumHydrogencarbonate: { formula: "NaHCO3", cation: "sodium", anion: "hydrogencarbonate" },
  sodiumAcetate: { formula: "CH3COONa", cation: "sodium", anion: "acetate" },
  potassiumChloride: { formula: "KCl", cation: "potassium", anion: "chloride" },
  potassiumSulphate: { formula: "K2SO4", cation: "potassium", anion: "sulphate" },
  potassiumNitrate: { formula: "KNO3", cation: "potassium", anion: "nitrate" },
  calciumChloride: { formula: "CaCl2", cation: "calcium", anion: "chloride" },
  calciumSulphate: { formula: "CaSO4", cation: "calcium", anion: "sulphate" },
  magnesiumChloride: { formula: "MgCl2", cation: "magnesium", anion: "chloride" },
  magnesiumSulphate: { formula: "MgSO4", cation: "magnesium", anion: "sulphate" },
  copperSulphate: { formula: "CuSO4", cation: "copper", anion: "sulphate" },
  copperChloride: { formula: "CuCl2", cation: "copper", anion: "chloride" },
  ammoniumChloride: { formula: "NH4Cl", cation: "ammonium", anion: "chloride" },
  zincSulphate: { formula: "ZnSO4", cation: "zinc", anion: "sulphate" },
  aluminiumChloride: { formula: "AlCl3", cation: "aluminium", anion: "chloride" },
};

/** A salt's name: "sodium chloride". */
export const saltName = (id: SaltId): Words => {
  const s = SALTS[id];
  return {
    en: `${CATIONS[s.cation].name.en} ${ANIONS[s.anion].name.en}`,
    hi: `${CATIONS[s.cation].name.hi} ${ANIONS[s.anion].name.hi}`,
  };
};

/** Neutral (strong + strong), acidic (strong acid, weak base) or basic (strong base, weak acid). */
export function saltNature(id: SaltId): Nature {
  const s = SALTS[id];
  const acid = ANIONS[s.anion].acid.isStrong;
  const base = CATIONS[s.cation].base.isStrong;
  if (acid && !base) return Nature.Acidic;
  if (!acid && base) return Nature.Basic;
  return Nature.Neutral;
}

/** The members of a family: every shown salt sharing this ion. */
export function familyOf(salts: readonly SaltId[], ion: Cation | Anion): SaltId[] {
  return salts.filter((x) => SALTS[x].cation === ion || SALTS[x].anion === ion);
}

export const isCation = (ion: string): ion is Cation => ion in CATIONS;

export const SaltFamilyAction = { Pick: "pick", Highlight: "highlight", Clear: "clear" } as const;
export const SaltFamilySignal = { Picked: "picked", Highlighted: "highlighted" } as const;
export const SaltFamilyDerived = {
  Family: "family",
  Parents: "parents",
  Nature: "nature",
} as const;
export const SaltFamilyPart = { Grid: "grid", Card: "card" } as const;

const ion = z.union([z.nativeEnum(Cation), z.nativeEnum(Anion)]);

const saltFamilyState = z
  .object({
    /** The salts on the grid. */
    salts: z.array(z.nativeEnum(SaltId)).min(1).max(18),
    /** The salt tapped, shown in a card, or null. */
    picked: z.nativeEnum(SaltId).nullable(),
    /** The ion whose family is lit up, or null. */
    highlight: ion.nullable(),
    /** The card says which acid and which base the salt comes from. */
    showParents: z.boolean(),
    /** The card says whether the salt's solution is acidic, basic or neutral (and why). */
    showNature: z.boolean(),
    canPick: z.boolean(),
    canHighlight: z.boolean(),
  })
  .strict();
export type SaltFamilyState = z.infer<typeof saltFamilyState>;

export function describeSaltFamily(s: SaltFamilyState): string {
  const grid = `A grid of salts: ${s.salts.map((x) => `${SALTS[x].formula} (${saltName(x).en})`).join(", ")}; rows by the positive part (from a base), columns by the negative part (from an acid).`;
  const lit =
    s.highlight === null
      ? ""
      : ` The ${(isCation(s.highlight) ? CATIONS[s.highlight].name : ANIONS[s.highlight].name).en} family is lit: ${familyOf(
          s.salts,
          s.highlight,
        )
          .map((x) => SALTS[x].formula)
          .join(", ")}.`;
  if (s.picked === null) return grid + lit;
  const salt = SALTS[s.picked];
  const acid = ANIONS[salt.anion].acid;
  const base = CATIONS[salt.cation].base;
  const parents = s.showParents
    ? ` It comes from ${acid.name.en} (${acid.isStrong ? "strong" : "weak"}) and ${base.name.en} (${base.isStrong ? "strong" : "weak"}).`
    : "";
  const nature = s.showNature ? ` Its solution is ${NATURE_WORDS[saltNature(s.picked)].en}.` : "";
  return `${grid}${lit} Picked: ${salt.formula}, ${saltName(s.picked).en}.${parents}${nature}`;
}

const act = actionsFor<SaltFamilyState>();

export const saltFamily = defineProp({
  type: "saltFamily",
  describe:
    "Families of salts (NCERT Class 10, Activities 2.13 and 2.14): a grid of salts with rows for the positive part (sodium, potassium, calcium, magnesium, copper, ammonium, zinc, aluminium, from a base) and columns for the negative part (chloride, sulphate, nitrate, carbonate, hydrogencarbonate, acetate, from an acid). Tap a salt to see its formula, the acid and base it comes from (strong or weak) and whether its solution is neutral (strong acid + strong base), acidic (strong acid + weak base) or basic (weak acid + strong base). Tap a row or column to light up that family (all sodium salts, all chlorides).",
  state: saltFamilyState,
  defaults: {
    salts: [
      SaltId.SodiumChloride,
      SaltId.SodiumSulphate,
      SaltId.PotassiumSulphate,
      SaltId.PotassiumChloride,
      SaltId.CopperSulphate,
      SaltId.AmmoniumChloride,
    ],
    picked: null,
    highlight: null,
    showParents: true,
    showNature: false,
    canPick: true,
    canHighlight: true,
  },
  inputs: ["showParents", "showNature", "canPick", "canHighlight"],
  derived: {
    [SaltFamilyDerived.Family]: {
      describe: "The salts in the lit family (empty when none is lit)",
      compute: (s) => (s.highlight === null ? [] : familyOf(s.salts, s.highlight)),
    },
    [SaltFamilyDerived.Parents]: {
      describe: "The picked salt's acid and base, as formulae { acid, base }, or null",
      compute: (s) =>
        s.picked === null
          ? null
          : {
              acid: ANIONS[SALTS[s.picked].anion].acid.formula,
              base: CATIONS[SALTS[s.picked].cation].base.formula,
            },
    },
    [SaltFamilyDerived.Nature]: {
      describe: "Whether the picked salt's solution is acidic, basic or neutral, or null",
      compute: (s) => (s.picked === null ? null : saltNature(s.picked)),
    },
  },
  actions: {
    [SaltFamilyAction.Pick]: act({
      describe: "Tap a salt on the grid to see where it comes from",
      byLearner: true,
      args: z.object({ salt: z.nativeEnum(SaltId) }).strict(),
      run: (s, a) =>
        s.salts.includes(a.salt)
          ? set(
              { picked: a.salt },
              {
                signal: SaltFamilySignal.Picked,
                payload: { salt: a.salt, nature: saltNature(a.salt) },
              },
            )
          : set({}),
    }),
    [SaltFamilyAction.Highlight]: act({
      describe: "Tap a row or column heading to light up that family of salts (tap again to clear)",
      byLearner: true,
      args: z.object({ ion }).strict(),
      run: (s, a) =>
        s.highlight === a.ion
          ? set({ highlight: null })
          : set(
              { highlight: a.ion },
              {
                signal: SaltFamilySignal.Highlighted,
                payload: { ion: a.ion, family: familyOf(s.salts, a.ion) },
              },
            ),
    }),
    [SaltFamilyAction.Clear]: act({
      describe: "Clear the picked salt and the lit family",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ picked: null, highlight: null }),
    }),
  },
  signals: {
    [SaltFamilySignal.Picked]: {
      describe: "A salt was tapped (payload: salt, nature)",
    },
    [SaltFamilySignal.Highlighted]: { describe: "A family was lit (payload: ion, its salts)" },
  },
  observe: (s) => {
    const elements: Element[] = [
      { id: SaltFamilyPart.Grid, value: s.salts.map((x) => SALTS[x].formula).join(", ") },
    ];
    if (s.picked !== null)
      elements.push({
        id: SaltFamilyPart.Card,
        value: `${SALTS[s.picked].formula}${s.showParents ? `: ${ANIONS[SALTS[s.picked].anion].acid.formula} + ${CATIONS[SALTS[s.picked].cation].base.formula}` : ""}${s.showNature ? `, ${NATURE_WORDS[saltNature(s.picked)].en}` : ""}`,
      });
    return {
      summary: describeSaltFamily(s),
      elements,
      hidden: {
        natures: s.salts
          .filter((x) => !(s.showNature && x === s.picked))
          .map((x) => `${SALTS[x].formula}: ${NATURE_WORDS[saltNature(x)].en}`),
      },
    };
  },
  parts: (s) => [SaltFamilyPart.Grid, ...(s.picked !== null ? [SaltFamilyPart.Card] : [])],
});
