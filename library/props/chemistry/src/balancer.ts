import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  ArrowCondition,
  EQUATIONS,
  type Equation,
  type EquationName,
  PhysicalState,
} from "./equations";
import {
  MAX_COEFFICIENT,
  balancingCoefficients,
  elementsOf,
  isFormula,
  prettyFormula,
  tallyOf,
} from "./formula";

/**
 * A chemical equation on a bench: reactants on the left, products on the right, a coefficient in
 * front of each formula. The formulae never change; only the coefficients do. Atoms are counted on
 * both sides, so it shows at once whether the equation is balanced.
 */

export const BalancerAction = { SetCoefficient: "setCoefficient", Step: "step" } as const;
export const BalancerSignal = { Changed: "changed", Balanced: "balanced" } as const;
export const BalancerDerived = {
  Tally: "tally",
  IsBalanced: "isBalanced",
  Solution: "solution",
  Elements: "elements",
} as const;
export const BalancerPart = {
  Equation: "equation",
  Tally: "tally",
  Molecules: "molecules",
} as const;

/** Which side of the arrow. */
export const EquationSide = { Left: "left", Right: "right" } as const;
export type EquationSide = (typeof EquationSide)[keyof typeof EquationSide];

const speciesSchema = z
  .object({
    /** As the book writes it, digits for subscripts: H2SO4, Ca(OH)2. */
    formula: z.string().refine(isFormula, "not a formula the balancer can read"),
    state: z.nativeEnum(PhysicalState).optional(),
  })
  .strict();

const coefficient = z.number().int().min(1).max(MAX_COEFFICIENT);

const balancerState = z
  .object({
    left: z.array(speciesSchema).min(1).max(4),
    right: z.array(speciesSchema).min(1).max(4),
    /** How many of each formula, in the same order as `left` and `right`. */
    leftCoefficients: z.array(coefficient).max(4),
    rightCoefficients: z.array(coefficient).max(4),
    condition: z.nativeEnum(ArrowCondition),
    /** Show the count of each element's atoms on both sides. */
    showTally: z.boolean(),
    /** Draw each molecule as coloured atoms, once per coefficient. */
    showMolecules: z.boolean(),
    /** Show the states of matter, (s) (l) (g) (aq). */
    showStates: z.boolean(),
    /** The learner can change the coefficients. */
    canEdit: z.boolean(),
  })
  .strict();
export type BalancerState = z.infer<typeof balancerState>;

/** An element's atoms on each side. */
export type TallyRow = { element: string; left: number; right: number };

const sideOf = (species: readonly { formula: string }[], coefficients: readonly number[]) =>
  species.map((sp, i) => ({ formula: sp.formula, coefficient: coefficients[i] ?? 1 }));

/** Atoms of every element on both sides, in the order the elements first appear. */
export function tallyRows(s: BalancerState): TallyRow[] {
  const l = tallyOf(sideOf(s.left, s.leftCoefficients));
  const r = tallyOf(sideOf(s.right, s.rightCoefficients));
  return elementsOf(
    s.left.map((sp) => sp.formula),
    s.right.map((sp) => sp.formula),
  ).map((element) => ({ element, left: l[element] ?? 0, right: r[element] ?? 0 }));
}

export function isEquationBalanced(s: BalancerState): boolean {
  return tallyRows(s).every((row) => row.left === row.right);
}

/** The smallest balancing coefficients, split by side, or null if none up to MAX_COEFFICIENT do it. */
export function solutionOf(s: BalancerState): { left: number[]; right: number[] } | null {
  const all = balancingCoefficients(
    s.left.map((sp) => sp.formula),
    s.right.map((sp) => sp.formula),
  );
  if (all === null) return null;
  return { left: all.slice(0, s.left.length), right: all.slice(s.left.length) };
}

/** The equation as text: 3Fe + 4H₂O → Fe₃O₄ + 4H₂ (a coefficient of 1 is not written). */
export function equationText(s: BalancerState): string {
  const side = (species: BalancerState["left"], cs: readonly number[]) =>
    species
      .map((sp, i) => {
        const c = cs[i] ?? 1;
        const state = s.showStates && sp.state !== undefined ? `(${sp.state})` : "";
        return `${c === 1 ? "" : c}${prettyFormula(sp.formula)}${state}`;
      })
      .join(" + ");
  const over = s.condition === ArrowCondition.None ? "" : ` [${s.condition}]`;
  return `${side(s.left, s.leftCoefficients)} →${over} ${side(s.right, s.rightCoefficients)}`;
}

/**
 * A balancer state for one of the chapter's equations: skeletal (every coefficient 1) unless
 * `balanced`, when it starts with the smallest balancing coefficients.
 */
