import type { BoardKit, PlacedOf } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { goalQuestion } from "@chalk/patterns";
import {
  AcidBenchAction,
  type AcidBenchKind,
  type AcidSceneKind,
  ArrowCondition,
  BalancerAction,
  BalancerDerived,
  type BalancerState,
  EquationSide,
  IndicatorAction,
  IndicatorId,
  type PhysicalState,
  type SubstanceId,
  acidBenchDef,
  acidIndicatorDef,
  acidsSceneDef,
  equationBalancerDef,
  solutionOf,
} from "@chalk/prop-chemistry";

/** A story picture. */
export function sceneOn(
  b: BoardKit,
  name: string,
  scene: (typeof AcidSceneKind)[keyof typeof AcidSceneKind],
  standsFor: string,
): PlacedOf<typeof acidsSceneDef> {
  const s = b.prop(acidsSceneDef, name, { scene });
  b.standsFor(s, standsFor);
  return s;
}

/** One of the chapter's experiments, played step by step by the learner. */
export function benchOn(
  b: BoardKit,
  name: string,
  kind: AcidBenchKind,
  options: { showEquation?: boolean } = {},
): PlacedOf<typeof acidBenchDef> {
  const bench = b.prop(acidBenchDef, name, {
    kind,
    step: 0,
    showNames: true,
    showObservations: true,
    showEquation: options.showEquation ?? false,
    canStep: true,
  });
  b.studentOnly(bench.action(AcidBenchAction.Next));
  b.studentOnly(bench.action(AcidBenchAction.Reset));
  return bench;
}

/** Watch-glasses of samples, and up to three indicators to try on them. */
export function indicatorOn(
  b: BoardKit,
  name: string,
  samples: SubstanceId[],
  indicators: IndicatorId[],
  options: { showTable?: boolean; showNature?: boolean } = {},
): PlacedOf<typeof acidIndicatorDef> {
  const first = indicators[0] ?? IndicatorId.RedLitmus;
  const prop = b.prop(acidIndicatorDef, name, {
    samples,
    indicators,
    chosen: first,
    tests: [],
    showNames: true,
    showTable: options.showTable ?? true,
    showNature: options.showNature ?? false,
    canTest: true,
  });
  b.studentOnly(prop.action(IndicatorAction.Choose));
  b.studentOnly(prop.action(IndicatorAction.Test));
  b.studentOnly(prop.action(IndicatorAction.Clear));
  return prop;
}

/** Every indicator on every sample: the learner actions that fill the table. */
export function fillTable(
  prop: PlacedOf<typeof acidIndicatorDef>,
  samples: SubstanceId[],
  indicators: IndicatorId[],
) {
  return indicators.flatMap((indicator) => [
    prop.learner(IndicatorAction.Choose, { indicator }),
    ...samples.map((sample) => prop.learner(IndicatorAction.Test, { sample })),
  ]);
}

/** A species: its formula (digits become subscripts) and, optionally, its state. */
export type Species = { formula: string; state?: PhysicalState };

/** A balancer state for any equation written as species (not only the Ch1 presets). */
export function equationOf(
  left: Species[],
  right: Species[],
  options: Partial<Omit<BalancerState, "left" | "right">> & { balanced?: boolean } = {},
): BalancerState {
  const { balanced = false, ...rest } = options;
  const base: BalancerState = {
    left: left.map((s) => ({ ...s })),
    right: right.map((s) => ({ ...s })),
    leftCoefficients: left.map(() => 1),
    rightCoefficients: right.map(() => 1),
    condition: ArrowCondition.None,
    showTally: true,
    showMolecules: false,
    showStates: false,
    canEdit: false,
    ...rest,
  };
  if (balanced) {
    const solution = solutionOf(base);
    if (solution !== null) {
      base.leftCoefficients = solution.left;
      base.rightCoefficients = solution.right;
    }
  }
  return base;
}

/** An equation to look at (balanced unless told otherwise), not editable. */
export function shownEquation(
  b: BoardKit,
  name: string,
  left: Species[],
  right: Species[],
  options: Partial<Omit<BalancerState, "left" | "right">> & { balanced?: boolean } = {},
): PlacedOf<typeof equationBalancerDef> {
  return b.prop(
    equationBalancerDef,
    name,
    equationOf(left, right, { balanced: true, showTally: false, ...options, canEdit: false }),
  );
}

/**
 * "Balance this": an editable, unbalanced equation with a goal that is met once every element has
 * as many atoms on each side. The witness types in the smallest balancing coefficients.
 */
export function balanceGoal(
  b: BoardKit,
  name: string,
  left: Species[],
  right: Species[],
  prompt: Localized,
  options: { showStates?: boolean; showMolecules?: boolean } = {},
) {
  const state = equationOf(left, right, {
    canEdit: true,
    showTally: true,
    showStates: options.showStates ?? false,
    showMolecules: options.showMolecules ?? false,
  });
  const eq = b.prop(equationBalancerDef, name, state);
  b.studentOnly(eq.action(BalancerAction.SetCoefficient));
  b.studentOnly(eq.action(BalancerAction.Step));
  const solution = solutionOf(state);
  if (solution === null) throw new Error(`balanceGoal: ${name} has no small solution`);
  const steps = [
    ...solution.left.map((value, index) => ({ side: EquationSide.Left, index, value })),
    ...solution.right.map((value, index) => ({ side: EquationSide.Right, index, value })),
  ]
    .filter((s) => s.value !== 1)
    .map((s) => eq.learner(BalancerAction.SetCoefficient, s));
  const goal = goalQuestion(b, {
    about: eq,
    prompt,
    isMet: eq.derived(BalancerDerived.IsBalanced),
    solve: steps,
  });
  return { eq, goal, solution };
}

/** Shorthand for species. */
export const sp = (formula: string, state?: PhysicalState): Species =>
  state === undefined ? { formula } : { formula, state };
