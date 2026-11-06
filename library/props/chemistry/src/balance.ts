import { Ease, PropRole, action, colorSchema, prop, signal } from "@chalk/prop";
import { z } from "zod";
import {
  MAX_COEFFICIENT,
  atomsOf,
  balancingCoefficients,
  elementsOf,
  isFormula,
  prettyFormula,
  tallyOf,
} from "./formula";

/** Which side of the arrow: named as the variables that hold it. */
export const Side = { Reactants: "reactants", Products: "products" } as const;
export type Side = (typeof Side)[keyof typeof Side];

const termSchema = z
  .object({
    /** As the book writes it, digits for subscripts: H2O, Fe3O4, Ca(OH)2. */
    formula: z.string().refine(isFormula, "not a formula: element symbols, counts, brackets"),
    coefficient: z.number().int().min(1).max(MAX_COEFFICIENT),
  })
  .strict();
export type Term = z.infer<typeof termSchema>;

const sideSchema = z.array(termSchema).min(1).max(4);
const index = z.number().int().min(0).max(3);
const coefficient = z.number().int().min(1).max(MAX_COEFFICIENT);

/**
 * Each element's colour as the content picks it (a role of the look, or #rrggbb): what molecule
 * models are usually drawn in. White hydrogen, red oxygen, charcoal carbon, blue nitrogen.
 */
export const ELEMENT_COLORS: Readonly<Record<string, string>> = {
  H: "#f4f5f7",
  O: "#e5484d",
  C: "#3b3f4a",
  N: "#3e63dd",
  S: "#f1c21b",
  Cl: "#30a46c",
  Fe: "#b8662d",
  Cu: "#d0844f",
  Mg: "#b7bcc6",
  Zn: "#9aa3b2",
  Al: "#c9ced6",
  Ca: "#2f9e8f",
  Na: "#8e4ec6",
  K: "#a35dd4",
  Pb: "#5b6170",
  Ag: "#d7dbe0",
  Ba: "#7c8a3a",
};

/** One element's atoms on each side. */
export type TallyRow = { element: string; left: number; right: number };

type Sides = { reactants: readonly Term[]; products: readonly Term[] };

/** Atoms of every element on both sides, in the order the elements first appear. */
export function tallyRows(s: Sides): TallyRow[] {
  const l = tallyOf(s.reactants);
  const r = tallyOf(s.products);
  return elementsOf(
    s.reactants.map((t) => t.formula),
    s.products.map((t) => t.formula),
  ).map((element) => ({ element, left: l[element] ?? 0, right: r[element] ?? 0 }));
}

export const isBalancedNow = (s: Sides): boolean =>
  tallyRows(s).every((row) => row.left === row.right);

/** The equation as text: 2H₂ + O₂ → 2H₂O (a coefficient of 1 is not written). */
export function equationOf(s: Sides): string {
  const side = (terms: readonly Term[]) =>
    terms
      .map((t) => `${t.coefficient === 1 ? "" : t.coefficient}${prettyFormula(t.formula)}`)
      .join(" + ");
  return `${side(s.reactants)} → ${side(s.products)}`;
}

/** The smallest balancing coefficients, by side, or null if none up to 6 do it. */
export function solutionOf(s: Sides): { reactants: number[]; products: number[] } | null {
  const all = balancingCoefficients(
    s.reactants.map((t) => t.formula),
    s.products.map((t) => t.formula),
  );
  if (all === null) return null;
  return { reactants: all.slice(0, s.reactants.length), products: all.slice(s.reactants.length) };
}

/** Seconds for a molecule to pop in or out. */
const SECONDS_TO_POP = 0.55;
/** Seconds for every atom to fly across, one after another, and back. */
export const SECONDS_TO_REGROUP = 2.6;
const SECONDS_TO_UNGROUP = 1.6;

const where = { side: z.nativeEnum(Side), index };

/**
 * A chemical equation drawn as its molecules, each molecule as its atoms (coloured balls, joined),
 * drawn as many times as its coefficient; each element's atoms counted on both sides. Only the
 * coefficients change. Balanced when every element has as many atoms on each side: atoms are
 * neither made nor lost, only regrouped, so then the left's atoms can be moved across into the
 * right's molecules.
 */
