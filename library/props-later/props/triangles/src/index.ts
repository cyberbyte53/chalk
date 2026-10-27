import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { areaTiles } from "./areas";
import { AreasView } from "./areas-view";
import { proportionLine } from "./bpt";
import { BptView } from "./bpt-view";
import { triangleMatch } from "./match";
import { MatchView } from "./match-view";
import { pythagoras } from "./pythagoras";
import { PythagorasView } from "./pythagoras-view";
import { trianglesScene } from "./scene";
import { TrianglesSceneView } from "./scene-view";
import { shadowHeight } from "./shadow";
import { ShadowView } from "./shadow-view";
import { similarFigures } from "./similar";
import { SimilarView } from "./similar-view";

export {
  type Pt,
  type Sides,
  angleAt,
  anglesOf,
  areaOf,
  clean,
  dist,
  fracText,
  isTriangle,
  near,
  numText,
  oppositeSide,
  placeTriangle,
  polygonArea,
  ratioText,
  sidesFromBaseAngles,
} from "./geometry";
export {
  SCALE_MAX,
  SCALE_MIN,
  SCALE_STEP,
  SimilarAction,
  SimilarDerived,
  SimilarPair,
  SimilarPart,
  SimilarShape,
  SimilarSignal,
  type SimilarState,
  isSimilarOf,
  polygonsOf,
  ratiosOf,
  similarFigures as similarFiguresDef,
} from "./similar";
export {
  BptAction,
  BptDerived,
  BptMode,
  BptPart,
  BptSignal,
  type BptState,
  isParallelOf,
  lengthsOf,
  proportionLine as proportionLineDef,
  ratioDOf,
  ratioEOf,
} from "./bpt";
export {
  MatchAction,
  MatchDerived,
  MatchEdit,
  MatchPart,
  MatchSide,
  MatchSignal,
  type MatchState,
  isSimilarMatch,
  ratiosOfMatch,
  triangleMatch as triangleMatchDef,
} from "./match";
export {
  AreaAction,
  AreaDerived,
  AreaMode,
  AreaPart,
  AreaSignal,
  type AreaState,
  T_STEP,
  areaRatioOf,
  areaTiles as areaTilesDef,
  isHalfOf,
  sideRatioOf,
} from "./areas";
export {
  PROOF_STEPS,
  PythAction,
  PythDerived,
  PythMode,
  PythPart,
  PythSide,
  PythSignal,
  type PythState,
  altitudeOf,
  pythagoras as pythagorasDef,
  rightAtOf,
  sidesOf as pythSidesOf,
} from "./pythagoras";
export {
  SHADOW_STEPS,
  ShadowAction,
  ShadowDerived,
  ShadowMode,
  ShadowObject,
  ShadowPart,
  ShadowSignal,
  type ShadowState,
  answerOf as shadowAnswerOf,
  lampShadowOf,
  objectShadowOf,
  shadowHeight as shadowHeightDef,
} from "./shadow";
export {
  TRIANGLES_PICTURE,
  TrianglesSceneKind,
  TrianglesScenePart,
  type TrianglesSceneState,
  describeTrianglesScene,
  trianglesScene as trianglesSceneDef,
} from "./scene";

export const similarFiguresProp: PropModule = { def: asAnyProp(similarFigures), View: SimilarView };
export const proportionLineProp: PropModule = { def: asAnyProp(proportionLine), View: BptView };
export const triangleMatchProp: PropModule = { def: asAnyProp(triangleMatch), View: MatchView };
export const areaTilesProp: PropModule = { def: asAnyProp(areaTiles), View: AreasView };
export const pythagorasProp: PropModule = { def: asAnyProp(pythagoras), View: PythagorasView };
export const shadowHeightProp: PropModule = { def: asAnyProp(shadowHeight), View: ShadowView };
export const trianglesSceneProp: PropModule = {
  def: asAnyProp(trianglesScene),
  View: TrianglesSceneView,
};

/** Every prop in this package. */
export const trianglesProps: readonly PropModule[] = [
  similarFiguresProp,
  proportionLineProp,
  triangleMatchProp,
  areaTilesProp,
  pythagorasProp,
  shadowHeightProp,
  trianglesSceneProp,
];
