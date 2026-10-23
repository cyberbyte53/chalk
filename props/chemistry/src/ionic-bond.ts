import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import type { Words } from "./words";

/**
 * How metals and non-metals react (NCERT 3.3): atoms drawn with their electron shells; the metal's
 * outer electrons move to the non-metal, each atom ending with a full outer shell (an octet); the
 * charged ions that result attract each other and stay together as an ionic compound.
 */

/** Atomic numbers of the elements this chapter uses for ionic compounds. */
export const IONIC_ELEMENTS = {
  Na: { z: 11, isMetal: true, name: { en: "sodium", hi: "सोडियम" } },
  K: { z: 19, isMetal: true, name: { en: "potassium", hi: "पोटैशियम" } },
  Mg: { z: 12, isMetal: true, name: { en: "magnesium", hi: "मैग्नीशियम" } },
  Ca: { z: 20, isMetal: true, name: { en: "calcium", hi: "कैल्शियम" } },
  Cl: { z: 17, isMetal: false, name: { en: "chlorine", hi: "क्लोरीन" } },
  O: { z: 8, isMetal: false, name: { en: "oxygen", hi: "ऑक्सीजन" } },
} as const satisfies Record<string, { z: number; isMetal: boolean; name: Words }>;
export type IonicElement = keyof typeof IONIC_ELEMENTS;

/** Electrons in the K, L, M, N shells (the Class IX rule: 2, 8, 8, then the next, for Z ≤ 20). */
export function shellsOf(z: number): number[] {
  const caps = [2, 8, 8, 2];
  const shells: number[] = [];
  let left = z;
  for (const cap of caps) {
    if (left <= 0) break;
    const n = Math.min(cap, left);
    shells.push(n);
    left -= n;
  }
  return shells;
}

export const valenceOf = (z: number): number => shellsOf(z).at(-1) ?? 0;

/** Electrons a metal atom gives away (its outer shell) or a non-metal takes (to fill 8). */
export function electronChange(el: IonicElement): number {
  const info = IONIC_ELEMENTS[el];
  const v = valenceOf(info.z);
  return info.isMetal ? -v : 8 - v;
}

/** The shells of the ion: a metal loses its outer shell, a non-metal fills its outer shell to 8. */
export function ionShellsOf(el: IonicElement): number[] {
  const shells = shellsOf(IONIC_ELEMENTS[el].z);
  if (IONIC_ELEMENTS[el].isMetal) return shells.slice(0, -1);
  return [...shells.slice(0, -1), 8];
}

/** The ion's charge: + for electrons lost, − for electrons gained. */
export const chargeOf = (el: IonicElement): number => -electronChange(el);

const SUP: Record<string, string> = { "1": "", "2": "²", "3": "³" };
export const chargeText = (q: number): string =>
  q === 0 ? "" : `${SUP[String(Math.abs(q))] ?? ""}${q > 0 ? "⁺" : "⁻"}`;
export const ionText = (el: IonicElement): string => `${el}${chargeText(chargeOf(el))}`;

export const IonicCompound = {
  SodiumChloride: "NaCl",
  PotassiumChloride: "KCl",
  MagnesiumChloride: "MgCl2",
  SodiumOxide: "Na2O",
  MagnesiumOxide: "MgO",
  CalciumOxide: "CaO",
} as const;
export type IonicCompound = (typeof IonicCompound)[keyof typeof IonicCompound];

type CompoundInfo = {
  metal: IonicElement;
  nonMetal: IonicElement;
  metals: number;
  nonMetals: number;
  formula: string;
  name: Words;
};

