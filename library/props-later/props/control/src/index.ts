import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { brainMap } from "./brain";
import { BrainMapView } from "./brain-view";
import { endocrineMap } from "./endocrine";
import { EndocrineMapView } from "./endocrine-view";
import { plantHormones } from "./hormones";
import { PlantHormonesView } from "./hormones-view";
import { neuronSignal } from "./neuron";
import { NeuronSignalView } from "./neuron-view";
import { plantMovement } from "./plants";
import { PlantMovementView } from "./plants-view";
import { reflexArc } from "./reflex";
import { ReflexArcView } from "./reflex-view";
import { hormoneResponse } from "./response";
import { HormoneResponseView } from "./response-view";
import { controlScene } from "./scene";
import { ControlSceneView } from "./scene-view";

export { type Who, type Words, say } from "./draw";

export {
  LAST_NEURON_STEP,
  NEURON_STEPS,
  NeuronAction,
  NeuronAt,
  NeuronDerived,
  NeuronPart,
  NeuronSignal,
  type NeuronState,
  NeuronTarget,
  SignalForm,
  formAt,
  neuronCaption,
  neuronSignal as neuronSignalDef,
} from "./neuron";

export {
  BURN_AT,
  REFLEX_STEPS,
  ReflexAction,
  ReflexAt,
  ReflexDerived,
  ReflexPart,
  ReflexPath,
  ReflexSignal,
  type ReflexState,
  TICKS,
  atOf as reflexAtOf,
  isBurnt,
  reflexArc as reflexArcDef,
  ticksAt,
  totalTicks,
} from "./reflex";

export {
  BrainAction,
  BrainDerived,
  BrainPart,
  BrainRegion,
  BrainSignal,
  type BrainState,
  BrainTask,
  DIVISION_OF,
  Division,
  REGION_WORDS,
  TASKS as BRAIN_TASKS,
  brainMap as brainMapDef,
  isRightPart,
} from "./brain";

export {
  COIL_DAYS,
  Direction,
  MAX_DAYS as PLANT_MAX_DAYS,
  PlantAction,
  PlantDerived,
  PlantKind,
  PlantPart,
  PlantSignal,
  type PlantState,
  SEEDLING,
  Side,
  TUBE_DAYS,
  directionOf,
  growthOf,
  plantMovement as plantMovementDef,
  rootGoes,
  shadySide,
  shootGoes,
} from "./plants";

export const plantMovementProp: PropModule = {
  def: asAnyProp(plantMovement),
  View: PlantMovementView,
};
export {
  Effect,
  HORMONES as PLANT_HORMONES,
  HormoneAction,
  HormoneDerived,
  HormonePart,
  HormoneSignal,
  type HormoneState,
  PlantHormone,
  Spot,
  plantHormones as plantHormonesDef,
} from "./hormones";

export const plantHormonesProp: PropModule = {
  def: asAnyProp(plantHormones),
  View: PlantHormonesView,
};
export {
  Body,
  EndocrineAction,
  EndocrineDerived,
  EndocrinePart,
  EndocrineSignal,
  type EndocrineState,
  GLANDS,
  Gland,
  endocrineMap as endocrineMapDef,
  glandsOf,
} from "./endocrine";

export const endocrineMapProp: PropModule = {
  def: asAnyProp(endocrineMap),
  View: EndocrineMapView,
};
export {
  HISTORY as SUGAR_HISTORY,
  MAX_INSULIN,
  ResponseAction,
  ResponseDerived,
  ResponseMode,
  ResponsePart,
  ResponseSignal,
  type ResponseState,
  SUGAR,
  afterWait,
  hormoneResponse as hormoneResponseDef,
  isHigh as isSugarHigh,
  isNormal as isSugarNormal,
} from "./response";

export const hormoneResponseProp: PropModule = {
  def: asAnyProp(hormoneResponse),
  View: HormoneResponseView,
};
export {
  CONTROL_PICTURE,
  ControlScene,
  ControlScenePart,
  type ControlSceneState,
  controlScene as controlSceneDef,
  describeControlScene,
} from "./scene";

export const controlSceneProp: PropModule = {
  def: asAnyProp(controlScene),
  View: ControlSceneView,
};
export const brainMapProp: PropModule = { def: asAnyProp(brainMap), View: BrainMapView };
export const neuronSignalProp: PropModule = {
  def: asAnyProp(neuronSignal),
  View: NeuronSignalView,
};
export const reflexArcProp: PropModule = { def: asAnyProp(reflexArc), View: ReflexArcView };

/** Every control-and-coordination prop, for the library's `all` list. */
export const controlProps: readonly PropModule[] = [
  neuronSignalProp,
  reflexArcProp,
  brainMapProp,
  plantMovementProp,
  plantHormonesProp,
  endocrineMapProp,
  hormoneResponseProp,
  controlSceneProp,
];
