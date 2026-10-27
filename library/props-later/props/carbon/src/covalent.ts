import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { ELEMENTS, type Element } from "./chem";

/**
 * Covalent bonds (NCERT 4.1), drawn the way the book draws them. Step 0: the atoms apart, each
 * with its valence electrons (one atom's as dots, the other's as crosses). Step 1: they come
 * together and share pairs of electrons, so each outer shell is full (2 for hydrogen, 8 for the
 * rest). Step 2: each shared pair drawn as a line, a single, double or triple bond.
 */

export const Molecule = {
  H2: "H2",
  Cl2: "Cl2",
  F2: "F2",
  O2: "O2",
  N2: "N2",
  H2O: "H2O",
  H2S: "H2S",
  NH3: "NH3",
  CH4: "CH4",
  CO2: "CO2",
  CH3Cl: "CH3Cl",
  C2H6: "C2H6",
  C2H4: "C2H4",
  C2H2: "C2H2",
} as const;
export type Molecule = (typeof Molecule)[keyof typeof Molecule];

/** An atom at (x, y) in bond lengths; `mark` is how its electrons are drawn. */
export type Atom = { el: Element; x: number; y: number; mark: "dot" | "cross" };
/** A bond between atoms a and b (indices), `order` shared pairs. */
export type Bond = { a: number; b: number; order: 1 | 2 | 3 };
export type Structure = {
  name: { en: string; hi: string };
  atoms: readonly Atom[];
  bonds: readonly Bond[];
};

const a = (el: Element, x: number, y: number, mark: "dot" | "cross" = "cross"): Atom => ({
  el,
  x,
  y,
  mark,
});

/** Every molecule, laid out with bonds along the axes so lone pairs have room on the free sides. */
export const MOLECULES: Readonly<Record<Molecule, Structure>> = {
  H2: {
    name: { en: "hydrogen", hi: "हाइड्रोजन" },
    atoms: [a("H", -0.5, 0, "dot"), a("H", 0.5, 0)],
    bonds: [{ a: 0, b: 1, order: 1 }],
  },
  Cl2: {
    name: { en: "chlorine", hi: "क्लोरीन" },
    atoms: [a("Cl", -0.5, 0, "dot"), a("Cl", 0.5, 0)],
    bonds: [{ a: 0, b: 1, order: 1 }],
  },
  F2: {
    name: { en: "fluorine", hi: "फ़्लोरीन" },
    atoms: [a("F", -0.5, 0, "dot"), a("F", 0.5, 0)],
    bonds: [{ a: 0, b: 1, order: 1 }],
  },
  O2: {
    name: { en: "oxygen", hi: "ऑक्सीजन" },
    atoms: [a("O", -0.5, 0, "dot"), a("O", 0.5, 0)],
    bonds: [{ a: 0, b: 1, order: 2 }],
  },
  N2: {
    name: { en: "nitrogen", hi: "नाइट्रोजन" },
    atoms: [a("N", -0.5, 0, "dot"), a("N", 0.5, 0)],
    bonds: [{ a: 0, b: 1, order: 3 }],
  },
  H2O: {
    name: { en: "water", hi: "जल" },
    atoms: [a("O", 0, 0, "dot"), a("H", -1, 0), a("H", 0, 1)],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
    ],
  },
  H2S: {
    name: { en: "hydrogen sulphide", hi: "हाइड्रोजन सल्फ़ाइड" },
    atoms: [a("S", 0, 0, "dot"), a("H", -1, 0), a("H", 0, 1)],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
    ],
  },
  NH3: {
    name: { en: "ammonia", hi: "अमोनिया" },
    atoms: [a("N", 0, 0, "dot"), a("H", -1, 0), a("H", 1, 0), a("H", 0, 1)],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
    ],
  },
  CH4: {
    name: { en: "methane", hi: "मेथेन" },
    atoms: [a("C", 0, 0, "dot"), a("H", -1, 0), a("H", 1, 0), a("H", 0, -1), a("H", 0, 1)],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 },
    ],
  },
  CO2: {
    name: { en: "carbon dioxide", hi: "कार्बन डाइऑक्साइड" },
    atoms: [a("C", 0, 0, "dot"), a("O", -1, 0), a("O", 1, 0)],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2, order: 2 },
    ],
  },
  CH3Cl: {
    name: { en: "chloromethane", hi: "क्लोरोमेथेन" },
    atoms: [a("C", 0, 0, "dot"), a("H", -1, 0), a("Cl", 1, 0), a("H", 0, -1), a("H", 0, 1)],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 },
    ],
  },
  C2H6: {
    name: { en: "ethane", hi: "एथेन" },
    atoms: [
      a("C", -0.5, 0, "dot"),
      a("C", 0.5, 0, "dot"),
      a("H", -1.5, 0),
      a("H", -0.5, -1),
      a("H", -0.5, 1),
      a("H", 1.5, 0),
      a("H", 0.5, -1),
      a("H", 0.5, 1),
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 0, b: 4, order: 1 },
      { a: 1, b: 5, order: 1 },
      { a: 1, b: 6, order: 1 },
      { a: 1, b: 7, order: 1 },
    ],
  },
  C2H4: {
    name: { en: "ethene", hi: "एथीन" },
    atoms: [
      a("C", -0.5, 0, "dot"),
      a("C", 0.5, 0, "dot"),
      a("H", -0.5, -1),
      a("H", -0.5, 1),
      a("H", 0.5, -1),
      a("H", 0.5, 1),
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2, order: 1 },
      { a: 0, b: 3, order: 1 },
      { a: 1, b: 4, order: 1 },
      { a: 1, b: 5, order: 1 },
    ],
  },
  C2H2: {
    name: { en: "ethyne", hi: "एथाइन" },
    atoms: [a("C", -0.5, 0, "dot"), a("C", 0.5, 0, "dot"), a("H", -1.5, 0), a("H", 1.5, 0)],
    bonds: [
      { a: 0, b: 1, order: 3 },
      { a: 0, b: 2, order: 1 },
      { a: 1, b: 3, order: 1 },
    ],
  },
};