export const COMPOUNDS: Record<IonicCompound, CompoundInfo> = {
  NaCl: {
    metal: "Na",
    nonMetal: "Cl",
    metals: 1,
    nonMetals: 1,
    formula: "NaCl",
    name: { en: "sodium chloride", hi: "सोडियम क्लोराइड" },
  },
  KCl: {
    metal: "K",
    nonMetal: "Cl",
    metals: 1,
    nonMetals: 1,
    formula: "KCl",
    name: { en: "potassium chloride", hi: "पोटैशियम क्लोराइड" },
  },
  MgCl2: {
    metal: "Mg",
    nonMetal: "Cl",
    metals: 1,
    nonMetals: 2,
    formula: "MgCl₂",
    name: { en: "magnesium chloride", hi: "मैग्नीशियम क्लोराइड" },
  },
  Na2O: {
    metal: "Na",
    nonMetal: "O",
    metals: 2,
    nonMetals: 1,
    formula: "Na₂O",
    name: { en: "sodium oxide", hi: "सोडियम ऑक्साइड" },
  },
  MgO: {
    metal: "Mg",
    nonMetal: "O",
    metals: 1,
    nonMetals: 1,
    formula: "MgO",
    name: { en: "magnesium oxide", hi: "मैग्नीशियम ऑक्साइड" },
  },
  CaO: {
    metal: "Ca",
    nonMetal: "O",
    metals: 1,
    nonMetals: 1,
    formula: "CaO",
    name: { en: "calcium oxide", hi: "कैल्शियम ऑक्साइड" },
  },
};
export const COMPOUND_ORDER: readonly IonicCompound[] = Object.values(IonicCompound);

/** Electrons given = electrons taken: the formula balances the charges. */
export function isChargeBalanced(c: IonicCompound): boolean {
  const info = COMPOUNDS[c];
  return info.metals * chargeOf(info.metal) + info.nonMetals * chargeOf(info.nonMetal) === 0;
}

export const BOND_STEPS = 4;
export const BondStep = { Atoms: 0, Transfer: 1, Ions: 2, Together: 3 } as const;

export const BondAction = { Next: "next", GoTo: "goTo", Choose: "choose" } as const;
export const BondSignal = { Stepped: "stepped" } as const;
export const BondDerived = {
  Formula: "formula",
  Cation: "cation",
  Anion: "anion",
  ElectronsMoved: "electronsMoved",
  IsIons: "isIons",
} as const;
export const BondPart = {
  Atoms: "atoms",
  Metal: "metal",
  NonMetal: "nonMetal",
  Caption: "caption",
  Next: "next",
  Compounds: "compounds",
} as const;

const bondState = z
  .object({
    compound: z.nativeEnum(IonicCompound),
    /** 0 atoms, 1 electrons move, 2 ions, 3 held together. */
    step: z
      .number()
      .int()
      .min(0)
      .max(BOND_STEPS - 1),
    canStep: z.boolean(),
    /** Every shell drawn (true), or only the outer shell: the electron-dot structure (false). */
    showAllShells: z.boolean(),
    /** The electron numbers (2, 8, 1) under each atom or ion. */
    showConfig: z.boolean(),
    /** The compounds the learner may switch between (none: no switching). */
    compounds: z.array(z.nativeEnum(IonicCompound)),
  })
  .strict();
export type BondState = z.infer<typeof bondState>;

const configText = (shells: number[]) => shells.join(", ");

export function describeBond(s: BondState): string {
  const info = COMPOUNDS[s.compound];
  const m = IONIC_ELEMENTS[info.metal];
  const n = IONIC_ELEMENTS[info.nonMetal];
  const moved = info.metals * -electronChange(info.metal);
  const atoms = `${info.metals > 1 ? `${info.metals} ` : ""}${m.name.en} atom${info.metals > 1 ? "s" : ""} (${configText(shellsOf(m.z))}) and ${info.nonMetals > 1 ? `${info.nonMetals} ` : ""}${n.name.en} atom${info.nonMetals > 1 ? "s" : ""} (${configText(shellsOf(n.z))})`;
  switch (s.step) {
    case BondStep.Atoms:
      return `Making ${info.formula}: ${atoms}.`;
    case BondStep.Transfer:
      return `Making ${info.formula}: ${moved} electron${moved > 1 ? "s" : ""} move from ${m.name.en} to ${n.name.en}.`;
    case BondStep.Ions:
      return `Making ${info.formula}: now ions, ${ionText(info.metal)} (${configText(ionShellsOf(info.metal))}) and ${ionText(info.nonMetal)} (${configText(ionShellsOf(info.nonMetal))}), each with a full outer shell.`;
    default:
      return `${info.formula}: the oppositely charged ions ${ionText(info.metal)} and ${ionText(info.nonMetal)} attract each other and are held together: an ionic compound.`;
  }
}

const act = actionsFor<BondState>();

