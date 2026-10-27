import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { breathing } from "./breathing";
import { BreathingView } from "./breathing-view";
import { diffusionReach } from "./diffusion";
import { DiffusionReachView } from "./diffusion-view";
import { digestiveTract } from "./digestion";
import { DigestiveTractView } from "./digestion-view";
import { cellFeeding } from "./feeding";
import { CellFeedingView } from "./feeding-view";
import { heart } from "./heart";
import { HeartView } from "./heart-view";
import { leafLab } from "./leaf";
import { LeafLabView } from "./leaf-view";
import { nephron } from "./nephron";
import { NephronView } from "./nephron-view";
import { respirationPaths } from "./respiration";
import { RespirationPathsView } from "./respiration-view";
import { lifeScene } from "./scene";
import { LifeSceneView } from "./scene-view";
import { plantTransport } from "./transport";
import { PlantTransportView } from "./transport-view";

export {
  DiffusionAction,
  DiffusionDerived,
  DiffusionPart,
  DiffusionSignal,
  type DiffusionState,
  MAX_LAYERS,
  REACH,
  countsOf,
  depthOf,
  diffusionReach as diffusionReachDef,
  isFed,
  sideOf,
} from "./diffusion";

export {
  BELL_JAR_STEPS,
  LeafAction,
  LeafDerived,
  LeafMode,
  LeafPart,
  LeafSignal,
  type LeafState,
  VARIEGATED_STEPS,
  gasesOf,
  leafLab as leafLabDef,
  starchOf,
  stepCountOf,
} from "./leaf";

export {
  AMOEBA_STEPS,
  FeedingAction,
  FeedingDerived,
  FeedingKind,
  FeedingPart,
  FeedingSignal,
  type FeedingState,
  PARAMOECIUM_STEPS,
  cellFeeding as cellFeedingDef,
  feedingSteps,
} from "./feeding";

export {
  DigestionAction,
  DigestionDerived,
  DigestionMode,
  DigestionPart,
  DigestionSignal,
  type DigestionState,
  FORMS,
  type Form,
  JUICES,
  SALIVA_STEPS,
  STAGES,
  Stage,
  digestiveTract as digestiveTractDef,
  stageOf,
} from "./digestion";

export {
  GasSource,
  MAX_BUBBLES,
  MILKY,
  MILK_RATE,
  PATH_STEPS,
  PRODUCTS,
  RespirationAction,
  RespirationDerived,
  RespirationMode,
  RespirationPart,
  RespirationSignal,
  type RespirationState,
  Route,
  milkinessOf,
  placeOf,
  respirationPaths as respirationPathsDef,
} from "./respiration";

export {
  BreathingAction,
  BreathingDerived,
  BreathingMode,
  BreathingPart,
  BreathingSignal,
  type BreathingState,
  breathing as breathingDef,
} from "./breathing";

export {
  Chamber,
  HEART_STEPS,
  HeartAction,
  HeartDerived,
  HeartMode,
  HeartPart,
  HeartSignal,
  type HeartState,
  heart as heartDef,
} from "./heart";

export {
  BAG_STEPS,
  Season,
  TransportAction,
  TransportDerived,
  TransportMode,
  TransportPart,
  TransportSignal,
  type TransportState,
  mainForceOf,
  plantTransport as plantTransportDef,
} from "./transport";

export {
  Drink,
  FILTERED,
  FILTER_STEPS,
  FILTRATE_LITRES,
  NephronAction,
  NephronDerived,
  NephronMode,
  NephronPart,
  NephronSignal,
  type NephronState,
  SUBSTANCES,
  Substance,
  URINE,
  URINE_LITRES,
  inTubeAt,
  nephron as nephronDef,
  reabsorbedPercentOf,
} from "./nephron";

export {
  LIFE_PICTURE,
  LifeScene,
  LifeScenePart,
  type LifeSceneState,
  describeLifeScene,
  lifeScene as lifeSceneDef,
} from "./scene";

export const diffusionReachProp: PropModule = {
  def: asAnyProp(diffusionReach),
  View: DiffusionReachView,
};
export const leafLabProp: PropModule = { def: asAnyProp(leafLab), View: LeafLabView };
export const cellFeedingProp: PropModule = { def: asAnyProp(cellFeeding), View: CellFeedingView };
export const digestiveTractProp: PropModule = {
  def: asAnyProp(digestiveTract),
  View: DigestiveTractView,
};
export const respirationPathsProp: PropModule = {
  def: asAnyProp(respirationPaths),
  View: RespirationPathsView,
};
export const breathingProp: PropModule = { def: asAnyProp(breathing), View: BreathingView };
export const heartProp: PropModule = { def: asAnyProp(heart), View: HeartView };
export const plantTransportProp: PropModule = {
  def: asAnyProp(plantTransport),
  View: PlantTransportView,
};
export const nephronProp: PropModule = { def: asAnyProp(nephron), View: NephronView };
export const lifeSceneProp: PropModule = { def: asAnyProp(lifeScene), View: LifeSceneView };

/** Every life-processes prop, for the library's `all` list. */
export const lifeProps: readonly PropModule[] = [
  diffusionReachProp,
  leafLabProp,
  cellFeedingProp,
  digestiveTractProp,
  respirationPathsProp,
  breathingProp,
  heartProp,
  plantTransportProp,
  nephronProp,
  lifeSceneProp,
];
