import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { beetlePopulation } from "./beetles";
import { BeetlePopulationView } from "./beetles-view";
import { chromosomeShuffle } from "./chromosomes";
import { ChromosomeShuffleView } from "./chromosomes-view";
import { crossSimulator } from "./cross";
import { CrossSimulatorView } from "./cross-view";
import { fossilLayers } from "./fossils";
import { FossilLayersView } from "./fossils-view";
import { limbBones } from "./limbs";
import { LimbBonesView } from "./limbs-view";
import { heredityScene } from "./scene";
import { HereditySceneView } from "./scene-view";

export {
  LETTER,
  LOOKS,
  Trait,
  allLooks,
  gametesOf,
  genotypesOfCross,
  isGenotype,
  lookKey,
  lookOf,
  looksOfCross,
  punnett,
  ratioOf,
  tidy,
} from "./genetics";

export {
  CrossAction,
  CrossDerived,
  CrossPart,
  CrossSignal,
  type CrossState,
  GrowMode,
  Parent,
  crossSimulator as crossSimulatorDef,
  genotypeRatioOf,
  isUniform,
  lookRatioOf,
  offspringOf,
} from "./cross";

export {
  SHUFFLE_STEPS,
  ShuffleAction,
  ShuffleDerived,
  ShuffleMode,
  ShufflePart,
  ShuffleSignal,
  type ShuffleState,
  ShuffleStep,
  Sperm,
  childSexOf,
  chromosomeShuffle as chromosomeShuffleDef,
  germPicks,
} from "./chromosomes";

export {
  APART,
  BeetleAction,
  BeetleColour,
  BeetleDerived,
  BeetleEvent,
  BeetleMode,
  BeetlePart,
  BeetleSignal,
  type BeetleState,
  CAPACITY,
  Food,
  SURVIVORS,
  beetlePopulation as beetlePopulationDef,
  breed,
  drift,
  fractionsOf,
  trample,
} from "./beetles";

export {
  LIMBS,
  Limb,
  LimbAction,
  LimbDerived,
  LimbPart,
  LimbSignal,
  type LimbState,
  Relation,
  Slot,
  limbBones as limbBonesDef,
  relationOf,
} from "./limbs";

export {
  FORM_STEPS,
  FossilAction,
  FossilDerived,
  FossilMode,
  FossilPart,
  FossilSignal,
  type FossilState,
  LAYERS,
  fossilLayers as fossilLayersDef,
} from "./fossils";

export {
  HeredityScene,
  HeredityScenePart,
  type HereditySceneState,
  describeHeredityScene,
  heredityScene as heredityStoryDef,
} from "./scene";

export const crossSimulatorProp: PropModule = {
  def: asAnyProp(crossSimulator),
  View: CrossSimulatorView,
};
export const chromosomeShuffleProp: PropModule = {
  def: asAnyProp(chromosomeShuffle),
  View: ChromosomeShuffleView,
};
export const beetlePopulationProp: PropModule = {
  def: asAnyProp(beetlePopulation),
  View: BeetlePopulationView,
};
export const limbBonesProp: PropModule = { def: asAnyProp(limbBones), View: LimbBonesView };
export const fossilLayersProp: PropModule = {
  def: asAnyProp(fossilLayers),
  View: FossilLayersView,
};
export const heredityStoryProp: PropModule = {
  def: asAnyProp(heredityScene),
  View: HereditySceneView,
};

/** Every heredity prop, for the library's `all` list. */
export const heredityProps: readonly PropModule[] = [
  crossSimulatorProp,
  chromosomeShuffleProp,
  beetlePopulationProp,
  limbBonesProp,
  fossilLayersProp,
  heredityStoryProp,
];