export const ionicBond = defineProp({
  type: "ionicBond",
  describe:
    "How a metal and a non-metal form an ionic compound (NCERT 3.3, Figs 3.5 and 3.6), stepped: the atoms with their electron shells (K, L, M), the metal's outer electrons moving to the non-metal, the ions with their charges and full outer shells, and the ions held together by the attraction between opposite charges. NaCl, KCl, MgCl₂, Na₂O, MgO, CaO. Either every shell or only the outer one (the electron-dot structure).",
  state: bondState,
  defaults: {
    compound: IonicCompound.SodiumChloride,
    step: 0,
    canStep: true,
    showAllShells: true,
    showConfig: true,
    compounds: [],
  },
  inputs: ["canStep", "showAllShells", "showConfig", "compounds"],
  derived: {
    [BondDerived.Formula]: {
      describe: "The compound's formula",
      compute: (s) => COMPOUNDS[s.compound].formula,
    },
    [BondDerived.Cation]: {
      describe: "The positive ion, e.g. Na⁺",
      compute: (s) => ionText(COMPOUNDS[s.compound].metal),
    },
    [BondDerived.Anion]: {
      describe: "The negative ion, e.g. Cl⁻",
      compute: (s) => ionText(COMPOUNDS[s.compound].nonMetal),
    },
    [BondDerived.ElectronsMoved]: {
      describe: "How many electrons move from metal to non-metal in all",
      compute: (s) => {
        const info = COMPOUNDS[s.compound];
        return info.metals * -electronChange(info.metal);
      },
    },
    [BondDerived.IsIons]: {
      describe: "The picture shows ions (after the electrons have moved)",
      compute: (s) => s.step >= BondStep.Ions,
    },
  },
  actions: {
    [BondAction.Next]: act({
      describe: "The next step (after the last, back to the atoms)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = (s.step + 1) % BOND_STEPS;
        return set({ step }, { signal: BondSignal.Stepped, payload: { step } });
      },
    }),
    [BondAction.GoTo]: act({
      describe: "Show one step: 0 atoms, 1 electrons move, 2 ions, 3 held together",
      args: z
        .object({
          step: z
            .number()
            .int()
            .min(0)
            .max(BOND_STEPS - 1),
        })
        .strict(),
      run: (_s, a) =>
        set({ step: a.step }, { signal: BondSignal.Stepped, payload: { step: a.step } }),
    }),
    [BondAction.Choose]: act({
      describe: "Switch to another compound, back at the atoms",
      byLearner: true,
      args: z.object({ compound: z.nativeEnum(IonicCompound) }).strict(),
      run: (s, a) =>
        s.compounds.includes(a.compound)
          ? set(
              { compound: a.compound, step: 0 },
              { signal: BondSignal.Stepped, payload: { step: 0 } },
            )
          : set({}),
    }),
  },
  signals: {
    [BondSignal.Stepped]: {
      describe: "The picture moved to a step; the payload has the step (0–3)",
    },
  },
  observe: (s) => {
    const info = COMPOUNDS[s.compound];
    const ions = s.step >= BondStep.Ions;
    const elements: Element[] = [
      { id: BondPart.Atoms, value: describeBond(s) },
      {
        id: BondPart.Metal,
        value: ions
          ? `${ionText(info.metal)}: ${configText(ionShellsOf(info.metal))}`
          : `${info.metal}: ${configText(shellsOf(IONIC_ELEMENTS[info.metal].z))}`,
      },
      {
        id: BondPart.NonMetal,
        value: ions
          ? `${ionText(info.nonMetal)}: ${configText(ionShellsOf(info.nonMetal))}`
          : `${info.nonMetal}: ${configText(shellsOf(IONIC_ELEMENTS[info.nonMetal].z))}`,
      },
    ];
    if (s.canStep)
      elements.push({ id: BondPart.Next, value: `step ${s.step + 1} of ${BOND_STEPS}` });
    return { summary: describeBond(s), elements };
  },
  parts: (s) => [
    BondPart.Atoms,
    BondPart.Metal,
    BondPart.NonMetal,
    BondPart.Caption,
    ...(s.canStep ? [BondPart.Next] : []),
    ...(s.compounds.length > 1 ? [BondPart.Compounds] : []),
  ],
});
