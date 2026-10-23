import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { linePair } from "./line-pair";
import { LinePairView } from "./line-pair-view";
import { linearScene } from "./scene";
import { LinearSceneView } from "./scene-view";
import { solveSteps } from "./solve-steps";
import { SolveStepsView } from "./solve-steps-view";

export {
  Consistency,
  EquationForm,
  type Line,
  type Point,
  RatioTest,
  Relation,
  consistencyOf,
  equationOf,
  fracTex,
  fracText,
  handlesOf,
  isOnLine,
  lineThrough,
  ratioTestOf,
  ratiosOf,
  relationOf,
  solutionOf,
  triangleWith,
} from "./algebra";
export {
  Coefficient,
  LinePairAction,
  LinePairDerived,
  LinePairPart,
  LinePairSignal,
  type LinePairState,
  ShadeAxis,
  handlesFor,
  linePair as linePairDef,
  planeBox,
} from "./line-pair";
export {
  SolveStepsAction,
  SolveStepsDerived,
  SolveStepsPart,
  SolveStepsSignal,
  type SolveStepsState,
  choiceOf,
  needsChoice,
  solveSteps as solveStepsDef,
  workedOf,
} from "./solve-steps";
export {
  CAPTIONS,
  type Isolate,
  Method,
  Outcome,
  type Step,
  StepKind,
  type Worked,
  easiestEliminate,
  easiestIsolate,
  workedSolution,
} from "./steps";
export {
  LINEAR_PICTURE,
  LinearSceneKind,
  LinearScenePart,
  type LinearSceneState,
  describeLinearScene,
  linearScene as linearSceneDef,
} from "./scene";

export const linePairProp: PropModule = { def: asAnyProp(linePair), View: LinePairView };
export const solveStepsProp: PropModule = { def: asAnyProp(solveSteps), View: SolveStepsView };
export const linearSceneProp: PropModule = { def: asAnyProp(linearScene), View: LinearSceneView };

/** Every prop in this package, for the library. */
export const linearEquationsProps: readonly PropModule[] = [
  linePairProp,
  solveStepsProp,
  linearSceneProp,
];
