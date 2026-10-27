import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { acidProps } from "./acid-index";
import { equationBalancer } from "./balancer";
import { BalancerView } from "./balancer-view";
import { reactionBench } from "./bench";
import { BenchView } from "./bench-view";
import { electrolysisCell } from "./electrolysis";
import { ElectrolysisView } from "./electrolysis-view";
import { metalsProps } from "./metals";
import { particleSwap } from "./particles";
import { ParticlesView } from "./particles-view";
import { chemistryScene } from "./scene";
import { ChemistrySceneView } from "./scene-view";

export {
  BalancerAction,
  BalancerDerived,
  BalancerPart,
  BalancerSignal,
  type BalancerState,
  EquationSide,
  type TallyRow,
  equationBalancer as equationBalancerDef,
  equationState,
  equationText,
  isEquationBalanced,
  solutionOf,
  tallyRows,
} from "./balancer";
export {
  ArrowCondition,
  CONDITION_WORDS,
  EQUATIONS,
  EQUATION_NAMES,
  type Equation,
  type EquationName,
  PhysicalState,
  type Species,
} from "./equations";
export {
  MAX_COEFFICIENT,
  atomsOf,
  balancingCoefficients,
  formulaRuns,
  isBalanced,
  prettyFormula,
  tallyOf,
} from "./formula";
export {
  BENCH,
  BenchAction,
  BenchDerived,
  BenchKind,
  BenchPart,
  BenchSignal,
  type BenchState,
  PLAY_SECONDS,
  ReactionSign,
  Temperature,
  describeBench,
  reactionBench as reactionBenchDef,
} from "./bench";
export {
  ElectrolysisAction,
  ElectrolysisDerived,
  ElectrolysisPart,
  ElectrolysisSignal,
  type ElectrolysisState,
  FILL_SECONDS,
  TUBE_ML,
  Tube as ElectrolysisTube,
  candleResult,
  describeElectrolysis,
  electrolysisCell as electrolysisCellDef,
} from "./electrolysis";
export {
  SWAPS,
  SWAP_STEPS,
  SwapAction,
  SwapDerived,
  SwapKind,
  SwapPart,
  SwapSignal,
  type SwapState,
  describeSwap,
  particleSwap as particleSwapDef,
} from "./particles";
export {
  ChemistrySceneKind,
  ChemistryScenePart,
  type ChemistrySceneState,
  chemistryScene as chemistrySceneDef,
  describeChemistryScene,
} from "./scene";

export const equationBalancerProp: PropModule = {
  def: asAnyProp(equationBalancer),
  View: BalancerView,
};
export const reactionBenchProp: PropModule = { def: asAnyProp(reactionBench), View: BenchView };
export const electrolysisCellProp: PropModule = {
  def: asAnyProp(electrolysisCell),
  View: ElectrolysisView,
};
export const particleSwapProp: PropModule = { def: asAnyProp(particleSwap), View: ParticlesView };
export const chemistrySceneProp: PropModule = {
  def: asAnyProp(chemistryScene),
  View: ChemistrySceneView,
};

/** Every chemistry prop, for the library. */
export const chemistryProps: readonly PropModule[] = [
  equationBalancerProp,
  reactionBenchProp,
  electrolysisCellProp,
  particleSwapProp,
  chemistrySceneProp,
  ...metalsProps,
  ...acidProps,
];

export * from "./metals";

export * from "./acid-index";
