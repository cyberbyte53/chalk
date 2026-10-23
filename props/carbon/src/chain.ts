import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { type Counts, HINDI_STEMS, STEMS, massOf, part, subscript } from "./chem";

/**
 * Build a carbon compound (NCERT 4.2.1–4.2.5): 1 to 6 carbons in a straight chain, a branched
 * chain (one or two methyl branches on the second carbon), or a ring; single, double or triple
 * bonds between carbons; optionally one functional group at the end of a straight saturated chain.
 * Hydrogens fill whatever valency is left, so every carbon makes exactly four bonds. The prop
 * names the compound by NCERT's rules (Table 4.4) and gives its formula and molecular mass.
 */

export const Shape = {
  Straight: "straight",
  Branched: "branched",
  DoublyBranched: "doublyBranched",
  Ring: "ring",
} as const;
export type Shape = (typeof Shape)[keyof typeof Shape];

export const Group = {
  None: "none",
  Chloro: "chloro",
  Bromo: "bromo",
  Alcohol: "alcohol",
  Aldehyde: "aldehyde",
  Ketone: "ketone",
  Acid: "acid",
} as const;
export type Group = (typeof Group)[keyof typeof Group];

export const CompoundClass = {
  Alkane: "alkane",
  Alkene: "alkene",
  Alkyne: "alkyne",
  RingAlkane: "ringAlkane",
  Benzene: "benzene",
  Haloalkane: "haloalkane",
  Alcohol: "alcohol",
  Aldehyde: "aldehyde",
  Ketone: "ketone",
  Acid: "carboxylicAcid",
} as const;
export type CompoundClass = (typeof CompoundClass)[keyof typeof CompoundClass];

export const MAX_CARBONS = 6;
type Order = 1 | 2 | 3;

export type Chain = {
  carbons: number;
  shape: Shape;
  /** C–C bond orders, in order along the chain (or round the ring); only the first few count. */
  bonds: readonly number[];
  group: Group;
};

/** Carbons in the longest straight run (the name's stem). */
export const mainLength = (c: Chain): number =>
  c.shape === Shape.Branched
    ? c.carbons - 1
    : c.shape === Shape.DoublyBranched
      ? c.carbons - 2
      : c.carbons;

/** The C–C bonds that exist: along the main chain, or round the ring. */
export function ccBonds(c: Chain): Order[] {
  const count = c.shape === Shape.Ring ? c.carbons : mainLength(c) - 1;
  return c.bonds.slice(0, Math.max(0, count)) as Order[];
}

/** Bonds the group makes to the carbon it sits on: (carbon index in the main chain, bonds). */
function groupLoad(c: Chain): { at: number; bonds: number } | null {
  const last = mainLength(c) - 1;
  switch (c.group) {
    case Group.Chloro:
    case Group.Bromo:
    case Group.Alcohol:
      return { at: last, bonds: 1 };
    case Group.Aldehyde:
      return { at: last, bonds: 2 };
    case Group.Acid:
      return { at: last, bonds: 3 };
    case Group.Ketone:
      return { at: 1, bonds: 2 };
    default:
      return null;
  }
}

/** Bonds each main-chain (or ring) carbon makes to carbons and to the group. */
export function loadsOf(c: Chain): number[] {
  const n = c.shape === Shape.Ring ? c.carbons : mainLength(c);
  const cc = ccBonds(c);
  const load = Array.from({ length: n }, () => 0);
  if (c.shape === Shape.Ring) {
    cc.forEach((o, i) => {
      load[i] = (load[i] ?? 0) + o;
      load[(i + 1) % n] = (load[(i + 1) % n] ?? 0) + o;
    });
  } else {
    cc.forEach((o, i) => {
      load[i] = (load[i] ?? 0) + o;
      load[i + 1] = (load[i + 1] ?? 0) + o;
    });
    if (c.shape === Shape.Branched) load[1] = (load[1] ?? 0) + 1;
    if (c.shape === Shape.DoublyBranched) load[1] = (load[1] ?? 0) + 2;
  }
  const g = groupLoad(c);
  if (g !== null) load[g.at] = (load[g.at] ?? 0) + g.bonds;
  return load;
}

