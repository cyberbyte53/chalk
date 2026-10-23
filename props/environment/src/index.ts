import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { wasteBurial } from "./burial";
import { WasteBurialView } from "./burial-view";
import { cupChoice } from "./cups";
import { CupChoiceView } from "./cups-view";
import { ecosystem } from "./ecosystem";
import { EcosystemView } from "./ecosystem-view";
import { foodChain } from "./food-chain";
import { FoodChainView } from "./food-chain-view";
import { bioMagnification } from "./magnification";
import { BioMagnificationView } from "./magnification-view";
import { ozoneLayer } from "./ozone";
import { OzoneLayerView } from "./ozone-view";
import { environmentScene } from "./scene";
import { EnvironmentSceneView } from "./scene-view";
import { wasteSorter } from "./sorter";
import { WasteSorterView } from "./sorter-view";

export {
  EcoAction,
  EcoDerived,
  EcoPart,
  EcoProblem,
  EcoSignal,
  type EcoState,
  EcoThing,
  FISH_LIMIT,
  MAX_FISH,
  MAX_SNAILS,
  abioticOf,
  bioticOf,
  describeEcosystem,
  ecosystem as ecosystemDef,
  isSelfSustaining,
  problemsOf as ecoProblemsOf,
} from "./ecosystem";

export {
  CHAINS,
  ChainAction,
  ChainDerived,
  ChainMode,
  ChainPart,
  ChainSignal,
  type ChainState,
  Effect,
  Habitat,
  LEVEL_KINDS,
  LevelKind,
  PASS_ON,
  PLANT_SHARE,
  SUNLIGHT_KJ,
  WEB_EATEN_BY,
  WEB_NODES,
  chainOf,
  chainsInWeb,
  describeChain,
  eatenBy,
  eats,
  effectsOf,
  energyAt,
  foodChain as foodChainDef,
} from "./food-chain";

export {
  MAG_CHAINS,
  MAGNIFY,
  MagAction,
  MagDerived,
  MagPart,
  MagSetting,
  MagSignal,
  type MagState,
  bioMagnification as bioMagnificationDef,
  describeMagnification,
  doseAt,
} from "./magnification";

export {
  FORMATION_STEPS,
  MAX_CFC,
  OzoneAction,
  OzoneDerived,
  OzoneMode,
  OzonePart,
  OzoneSignal,
  type OzoneState,
  UV_RAYS,
  describeOzone,
  ozoneLayer as ozoneLayerDef,
  ozoneShareOf,
  uvThroughOf,
} from "./ozone";

export {
  ROT_DAYS,
  WASTE_ITEMS,
  WASTE_WORDS,
  WasteItem,
  isBiodegradable,
  leftAfter,
} from "./waste";

export {
  BurialAction,
  BurialDerived,
  BurialPart,
  BurialSignal,
  type BurialState,
  CHECK_EVERY,
  MAX_DAYS,
  changedAt,
  describeBurial,
  fastestOf,
  goneAt,
  wasteBurial as wasteBurialDef,
} from "./burial";

export {
  Bin,
  SortAction,
  SortDerived,
  SortPart,
  SortSignal,
  type SortState,
  binOf,
  describeSorter,
  nextOf,
  rightOf,
  wasteSorter as wasteSorterDef,
} from "./sorter";

export {
  CUPS,
  CUP_FACTS,
  CUP_QUESTIONS,
  Cup,
  CupAction,
  CupDerived,
  CupPart,
  CupQuestion,
  CupSignal,
  type CupState,
  cupChoice as cupChoiceDef,
  describeCups,
  isGood,
  problemsOf as cupProblemsOf,
} from "./cups";

export {
  ENV_PICTURE,
  EnvScene,
  EnvScenePart,
  type EnvSceneState,
  describeEnvScene,
  environmentScene as environmentSceneDef,
} from "./scene";

export const ecosystemProp: PropModule = { def: asAnyProp(ecosystem), View: EcosystemView };
export const foodChainProp: PropModule = { def: asAnyProp(foodChain), View: FoodChainView };
export const bioMagnificationProp: PropModule = {
  def: asAnyProp(bioMagnification),
  View: BioMagnificationView,
};
export const ozoneLayerProp: PropModule = { def: asAnyProp(ozoneLayer), View: OzoneLayerView };
export const wasteBurialProp: PropModule = { def: asAnyProp(wasteBurial), View: WasteBurialView };
export const wasteSorterProp: PropModule = { def: asAnyProp(wasteSorter), View: WasteSorterView };
export const cupChoiceProp: PropModule = { def: asAnyProp(cupChoice), View: CupChoiceView };
export const environmentSceneProp: PropModule = {
  def: asAnyProp(environmentScene),
  View: EnvironmentSceneView,
};

/** Every prop in this package, for the library. */
export const environmentProps: readonly PropModule[] = [
  ecosystemProp,
  foodChainProp,
  bioMagnificationProp,
  ozoneLayerProp,
  wasteBurialProp,
  wasteSorterProp,
  cupChoiceProp,
  environmentSceneProp,
];
