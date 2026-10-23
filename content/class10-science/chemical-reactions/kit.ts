import type { BoardKit, PlacedOf } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { goalQuestion } from "@chalk/content-source/patterns";
import {
  BalancerAction,
  BalancerDerived,
  type BalancerState,
  BenchAction,
  type BenchKind,
  type EquationName,
  EquationSide,
  equationBalancerDef,
  equationState,
  reactionBenchDef,
  solutionOf,
} from "@chalk/prop-chemistry";

/** A reaction bench the learner can run (and run again). */
export function benchOn(
  b: BoardKit,
  name: string,
  kind: BenchKind,
  options: { showThermometer?: boolean; showNames?: boolean } = {},
): PlacedOf<typeof reactionBenchDef> {
  const bench = b.prop(reactionBenchDef, name, {
    kind,
    isStarted: false,
    showThermometer: options.showThermometer ?? false,
    showNames: options.showNames ?? true,
    showObservations: true,
    canStart: true,
  });
  b.studentOnly(bench.action(BenchAction.Start));
  b.studentOnly(bench.action(BenchAction.Reset));
  return bench;
}

/** An equation to look at: balanced (or not), not editable. */
export function equationOn(
  b: BoardKit,
  name: string,
  equation: EquationName,
  options: Partial<Omit<BalancerState, "left" | "right" | "condition">> & {
    balanced?: boolean;
  } = {},
): PlacedOf<typeof equationBalancerDef> {
  return b.prop(equationBalancerDef, name, equationState(equation, { canEdit: false, ...options }));
}

/**
 * "Balance this": an editable equation, unbalanced, with a goal that is met once every element
 * has as many atoms on each side. The witness types in the smallest balancing coefficients.
 */
export function balanceGoal(
  b: BoardKit,
  name: string,
  equation: EquationName,
  prompt: Localized,
  options: { showMolecules?: boolean; showStates?: boolean } = {},
) {
  const state = equationState(equation, {
    canEdit: true,
    showTally: true,
    showMolecules: options.showMolecules ?? false,
    showStates: options.showStates ?? false,
  });
  const eq = b.prop(equationBalancerDef, name, state);
  b.studentOnly(eq.action(BalancerAction.SetCoefficient));
  b.studentOnly(eq.action(BalancerAction.Step));
  const solution = solutionOf(state);
  if (solution === null) throw new Error(`balanceGoal: ${equation} has no solution up to 9`);
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
