import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { fiveRs } from "./five-rs";
import { FiveRsView } from "./five-rs-view";
import { fossilClock } from "./fossil";
import { FossilClockView } from "./fossil-view";
import { riverHealth } from "./river";
import { RiverHealthView } from "./river-view";
import { resourcesScene } from "./scene";
import { ResourcesSceneView } from "./scene-view";
import { stakeholders } from "./stakeholders";
import { ForestStakeholdersView } from "./stakeholders-view";
import { waterHarvest } from "./water";
import { WaterHarvestView } from "./water-view";

export {
  DEEDS,
  DEED_WORDS,
  Deed,
  FiveRAction,
  FiveRDerived,
  FiveRPart,
  FiveRSignal,
  type FiveRsState,
  R,
  RS,
  R_MEANING,
  R_OF,
  R_WORDS,
  describeFiveRs,
  fiveRs as fiveRsDef,
  nextOf as fiveRsNextOf,
  rightOf as fiveRsRightOf,
} from "./five-rs";

export {
  Coliform,
  Fish,
  RiverAction,
  RiverDerived,
  RiverMode,
  RiverPart,
  RiverSignal,
  type RiverState,
  SOURCES,
  Sample,
  Source,
  coliformOf,
  describeRiver,
  fishOf,
  isSafeOf,
  isToxicOf,
  phBand,
  riverHealth as riverHealthDef,
} from "./river";

export {
  CASE_STEPS,
  Dependence,
  FOREST_CASES,
  ForestCase,
  STAKEHOLDERS,
  STAKE_FACTS,
  StakeAction,
  StakeDerived,
  StakeMode,
  StakePart,
  StakeSignal,
  type StakeState,
  Stakeholder,
  describeStakeholders,
  stakeholders as stakeholdersDef,
  stepCountOf as caseStepCountOf,
} from "./stakeholders";

export {
  KHADIN_STEPS,
  KULH_VILLAGES,
  SCHEMES,
  SCHEME_FACTS,
  SCHEME_POINTS,
  Scheme,
  SchemePoint,
  WaterAction,
  WaterDerived,
  WaterMode,
  WaterPart,
  WaterSignal,
  type WaterState,
  describeWater,
  problemsOf as schemeProblemsOf,
  stepCountOf as waterStepCountOf,
  waterHarvest as waterHarvestDef,
  wateredOf,
  wellLevelOf,
} from "./water";

export {
  Air,
  CHOICES,
  CHOICE_OPTIONS,
  COAL_YEARS,
  CUT_STEP,
  Choice,
  FossilAction,
  FossilDerived,
  FossilMode,
  FossilPart,
  FossilSignal,
  type FossilState,
  MAX_CUT,
  PETROLEUM_YEARS,
  Product,
  describeFossil,
  fossilClock as fossilClockDef,
  poisonousOf,
  productsOf,
  savedOf,
  yearsOf,
} from "./fossil";

export {
  RES_PICTURE,
  ResScene,
  ResScenePart,
  type ResSceneState,
  describeResScene,
  resourcesScene as resourcesSceneDef,
} from "./scene";

export const fiveRsProp: PropModule = { def: asAnyProp(fiveRs), View: FiveRsView };
export const riverHealthProp: PropModule = { def: asAnyProp(riverHealth), View: RiverHealthView };
export const stakeholdersProp: PropModule = {
  def: asAnyProp(stakeholders),
  View: ForestStakeholdersView,
};
export const waterHarvestProp: PropModule = {
  def: asAnyProp(waterHarvest),
  View: WaterHarvestView,
};
export const fossilClockProp: PropModule = { def: asAnyProp(fossilClock), View: FossilClockView };
export const resourcesSceneProp: PropModule = {
  def: asAnyProp(resourcesScene),
  View: ResourcesSceneView,
};

/** Every prop in this package, for the library. */
export const resourcesProps: readonly PropModule[] = [
  fiveRsProp,
  riverHealthProp,
  stakeholdersProp,
  waterHarvestProp,
  fossilClockProp,
  resourcesSceneProp,
];