/** For C–C bonds in the two-carbon molecules both carbons are "dot": mark one as crosses. */
export function marksOf(s: Structure): ("dot" | "cross")[] {
  const marks = s.atoms.map((t) => t.mark);
  // Two carbons side by side: the second one's electrons as crosses so the shared pairs read.
  const carbons = s.atoms.flatMap((t, i) => (t.el === "C" ? [i] : []));
  if (carbons.length === 2 && carbons[1] !== undefined) marks[carbons[1]] = "cross";
  // A hydrogen sharing with an atom drawn the same way takes the other mark, so every shared pair
  // shows one electron from each atom.
  for (const b of s.bonds) {
    for (const [h, other] of [
      [b.a, b.b],
      [b.b, b.a],
    ] as const) {
      if (s.atoms[h]?.el === "H" && marks[h] === marks[other])
        marks[h] = marks[other] === "dot" ? "cross" : "dot";
    }
  }
  return marks;
}

/** Bonds an atom takes part in, as the sum of their orders. */
export function bondsAt(s: Structure, i: number): number {
  return s.bonds.reduce((n, b) => (b.a === i || b.b === i ? n + b.order : n), 0);
}

/** Electrons the atom keeps to itself (its lone pairs × 2). */
export const loneElectrons = (s: Structure, i: number): number =>
  ELEMENTS[(s.atoms[i] as Atom).el].valence - bondsAt(s, i);

/** Electrons around the atom once bonded: its own plus the partners' share of each bond. */
export const outerCount = (s: Structure, i: number): number =>
  ELEMENTS[(s.atoms[i] as Atom).el].valence + bondsAt(s, i);

/** Every atom reaches a full outer shell (2 for H, 8 for the rest). */
export const isComplete = (s: Structure): boolean =>
  s.atoms.every((t, i) => outerCount(s, i) === ELEMENTS[t.el].full);

/** Covalent bonds counted the way NCERT Exercise 1 counts them: each shared pair is one bond. */
export const sharedPairsOf = (s: Structure): number => s.bonds.reduce((n, b) => n + b.order, 0);

export const COVALENT_STEPS = 3;

export const CovalentAction = { Next: "next", Reset: "reset", Pick: "pick" } as const;
export const CovalentSignal = { Stepped: "stepped", Picked: "picked" } as const;
export const CovalentDerived = {
  SharedPairs: "sharedPairs",
  Bonds: "bonds",
  Kinds: "kinds",
  IsShared: "isShared",
  Outer: "outer",
} as const;
export const CovalentPart = { Molecule: "molecule", Next: "next", Pick: "pick" } as const;

const covalentState = z
  .object({
    molecule: z.nativeEnum(Molecule),
    /** 0 apart, 1 sharing pairs, 2 bonds as lines. */
    step: z
      .number()
      .int()
      .min(0)
      .max(COVALENT_STEPS - 1),
    /** The molecules the learner can switch between (empty: no picker). */
    choices: z.array(z.nativeEnum(Molecule)).max(8),
    showShells: z.boolean(),
    showCounts: z.boolean(),
    canStep: z.boolean(),
  })
  .strict();
