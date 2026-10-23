import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { comboBuilder } from "./combo";
import { ComboView } from "./combo-view";
import { frustumCut } from "./frustum";
import { FrustumView } from "./frustum-view";
import { meltRecast } from "./recast";
import { RecastView } from "./recast-view";
import { solidsScene } from "./scene";
import { SolidsSceneView } from "./scene-view";
import { solidViewer } from "./viewer";
import { ViewerView } from "./viewer-view";

export {
  type Dims,
  type MeasureKey,
  type Measures,
  Pi,
  Solid,
  type Words,
  answerTex,
  clean,
  conesOfFrustum,
  formulasOf,
  measuresOf,
  numTex,
  numText,
  piValue,
  say,
  slantOfCone,
  slantOfFrustum,
  withUnit,
  workTex,
} from "./solids";
export {
  DIM_NAMES,
  Measure,
  TURNS,
  ViewerAction,
  ViewerDerived,
  ViewerPart,
  ViewerSignal,
  type ViewerState,
  dimsText,
  measuresOfState,
  solidViewer as solidViewerDef,
  turnAngles,
} from "./viewer";
export { type Combo, ComboKind, type Group, type Term, comboOf, totalOf } from "./combos";
export {
  ComboAction,
  ComboDerived,
  ComboPart,
  ComboSignal,
  type ComboState,
  Sum,
  comboBuilder as comboBuilderDef,
  groupsOf,
  sumsOf,
  termCount,
} from "./combo";
export {
  type Piece,
  RECAST_STEPS,
  type Recast,
  RecastAction,
  RecastDerived,
  RecastKind,
  RecastPart,
  RecastSignal,
  type RecastState,
  RecastStep,
  answerOf,
  answerText,
  meltRecast as meltRecastDef,
  recastOf,
  volumeAfter,
  volumeBefore,
} from "./recast";
export {
  FRUSTUM_STEPS,
  FrustumAction,
  FrustumDerived,
  FrustumMeasure,
  FrustumPart,
  FrustumSignal,
  type FrustumState,
  FrustumStep,
  frustumCut as frustumCutDef,
  frustumNumbers,
} from "./frustum";
export {
  SOLIDS_PICTURE,
  SolidsSceneKind,
  SolidsScenePart,
  type SolidsSceneState,
  describeSolidsScene,
  solidsScene as solidsSceneDef,
} from "./scene";

export const solidViewerProp: PropModule = { def: asAnyProp(solidViewer), View: ViewerView };
export const comboBuilderProp: PropModule = { def: asAnyProp(comboBuilder), View: ComboView };
export const meltRecastProp: PropModule = { def: asAnyProp(meltRecast), View: RecastView };
export const frustumCutProp: PropModule = { def: asAnyProp(frustumCut), View: FrustumView };
export const solidsSceneProp: PropModule = { def: asAnyProp(solidsScene), View: SolidsSceneView };

/** Every prop in this package. */
export const solidsProps: readonly PropModule[] = [
  solidViewerProp,
  comboBuilderProp,
  meltRecastProp,
  frustumCutProp,
  solidsSceneProp,
];