/** Hydrogens on each main-chain (or ring) carbon: whatever is left of its four bonds. */
export const hydrogensOf = (c: Chain): number[] => loadsOf(c).map((l) => 4 - l);

/** Why this compound can't be built, or undefined if it can. */
export function problemOf(c: Chain): string | undefined {
  const n = c.carbons;
  const cc = ccBonds(c);
  const multiple = cc.filter((o) => o > 1).length;
  if (c.shape === Shape.Branched && n < 4) return "a branch needs at least 4 carbons";
  if (c.shape === Shape.DoublyBranched && n < 5) return "two branches need at least 5 carbons";
  if (c.shape === Shape.Ring && n < 3) return "a ring needs at least 3 carbons";
  if (c.shape === Shape.Ring) {
    const isBenzene = n === 6 && cc.every((o, i) => o === (i % 2 === 0 ? 2 : 1));
    if (!(cc.every((o) => o === 1) || isBenzene)) return "rings here are all single, or benzene";
  } else if (c.shape !== Shape.Straight && multiple > 0) {
    return "branched chains here have single bonds only";
  }
  if (c.shape !== Shape.Ring && multiple > 1) return "only one double or triple bond at a time";
  if (c.group !== Group.None) {
    if (c.shape !== Shape.Straight) return "groups go on a straight chain";
    if (multiple > 0) return "groups go on a saturated chain";
    if (c.group === Group.Ketone && n < 3) return "a ketone needs at least 3 carbons";
  }
  if (hydrogensOf(c).some((h) => h < 0)) return "a carbon can make only four bonds";
  return undefined;
}

/** The atoms in the compound. */
export function countsOf(c: Chain): Counts {
  let h = hydrogensOf(c).reduce((a, b) => a + b, 0);
  if (c.shape === Shape.Branched) h += 3;
  if (c.shape === Shape.DoublyBranched) h += 6;
  const counts: Counts = { C: c.carbons, H: h };
  if (c.group === Group.Alcohol) counts.H = h + 1;
  if (c.group === Group.Acid) counts.H = h + 1;
  if ([Group.Alcohol, Group.Aldehyde, Group.Ketone].includes(c.group as never)) counts.O = 1;
  if (c.group === Group.Acid) counts.O = 2;
  if (c.group === Group.Chloro) counts.Cl = 1;
  if (c.group === Group.Bromo) counts.Br = 1;
  return counts;
}

/** The molecular formula, C first then H then the rest: "C2H6O". */
export function molecularFormula(c: Chain): string {
  const k = countsOf(c);
  return `${part("C", k.C ?? 0)}${part("H", k.H ?? 0)}${part("Br", k.Br ?? 0)}${part("Cl", k.Cl ?? 0)}${part("O", k.O ?? 0)}`;
}

/** The formula the way NCERT writes it: CH3OH, C2H5OH, CH3COOH, HCHO, CH3COCH3. */
export function bookFormula(c: Chain): string {
  const n = c.carbons;
  const alkyl = (m: number) => `${part("C", m)}${part("H", 2 * m + 1)}`;
  switch (c.group) {
    case Group.Chloro:
      return `${alkyl(n)}Cl`;
    case Group.Bromo:
      return `${alkyl(n)}Br`;
    case Group.Alcohol:
      return `${alkyl(n)}OH`;
    case Group.Aldehyde:
      return n === 1 ? "HCHO" : `${alkyl(n - 1)}CHO`;
    case Group.Acid:
      return n === 1 ? "HCOOH" : `${alkyl(n - 1)}COOH`;
    case Group.Ketone:
      return `CH3CO${alkyl(n - 2)}`;
    default:
      return molecularFormula(c);
  }
}

export function classOf(c: Chain): CompoundClass {
  switch (c.group) {
    case Group.Chloro:
    case Group.Bromo:
      return CompoundClass.Haloalkane;
    case Group.Alcohol:
      return CompoundClass.Alcohol;
    case Group.Aldehyde:
      return CompoundClass.Aldehyde;
    case Group.Ketone:
      return CompoundClass.Ketone;
    case Group.Acid:
      return CompoundClass.Acid;
    default:
      break;
  }
  if (c.shape === Shape.Ring)
    return ccBonds(c).some((o) => o > 1) ? CompoundClass.Benzene : CompoundClass.RingAlkane;
  const top = Math.max(1, ...ccBonds(c));
  return top === 3 ? CompoundClass.Alkyne : top === 2 ? CompoundClass.Alkene : CompoundClass.Alkane;
}

