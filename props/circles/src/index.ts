import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { circleArea } from "./circle-area";
import { CircleAreaView } from "./circle-area-view";
import { combinedFigures } from "./combined";
import { CombinedView } from "./combined-view";
import { construction } from "./construction";
import { ConstructionView } from "./construction-view";
import { geoFigure } from "./figure";
import { FigureView } from "./figure-view";
import { lineAndCircle } from "./line-circle";
import { LineCircleView } from "./line-circle-view";
import { circlesScene } from "./scene";
import { CirclesSceneView } from "./scene-view";
import { sectorSegment } from "./sector";
import { SectorView } from "./sector-view";
import { tangentsFromPoint } from "./tangents";
import { TangentsView } from "./tangents-view";

/** The geometry kit is its own entry, "@chalk/prop-circles/kit"; nothing of it is re-exported here. */
export {
  LineCircleAction,
  LineCircleDerived,
  LineCircleMode,
  LineCirclePart,
  LineCircleSignal,
  type LineCircleState,
  LineKind,
  chordOf,
  commonPointsOf,
  distanceOf,
  kindOf,
  lineAndCircle as lineCircleDef,
  oqOf,
} from "./line-circle";
export {
  PointPlace,
  TangentsAction,
  TangentsDerived,
  TangentsPart,
  TangentsSignal,
  type TangentsState,
  angleAtOOf,
  angleAtPOf,
  contactsOf,
  lengthOf as tangentLengthOf,
  placeOf,
  tangentCountOf,
  tangentsFromPoint as tangentsFromPointDef,
} from "./tangents";
export {
  ConstructionAction,
  ConstructionDerived,
  ConstructionKind,
  ConstructionPart,
  ConstructionSignal,
  type ConstructionState,
  construction as constructionDef,
  resultOf as constructionResultOf,
  similarPoints,
  stepCountOf as constructionStepCountOf,
  stepsOf as constructionStepsOf,
  tangentsAtAnglePoints,
  tangentsFromPointPoints,
} from "./construction";
export {
  CircleAreaAction,
  CircleAreaDerived,
  CircleAreaMode,
  CircleAreaPart,
  CircleAreaSignal,
  type CircleAreaState,
  areaOf as circleAreaOf,
  circleArea as circleAreaDef,
  circumferenceOf,
  rectLengthOf,
  sliceOf,
} from "./circle-area";
export {
  SectorAction,
  SectorDerived,
  SectorPart,
  SectorShow,
  SectorSignal,
  type SectorState,
  arcLengthOf,
  majorSectorAreaOf,
  majorSegmentAreaOf,
  sectorAreaOf,
  sectorSegment as sectorSegmentDef,
  segmentAreaOf,
  triangleAreaOf,
} from "./sector";
export {
  CombinedAction,
  CombinedDerived,
  CombinedKind,
  CombinedPart,
  CombinedSignal,
  type CombinedState,
  combinedFigures as combinedFiguresDef,
  combinedStepCountOf,
  figureOf,
  totalOf as combinedTotalOf,
} from "./combined";
export {
  FigureAction,
  FigureDerived,
  type FigureItem,
  FigurePart,
  type FigurePoint,
  FigureSignal,
  type FigureState,
  describeFigure,
  figureStepCountOf,
  geoFigure as geoFigureDef,
} from "./figure";
export { PiValue, piOf } from "./pi";
export {
  CIRCLES_PICTURE,
  CirclesSceneKind,
  CirclesScenePart,
  type CirclesSceneState,
  circlesScene as circlesSceneDef,
  describeCirclesScene,
} from "./scene";

export const lineCircleProp: PropModule = { def: asAnyProp(lineAndCircle), View: LineCircleView };
export const tangentsFromPointProp: PropModule = {
  def: asAnyProp(tangentsFromPoint),
  View: TangentsView,
};
export const constructionProp: PropModule = {
  def: asAnyProp(construction),
  View: ConstructionView,
};
export const circleAreaProp: PropModule = { def: asAnyProp(circleArea), View: CircleAreaView };
export const sectorSegmentProp: PropModule = { def: asAnyProp(sectorSegment), View: SectorView };
export const combinedFiguresProp: PropModule = {
  def: asAnyProp(combinedFigures),
  View: CombinedView,
};
export const circlesSceneProp: PropModule = {
  def: asAnyProp(circlesScene),
  View: CirclesSceneView,
};

export const geoFigureProp: PropModule = { def: asAnyProp(geoFigure), View: FigureView };

/** Every prop in this package. */
export const circlesProps: readonly PropModule[] = [
  lineCircleProp,
  tangentsFromPointProp,
  constructionProp,
  circleAreaProp,
  sectorSegmentProp,
  combinedFiguresProp,
  circlesSceneProp,
  geoFigureProp,
];