export type CovalentState = z.infer<typeof covalentState>;

const KIND_WORD = { 1: "single", 2: "double", 3: "triple" } as const;

export function describeCovalent(s: CovalentState): string {
  const m = MOLECULES[s.molecule];
  const kinds = [...new Set(m.bonds.map((b) => KIND_WORD[b.order]))].join(" and ");
  const what = `${m.name.en} (${s.molecule})`;
  if (s.step === 0)
    return `${what}: the atoms apart, each drawn with only its outermost (valence) electrons.`;
  if (s.step === 1)
    return `${what}: the atoms share ${sharedPairsOf(m)} pair(s) of electrons, so every atom has a full outer shell (${kinds} bond).`;
  return `${what}: each shared pair drawn as a line: ${kinds} bond(s), ${sharedPairsOf(m)} shared pair(s) in all.`;
}

const act = actionsFor<CovalentState>();

export const covalentBond = defineProp({
  type: "covalentBond",
  describe:
    "Electron-dot structures for simple covalent molecules (H₂, Cl₂, F₂, O₂, N₂, H₂O, H₂S, NH₃, CH₄, CO₂, CH₃Cl, C₂H₆, C₂H₄, C₂H₂). Step through: atoms apart with their valence electrons (one atom's dots, the other's crosses) → atoms sharing pairs so every outer shell is full → each shared pair as a line (single, double or triple bond).",
  state: covalentState,
  defaults: {
    molecule: Molecule.H2,
    step: 0,
    choices: [],
    showShells: true,
    showCounts: true,
    canStep: true,
  },
  inputs: ["molecule", "choices", "showShells", "showCounts", "canStep"],
  invariant: (s) =>
    s.choices.length === 0 || s.choices.includes(s.molecule)
      ? undefined
      : "the molecule shown must be one of the choices",
  derived: {
    [CovalentDerived.SharedPairs]: {
      describe: "Shared electron pairs in the molecule (each one is a covalent bond)",
      compute: (s) => sharedPairsOf(MOLECULES[s.molecule]),
    },
    [CovalentDerived.Bonds]: {
      describe: "Atom-to-atom links (a double bond is one link of two pairs)",
      compute: (s) => MOLECULES[s.molecule].bonds.length,
    },
    [CovalentDerived.Kinds]: {
      describe: "Which kinds of bond it has: single, double, triple",
      compute: (s) => [...new Set(MOLECULES[s.molecule].bonds.map((b) => KIND_WORD[b.order]))],
    },
    [CovalentDerived.IsShared]: {
      describe: "The atoms are drawn sharing (step 1 or 2)",
      compute: (s) => s.step > 0,
    },
    [CovalentDerived.Outer]: {
      describe: "Each atom's outer-shell electron count once bonded, in atom order",
      compute: (s) =>
        MOLECULES[s.molecule].atoms.map((_, i) => outerCount(MOLECULES[s.molecule], i)),
    },
  },
  actions: {
    [CovalentAction.Next]: act({
      describe: "The next step: apart → sharing → lines (stays on the last)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(s.step + 1, COVALENT_STEPS - 1);
        return set({ step }, { signal: CovalentSignal.Stepped, payload: { step } });
      },
    }),
    [CovalentAction.Reset]: act({
      describe: "Back to the atoms apart",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
    [CovalentAction.Pick]: act({
      describe: "Show another of the offered molecules, starting from the atoms apart",
      byLearner: true,
      args: z.object({ molecule: z.nativeEnum(Molecule) }).strict(),
      run: (s, args) =>
        s.choices.includes(args.molecule)
          ? set(
              { molecule: args.molecule, step: 0 },
              { signal: CovalentSignal.Picked, payload: { molecule: args.molecule } },
            )
          : set({}),
    }),
  },
  signals: {
    [CovalentSignal.Stepped]: { describe: "Moved to `step`" },
    [CovalentSignal.Picked]: { describe: "Switched to `molecule`" },
  },
  observe: (s) => ({
    summary: describeCovalent(s),
    elements: [{ id: CovalentPart.Molecule, value: describeCovalent(s) }],
  }),
  parts: (s) => [
    CovalentPart.Molecule,
    ...(s.canStep ? [CovalentPart.Next] : []),
    ...(s.choices.length > 0 ? [CovalentPart.Pick] : []),
  ],
});

export { ELEMENTS };