/** Saturated: only single bonds between the carbons. */
export const isSaturated = (c: Chain): boolean => ccBonds(c).every((o) => o === 1);

export type Name = { en: string; hi: string };

/** The compound's name by NCERT's rules (Table 4.4), in both languages. */
export function nameOf(c: Chain): Name {
  const L = mainLength(c);
  const stem = STEMS[L - 1] ?? "";
  const hstem = HINDI_STEMS[L - 1] ?? "";
  const ane = { en: `${stem}ane`, hi: `${hstem}ेन` };
  if (c.shape === Shape.Ring) {
    if (classOf(c) === CompoundClass.Benzene) return { en: "benzene", hi: "बेंज़ीन" };
    return { en: `cyclo${ane.en}`, hi: `साइक्लो${ane.hi}` };
  }
  if (c.shape === Shape.Branched) return { en: `2-methyl${ane.en}`, hi: `2-मेथिल${ane.hi}` };
  if (c.shape === Shape.DoublyBranched)
    return { en: `2,2-dimethyl${ane.en}`, hi: `2,2-डाइमेथिल${ane.hi}` };
  switch (c.group) {
    case Group.Chloro:
      return { en: `chloro${ane.en}`, hi: `क्लोरो${ane.hi}` };
    case Group.Bromo:
      return { en: `bromo${ane.en}`, hi: `ब्रोमो${ane.hi}` };
    case Group.Alcohol:
      return { en: `${stem}anol`, hi: `${hstem}ेनॉल` };
    case Group.Aldehyde:
      return { en: `${stem}anal`, hi: `${hstem}ेनैल` };
    case Group.Ketone:
      return { en: `${stem}anone`, hi: `${hstem}ेनोन` };
    case Group.Acid:
      return { en: `${stem}anoic acid`, hi: `${hstem}ेनोइक अम्ल` };
    default:
      break;
  }
  const cls = classOf(c);
  if (cls === CompoundClass.Alkene) return { en: `${stem}ene`, hi: `${hstem}ीन` };
  if (cls === CompoundClass.Alkyne) return { en: `${stem}yne`, hi: `${hstem}ाइन` };
  return ane;
}

export const CLASS_WORDS: Readonly<Record<CompoundClass, Name>> = {
  alkane: { en: "alkane (saturated hydrocarbon)", hi: "ऐल्केन (संतृप्त हाइड्रोकार्बन)" },
  alkene: { en: "alkene (has a double bond)", hi: "ऐल्कीन (द्विबंध वाला)" },
  alkyne: { en: "alkyne (has a triple bond)", hi: "ऐल्काइन (त्रिबंध वाला)" },
  ringAlkane: { en: "saturated ring", hi: "संतृप्त वलय" },
  benzene: { en: "unsaturated ring", hi: "असंतृप्त वलय" },
  haloalkane: { en: "haloalkane", hi: "हैलोऐल्केन" },
  alcohol: { en: "alcohol", hi: "ऐल्कोहॉल" },
  aldehyde: { en: "aldehyde", hi: "ऐल्डिहाइड" },
  ketone: { en: "ketone", hi: "कीटोन" },
  carboxylicAcid: { en: "carboxylic acid", hi: "कार्बोक्सिलिक अम्ल" },
};

export const ChainAction = {
  SetCarbons: "setCarbons",
  SetShape: "setShape",
  SetBond: "setBond",
  SetGroup: "setGroup",
} as const;
export const ChainSignal = { Built: "built", NotPossible: "notPossible" } as const;
export const ChainDerived = {
  Name: "name",
  Formula: "formula",
  MolecularFormula: "molecularFormula",
  Class: "compoundClass",
  Saturated: "isSaturated",
  Mass: "mass",
  Hydrogens: "hydrogens",
  CovalentBonds: "covalentBonds",
} as const;
export const ChainPart = {
  Molecule: "molecule",
  Carbons: "carbons",
  Shape: "shape",
  Bond: "bond",
  Group: "group",
} as const;

