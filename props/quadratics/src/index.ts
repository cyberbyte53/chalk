import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { areaBuilder } from "./area";
import { AreaView } from "./area-view";
import { rootsGraph } from "./roots";
import { RootsView } from "./roots-view";
import { quadraticScene } from "./scene";
import { QuadraticSceneView } from "./scene-view";
import { middleSplit } from "./split";
import { SplitView } from "./split-view";
import { squareTiles } from "./tiles";
import { TilesView } from "./tiles-view";

export {
  NATURE_WORDS,
  Nature,
  completedTex,
  discriminant,
  factorPairs,
  fracTex,
  natureOf,
  quadTex,
  quadText,
  realRoots,
  rootsTex,
  simplifySqrt,
  splitPair,
  splitWorking,
} from "./quad";
export {
  AreaAction,
  AreaDerived,
  AreaPart,
  AreaSignal,
  type AreaState,
  areaBuilder as areaBuilderDef,
  areaOf,
  lengthOf,
} from "./area";
export {
  SplitAction,
  SplitDerived,
  SplitPart,
  SplitSignal,
  type SplitState,
  middleSplit as middleSplitDef,
} from "./split";
export {
  MAX_B,
  TILE_STEPS,
  TilesAction,
  TilesDerived,
  TilesPart,
  TilesSignal,
  type TilesState,
  squareTiles as squareTilesDef,
} from "./tiles";
export {
  Coefficient,
  RootsAction,
  RootsDerived,
  RootsPart,
  RootsSignal,
  type RootsState,
  rootsGraph as rootsGraphDef,
} from "./roots";
export {
  QUADRATIC_PICTURE,
  QuadraticSceneKind,
  QuadraticScenePart,
  type QuadraticSceneState,
  describeQuadraticScene,
  quadraticScene as quadraticSceneDef,
} from "./scene";

export const areaBuilderProp: PropModule = { def: asAnyProp(areaBuilder), View: AreaView };
export const middleSplitProp: PropModule = { def: asAnyProp(middleSplit), View: SplitView };
export const squareTilesProp: PropModule = { def: asAnyProp(squareTiles), View: TilesView };
export const rootsGraphProp: PropModule = { def: asAnyProp(rootsGraph), View: RootsView };
export const quadraticSceneProp: PropModule = {
  def: asAnyProp(quadraticScene),
  View: QuadraticSceneView,
};

/** Every prop in this package, for the library. */
export const quadraticsProps: readonly PropModule[] = [
  areaBuilderProp,
  middleSplitProp,
  squareTilesProp,
  rootsGraphProp,
  quadraticSceneProp,
];
