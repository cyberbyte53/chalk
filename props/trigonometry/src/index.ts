import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { clinometer } from "./clinometer";
import { ClinometerView } from "./clinometer-view";
import { heightFinder } from "./heights";
import { HeightsView } from "./heights-view";
import { unitIdentity } from "./identity";
import { IdentityView } from "./identity-view";
import { trigRatios } from "./ratios";
import { RatiosView } from "./ratios-view";
import { trigScene } from "./scene";
import { TrigSceneView } from "./scene-view";
import { specialAngles } from "./special";
import { SpecialView } from "./special-view";

export {
  EXACT,
  PARTNER,
  RATIOS,
  RATIO_SIDES,
  Ratio,
  SIDE_WORDS,
  SPECIAL_ANGLES,
  Side,
  type SpecialAngle,
  type Words,
  isSpecial,
  ratioName,
  ratioTex,
  simplifySqrt,
  ratioValue,
} from "./trig";
export {
  GIVEN_STEPS,
  type GivenRatio,
  RatioReference,
  RatiosAction,
  RatiosDerived,
  RatiosPart,
  RatiosSignal,
  type RatiosState,
  SIZE_MAX,
  lengthsOf,
  trigRatios as trigRatiosDef,
  valuesOf,
  workingOf as ratiosWorkingOf,
} from "./ratios";
export {
  COLUMNS_OF,
  SPECIAL_WORKING,
  SpecialAction,
  SpecialDerived,
  SpecialMode,
  SpecialPart,
  SpecialSignal,
  type SpecialState,
  specialAngles as specialAnglesDef,
  stepCountOf as specialStepCountOf,
} from "./special";
export {
  DivideBy,
  IDENTITY_TEX,
  IdentityAction,
  IdentityDerived,
  IdentityPart,
  IdentitySignal,
  type IdentityState,
  SIDE_NAMES,
  checkOf,
  sidesOf as identitySidesOf,
  unitIdentity as unitIdentityDef,
} from "./identity";
export { PROBLEMS, Problem, type ProblemSpec } from "./problems";
export {
  HeightsAction,
  HeightsDerived,
  HeightsPart,
  HeightsSignal,
  type HeightsState,
  heightFinder as heightFinderDef,
  isSolvedOf,
  stepCountOf as heightsStepCountOf,
} from "./heights";
export {
  ClinoAction,
  ClinoDerived,
  ClinoPart,
  ClinoSignal,
  type ClinoState,
  ClinoTarget,
  SIGHT_TOLERANCE,
  clinometer as clinometerDef,
  computedHeightOf,
  isSightedOf,
  trueAngleOf,
} from "./clinometer";
export {
  TRIG_PICTURE,
  TrigSceneKind,
  TrigScenePart,
  type TrigSceneState,
  describeTrigScene,
  trigScene as trigSceneDef,
} from "./scene";

export const trigRatiosProp: PropModule = { def: asAnyProp(trigRatios), View: RatiosView };
export const specialAnglesProp: PropModule = { def: asAnyProp(specialAngles), View: SpecialView };
export const unitIdentityProp: PropModule = { def: asAnyProp(unitIdentity), View: IdentityView };
export const heightFinderProp: PropModule = { def: asAnyProp(heightFinder), View: HeightsView };
export const clinometerProp: PropModule = { def: asAnyProp(clinometer), View: ClinometerView };
export const trigSceneProp: PropModule = { def: asAnyProp(trigScene), View: TrigSceneView };

/** Every prop in this package. */
export const trigonometryProps: readonly PropModule[] = [
  trigRatiosProp,
  specialAnglesProp,
  unitIdentityProp,
  heightFinderProp,
  clinometerProp,
  trigSceneProp,
];
