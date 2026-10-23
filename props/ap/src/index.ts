import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { gaussSum } from "./gauss";
import { GaussView } from "./gauss-view";
import { nthTerm } from "./nth";
import { NthView } from "./nth-view";
import { apScene } from "./scene";
import { ApSceneView } from "./scene-view";
import { apSequence } from "./sequence";
import { SequenceView } from "./sequence-view";

export {
  type Fraction,
  bracketTex,
  clean,
  differences,
  firstBreak,
  fracTex,
  fracText,
  generalText,
  isAP,
  isTermValue,
  nFor,
  numTex,
  numText,
  ordinal,
  signedText,
  sumOf,
  termName,
  termOf,
  termsOf,
  withUnit,
} from "./ap";
export {
  SequenceAction,
  SequenceDerived,
  SequencePart,
  SequenceSignal,
  type SequenceState,
  Verdict,
  apSequence as apSequenceDef,
  commonDifference,
  nextTerms,
  valuesOf,
  verdictOf,
} from "./sequence";
export {
  NthAction,
  NthDerived,
  NthPart,
  NthSignal,
  type NthState,
  SOLVE_STEPS,
  formulaTex,
  nForTarget,
  nthTerm as nthTermDef,
  targetIsTerm,
  termOfState,
  workingTex,
} from "./nth";
export {
  GAUSS_STEPS,
  GaussAction,
  GaussDerived,
  GaussMode,
  GaussPart,
  GaussSignal,
  type GaussState,
  MAX_BARS,
  gaussSum as gaussSumDef,
  lastOf,
  linesTex,
  pairSumOf,
  sumOfState,
} from "./gauss";
export {
  AP_PICTURE,
  ApSceneKind,
  ApScenePart,
  type ApSceneState,
  apScene as apSceneDef,
  describeApScene,
} from "./scene";

export const apSequenceProp: PropModule = { def: asAnyProp(apSequence), View: SequenceView };
export const nthTermProp: PropModule = { def: asAnyProp(nthTerm), View: NthView };
export const gaussSumProp: PropModule = { def: asAnyProp(gaussSum), View: GaussView };
export const apSceneProp: PropModule = { def: asAnyProp(apScene), View: ApSceneView };

/** Every prop in this package. */
export const apProps: readonly PropModule[] = [
  apSequenceProp,
  nthTermProp,
  gaussSumProp,
  apSceneProp,
];