export const equationBalance = prop({
  type: "equationBalance",
  role: PropRole.Explainer,
  describe:
    "A chemical equation drawn as its molecules: reactants left of the arrow, products right, each molecule as coloured balls for its atoms, drawn as many times as its coefficient (1 to 6). Under it, each element's atoms are counted on both sides; a row is red while they differ. Only the coefficients change, with + and − under each molecule. It is balanced when every element has as many atoms on both sides (conservation of mass: atoms are neither made nor lost); then the atoms on the left can be moved across to make the molecules on the right.",
  variables: z
    .object({
      reactants: sideSchema,
      products: sideSchema,
      /** Each element's colour, by its symbol; one without is drawn grey. */
      colors: z.record(z.string(), colorSchema),
      /** The molecule whose copies pop in or out now, and its coefficient before; or none. */
      pop: z
        .object({ ...where, was: coefficient })
        .strict()
        .nullable(),
      /** How far the pop has gone, 0 to 1. */
      popped: z.number().min(0).max(1),
      /** 0: every atom in its molecule on the left; 1: moved across into the right's molecules. */
      regrouped: z.number().min(0).max(1),
    })
    .strict(),
  start: {
    reactants: [
      { formula: "H2", coefficient: 1 },
      { formula: "O2", coefficient: 1 },
    ],
    products: [{ formula: "H2O", coefficient: 1 }],
    colors: ELEMENT_COLORS,
    pop: null,
    popped: 0,
    regrouped: 0,
  },
  facts: {
    tally: (me) => tallyRows(me),
    isBalanced: (me) => isBalancedNow(me),
    equation: (me) => equationOf(me),
    solution: (me) => solutionOf(me),
  },
  actions: {
    step: action(
      { ...where, by: z.union([z.literal(1), z.literal(-1)]) },
      {
        from: "screen",
        describe:
          "One molecule more or fewer of this formula (the learner's + and −): its new copy pops in, or its last pops out",
      },
    ),
    setCoefficient: action(
      { ...where, coefficient },
      {
        describe:
          "Put this coefficient (1 to 6) in front of one formula, its copies popping in or out",
      },
    ),
    startAgain: action(
      {},
      { from: "screen", describe: "Every coefficient back to 1 (the learner's ↺)" },
    ),
    regroup: action(
      {},
      {
        from: "screen",
        describe:
          "Once balanced: the atoms on the left fly across, one after another, into the molecules on the right",
      },
    ),
    ungroup: action(
      {},
      { from: "screen", describe: "The atoms fly back into the molecules on the left" },
    ),
  },
  signals: {
    counted: signal({ ...where, coefficient, isBalanced: z.boolean() }),
    balanced: signal({ equation: z.string() }),
    regrouped: signal({}),
    ungrouped: signal({}),
  },
  on: {
    step: (me, { side, index: i, by }, t) => {
      const term = me[side][i];
      if (term === undefined) return;
      const to = term.coefficient + by;
      return (
        to >= 1 &&
        to <= MAX_COEFFICIENT &&
        t.self.setCoefficient({ side, index: i, coefficient: to })
      );
    },
    setCoefficient: (me, { side, index: i, coefficient: to }, t) => {
      const term = me[side][i];
      if (term === undefined || to === term.coefficient) return;
      const terms = me[side].map((x, k) => (k === i ? { ...x, coefficient: to } : x));
      const patch = side === Side.Reactants ? { reactants: terms } : { products: terms };
      const next = { reactants: me.reactants, products: me.products, ...patch };
      const isBalanced = isBalancedNow(next);
      // Its copies pop in (or out), then it is counted; atoms go back into their own molecules.
      return [
        t.set({
          ...patch,
          pop: { side, index: i, was: term.coefficient },
          popped: 0,
          regrouped: 0,
        }),
        t.move("popped", 1, SECONDS_TO_POP, {
          atEnd: [
            t.set({ pop: null, popped: 0 }),
            t.tell.counted({ side, index: i, coefficient: to, isBalanced }),
            ...(isBalanced && !me.isBalanced
              ? [t.tell.balanced({ equation: equationOf(next) })]
              : []),
          ],
        }),
      ];
    },
    startAgain: (me, _, t) =>
      [...me.reactants, ...me.products].some((term) => term.coefficient !== 1) && [
        t.stop(),
        t.set({
          reactants: me.reactants.map((term) => ({ ...term, coefficient: 1 })),
          products: me.products.map((term) => ({ ...term, coefficient: 1 })),
          pop: null,
          popped: 0,
          regrouped: 0,
        }),
      ],
    regroup: (me, _, t) =>
      isBalancedNow(me) &&
      me.regrouped < 1 &&
      t.move("regrouped", 1, SECONDS_TO_REGROUP * (1 - me.regrouped), {
        atEnd: [t.tell.regrouped({})],
      }),
    ungroup: (me, _, t) =>
      me.regrouped > 0 &&
      t.move("regrouped", 0, SECONDS_TO_UNGROUP * me.regrouped, {
        ease: Ease.Smooth,
        atEnd: [t.tell.ungrouped({})],
      }),
  },
  summary: (me) => {
    const off = me.tally.filter((row) => row.left !== row.right);
    return `${me.equation}: ${
      off.length === 0
        ? "balanced"
        : `not balanced (${off.map((row) => `${row.element} ${row.left} vs ${row.right}`).join(", ")})`
    }`;
  },
  invariant: (s) => {
    const left = new Set(s.reactants.flatMap((t) => Object.keys(atomsOf(t.formula))));
    const right = new Set(s.products.flatMap((t) => Object.keys(atomsOf(t.formula))));
    const lost = [...left].filter((el) => !right.has(el));
    const made = [...right].filter((el) => !left.has(el));
    if (lost.length + made.length > 0)
      return `every element must be on both sides (atoms are neither made nor lost): ${[...lost, ...made].join(", ")}`;
    if (s.pop !== null && s[s.pop.side][s.pop.index] === undefined)
      return "a pop names a molecule that isn't there";
    return undefined;
  },
});