const chainState = z
  .object({
    carbons: z.number().int().min(1).max(MAX_CARBONS),
    shape: z.nativeEnum(Shape),
    bonds: z.array(z.number().int().min(1).max(3)).length(MAX_CARBONS),
    group: z.nativeEnum(Group),
    /** Draw the hydrogens; false: the carbon skeleton only (NCERT Fig. 4.6a, 4.8a). */
    showH: z.boolean(),
    showName: z.boolean(),
    showFormula: z.boolean(),
    showMass: z.boolean(),
    canSetCarbons: z.boolean(),
    canSetShape: z.boolean(),
    canSetBonds: z.boolean(),
    canSetGroup: z.boolean(),
    /** The groups offered when `canSetGroup` (none is always offered). */
    groups: z.array(z.nativeEnum(Group)),
  })
  .strict();
export type ChainState = z.infer<typeof chainState>;

export function describeChain(s: ChainState): string {
  const name = nameOf(s);
  const what = s.showH ? "structure" : "carbon skeleton";
  return `The ${what} of ${name.en}, ${bookFormula(s)}: ${s.carbons} carbon(s) in a ${s.shape === Shape.Ring ? "ring" : s.shape === Shape.Straight ? "straight chain" : "branched chain"}, ${CLASS_WORDS[classOf(s)].en}.`;
}

/** Everything that changes but the bonds, with a clean-up so the compound stays buildable. */
function tidy(c: Chain): Chain {
  if (problemOf(c) === undefined) return c;
  const singles: Chain = { ...c, bonds: c.bonds.map(() => 1) };
  if (problemOf(singles) === undefined) return singles;
  const plain: Chain = { ...singles, group: Group.None };
  return plain;
}

const act = actionsFor<ChainState>();

function build(s: ChainState, next: Chain) {
  const problem = problemOf(next);
  if (problem !== undefined)
    return set<ChainState>({}, { signal: ChainSignal.NotPossible, payload: { problem } });
  const name = nameOf(next).en;
  return set<ChainState>(
    { carbons: next.carbons, shape: next.shape, bonds: [...next.bonds], group: next.group },
    { signal: ChainSignal.Built, payload: { name, formula: bookFormula(next) } },
  );
}