export function equationState(
  name: EquationName,
  options: Partial<Omit<BalancerState, "left" | "right" | "condition">> & {
    balanced?: boolean;
  } = {},
): BalancerState {
  const eq: Equation = EQUATIONS[name];
  const { balanced = false, ...rest } = options;
  const base: BalancerState = {
    left: eq.left.map((sp) => ({ ...sp })),
    right: eq.right.map((sp) => ({ ...sp })),
    leftCoefficients: eq.left.map(() => 1),
    rightCoefficients: eq.right.map(() => 1),
    condition: eq.condition ?? ArrowCondition.None,
    showTally: true,
    showMolecules: false,
    showStates: false,
    canEdit: true,
  };
  if (balanced) {
    const solution = solutionOf(base);
    if (solution !== null) {
      base.leftCoefficients = solution.left;
      base.rightCoefficients = solution.right;
    }
  }
  return { ...base, ...rest };
}

const act = actionsFor<BalancerState>();

/** The new state after one coefficient changes, and what to announce. */
function change(s: BalancerState, side: EquationSide, index: number, value: number) {
  const key = side === EquationSide.Left ? "leftCoefficients" : "rightCoefficients";
  const list = [...s[key]];
  list[index] = Math.min(MAX_COEFFICIENT, Math.max(1, value));
  const next = { ...s, [key]: list };
  const balanced = isEquationBalanced(next);
  const emit = [
    {
      signal: BalancerSignal.Changed,
      payload: { side, index, value: list[index] as number, isBalanced: balanced },
    },
    ...(balanced && !isEquationBalanced(s)
      ? [{ signal: BalancerSignal.Balanced, payload: { equation: equationText(next) } }]
      : []),
  ];
  return set<BalancerState>({ [key]: list } as Partial<BalancerState>, ...emit);
}

const target = {
  side: z.nativeEnum(EquationSide),
  index: z.number().int().min(0).max(3),
};

export const equationBalancer = defineProp({
  type: "equationBalancer",
  describe:
    "A chemical equation with a coefficient in front of each formula: reactants on the left of the arrow, products on the right. The formulae stay fixed; only the coefficients (1 to 9) change. It counts each element's atoms on both sides, so it shows whether the equation is balanced (the same number of atoms of every element on both sides, as conservation of mass needs). It can draw each molecule as coloured atoms, and show states of matter and the condition on the arrow.",
  state: balancerState,
  defaults: equationState("ironSteam"),
  inputs: ["showTally", "showMolecules", "showStates", "canEdit"],
  invariant: (s) =>
    s.leftCoefficients.length === s.left.length && s.rightCoefficients.length === s.right.length
      ? undefined
      : "each formula needs exactly one coefficient",
  derived: {
    [BalancerDerived.Tally]: {
      describe: "Atoms of each element on the left and on the right: [{ element, left, right }]",
      compute: (s) => tallyRows(s),
    },
    [BalancerDerived.IsBalanced]: {
      describe: "Every element has as many atoms on the left as on the right",
      compute: (s) => isEquationBalanced(s),
    },
    [BalancerDerived.Solution]: {
      describe:
        "The smallest whole-number coefficients that balance it ({ left, right }), or null if none from 1 to 9 do",
      compute: (s) => solutionOf(s),
    },
    [BalancerDerived.Elements]: {
      describe: "The elements in the equation, in the order they first appear",
      compute: (s) => tallyRows(s).map((row) => row.element),
    },
  },
  actions: {
    [BalancerAction.SetCoefficient]: act({
      describe: "Put a coefficient (1 to 9) in front of one formula",
      byLearner: true,
      args: z.object({ ...target, value: coefficient }).strict(),
      run: (s, a) => change(s, a.side, a.index, a.value),
    }),
    [BalancerAction.Step]: act({
      describe: "Raise or lower one formula's coefficient by 1 (it stays between 1 and 9)",
      byLearner: true,
      args: z.object({ ...target, by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        const list = a.side === EquationSide.Left ? s.leftCoefficients : s.rightCoefficients;
        return change(s, a.side, a.index, (list[a.index] ?? 1) + a.by);
      },
    }),
  },
  signals: {
    [BalancerSignal.Changed]: {
      describe:
        "A coefficient changed; the payload says which, its new value and whether it balances",
    },
    [BalancerSignal.Balanced]: {
      describe: "The equation has just become balanced",
    },
  },
  observe: (s) => {
    const rows = tallyRows(s);
    const balanced = rows.every((row) => row.left === row.right);
    const off = rows.filter((row) => row.left !== row.right);
    const elements: Element[] = [
      { id: BalancerPart.Equation, value: equationText(s) },
      ...(s.showTally
        ? [
            {
              id: BalancerPart.Tally,
              value: rows
                .map((row) => `${row.element}: ${row.left} left, ${row.right} right`)
                .join("; "),
            },
          ]
        : []),
      ...(s.showMolecules
        ? [
            {
              id: BalancerPart.Molecules,
              value: "each molecule drawn as coloured atoms, once per coefficient",
            },
          ]
        : []),
    ];
    const summary = `${equationText(s)}: ${balanced ? "balanced" : `not balanced (${off.map((row) => `${row.element} ${row.left} vs ${row.right}`).join(", ")})`}`;
    return {
      summary,
      elements,
      hidden: s.showTally ? {} : { tally: rows },
    };
  },
  parts: (s) => [
    BalancerPart.Equation,
    ...(s.showTally ? [BalancerPart.Tally] : []),
    ...(s.showMolecules ? [BalancerPart.Molecules] : []),
  ],
});