export const carbonChain = defineProp({
  type: "carbonChain",
  describe:
    "Builds a carbon compound and draws its structural formula: 1–6 carbons as a straight chain, a branched chain (one or two methyl branches on C2: the isomers of butane, pentane, hexane) or a ring (cycloalkanes, benzene); single, double or triple C–C bonds (one multiple bond at a time); an optional functional group on a straight saturated chain (–Cl, –Br, –OH, –CHO, >C=O, –COOH). Hydrogens fill the remaining valency. Gives the NCERT name, formula, class and molecular mass.",
  state: chainState,
  defaults: {
    carbons: 2,
    shape: Shape.Straight,
    bonds: [1, 1, 1, 1, 1, 1],
    group: Group.None,
    showH: true,
    showName: true,
    showFormula: true,
    showMass: false,
    canSetCarbons: false,
    canSetShape: false,
    canSetBonds: false,
    canSetGroup: false,
    groups: [Group.Chloro, Group.Bromo, Group.Alcohol, Group.Aldehyde, Group.Ketone, Group.Acid],
  },
  inputs: [
    "showH",
    "showName",
    "showFormula",
    "showMass",
    "canSetCarbons",
    "canSetShape",
    "canSetBonds",
    "canSetGroup",
    "groups",
  ],
  invariant: (s) => problemOf(s),
  derived: {
    [ChainDerived.Name]: { describe: "The NCERT name (English)", compute: (s) => nameOf(s).en },
    [ChainDerived.Formula]: {
      describe: "The formula as NCERT writes it (CH3OH, CH3COOH, C4H10)",
      compute: (s) => bookFormula(s),
    },
    [ChainDerived.MolecularFormula]: {
      describe: "The molecular formula (C first, then H, then the rest): isomers share it",
      compute: (s) => molecularFormula(s),
    },
    [ChainDerived.Class]: { describe: "Which family it belongs to", compute: (s) => classOf(s) },
    [ChainDerived.Saturated]: {
      describe: "Only single bonds between the carbons",
      compute: (s) => isSaturated(s),
    },
    [ChainDerived.Mass]: { describe: "Molecular mass, u", compute: (s) => massOf(countsOf(s)) },
    [ChainDerived.Hydrogens]: {
      describe: "Hydrogen atoms in the molecule",
      compute: (s) => countsOf(s).H ?? 0,
    },
    [ChainDerived.CovalentBonds]: {
      describe: "Covalent bonds in the molecule, each shared pair counted once (ethane C2H6 has 7)",
      compute: (s) => {
        const k = countsOf(s);
        const valence = 4 * (k.C ?? 0) + (k.H ?? 0) + 2 * (k.O ?? 0) + (k.Cl ?? 0) + (k.Br ?? 0);
        return valence / 2;
      },
    },
  },
  actions: {
    [ChainAction.SetCarbons]: act({
      describe: "How many carbons (1–6); bonds or the group reset if they no longer fit",
      byLearner: true,
      args: z.object({ carbons: z.number().int().min(1).max(MAX_CARBONS) }).strict(),
      run: (s, a) => build(s, tidy({ ...s, carbons: a.carbons })),
    }),
    [ChainAction.SetShape]: act({
      describe:
        "Straight chain, branched (one or two methyl branches) or ring; bonds reset to single",
      byLearner: true,
      args: z.object({ shape: z.nativeEnum(Shape) }).strict(),
      run: (s, a) =>
        build(s, {
          ...s,
          shape: a.shape,
          bonds: s.bonds.map(() => 1),
          group: a.shape === Shape.Straight ? s.group : Group.None,
        }),
    }),
    [ChainAction.SetBond]: act({
      describe:
        "Make the C–C bond at `index` (0 = between C1 and C2) single, double or triple; refused (signal notPossible) if a carbon would need more than four bonds",
      byLearner: true,
      args: z
        .object({
          index: z
            .number()
            .int()
            .min(0)
            .max(MAX_CARBONS - 1),
          order: z.number().int().min(1).max(3),
        })
        .strict(),
      run: (s, a) => {
        if (s.shape === Shape.Ring && s.carbons === 6 && a.order === 2) {
          // Benzene: the ring's double bonds alternate, so setting one sets them all.
          return build(s, { ...s, bonds: [2, 1, 2, 1, 2, 1] });
        }
        if (s.shape === Shape.Ring && a.order === 1)
          return build(s, { ...s, bonds: s.bonds.map(() => 1) });
        const bonds = s.bonds.map((o, i) => (i === a.index ? a.order : 1));
        return build(s, { ...s, bonds });
      },
    }),
    [ChainAction.SetGroup]: act({
      describe: "Put a functional group on the chain (or none); refused if it can't go there",
      byLearner: true,
      args: z.object({ group: z.nativeEnum(Group) }).strict(),
      run: (s, a) => build(s, { ...s, group: a.group }),
    }),
  },
  signals: {
    [ChainSignal.Built]: {
      describe: "A new compound was built: `name`, `formula`",
      isCommit: true,
    },
    [ChainSignal.NotPossible]: {
      describe: "The change was refused: `problem` says why (e.g. a carbon would have five bonds)",
    },
  },
  observe: (s) => ({
    summary: describeChain(s),
    elements: [
      { id: ChainPart.Molecule, value: `${nameOf(s).en}, ${bookFormula(s)}` },
      ...(s.showName ? [{ id: "name", value: nameOf(s).en }] : []),
      ...(s.showFormula ? [{ id: "formula", value: bookFormula(s) }] : []),
    ],
  }),
  parts: (s) => [
    ChainPart.Molecule,
    ...(s.canSetCarbons ? [ChainPart.Carbons] : []),
    ...(s.canSetShape ? [ChainPart.Shape] : []),
    ...(s.canSetBonds ? [ChainPart.Bond] : []),
    ...(s.canSetGroup ? [ChainPart.Group] : []),
  ],
});

/** A chain state from a few fields, the rest defaults: chainOf({ carbons: 4, shape: "branched" }). */
export function chainOf(c: Partial<ChainState>): ChainState {
  return { ...carbonChain.defaults, ...c };
}

export { subscript };
