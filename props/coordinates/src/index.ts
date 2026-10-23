import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { coordinatePlane } from "./coordinate-plane";
import { CoordinatePlaneView } from "./coordinate-plane-view";
import { coordinatesScene } from "./scene";
import { CoordinatesSceneView } from "./scene-view";
import { sectionDivider } from "./section-divider";
import { SectionDividerView } from "./section-divider-view";
import { triangleArea } from "./triangle-area";
import { TriangleAreaView } from "./triangle-area-view";

export {
  PROOF_STEPS as PLANE_PROOF_STEPS,
  PlaneAction,
  PlaneDerived,
  PlaneJoin,
  PlanePart,
  PlaneSignal,
  type PlaneState,
  collinearOf,
  coordinatePlane as coordinatePlaneDef,
  d2Of,
  sidesOf,
  workingOf as distanceWorkingOf,
} from "./coordinate-plane";
export {
  SectionAction,
  SectionDerived,
  SectionPart,
  SectionSignal,
  type SectionState,
  isMidpointOf,
  pointOf as sectionPointOf,
  sectionDivider as sectionDividerDef,
  workingOf as sectionWorkingOf,
} from "./section-divider";
export {
  AREA_STEP_COUNT,
  AreaAction,
  AreaDerived,
  AreaPart,
  AreaSignal,
  type AreaState,
  areaOf,
  bracketValueOf,
  isCollinearOf,
  triangleArea as triangleAreaDef,
  workingOf as areaWorkingOf,
} from "./triangle-area";
export {
  COORDINATES_PICTURE,
  CoordinatesSceneKind,
  CoordinatesScenePart,
  type CoordinatesSceneState,
  coordinatesScene as coordinatesSceneDef,
  describeCoordinatesScene,
} from "./scene";
export {
  bracketOf,
  centroidOf,
  coordText,
  dist2,
  distance,
  divide,
  fraction,
  isCollinear,
  midpointOf,
  pairText,
  ratioNear,
  sqrtText,
  triangleAreaOf,
} from "./plane";

export const coordinatePlaneProp: PropModule = {
  def: asAnyProp(coordinatePlane),
  View: CoordinatePlaneView,
};
export const sectionDividerProp: PropModule = {
  def: asAnyProp(sectionDivider),
  View: SectionDividerView,
};
export const triangleAreaProp: PropModule = {
  def: asAnyProp(triangleArea),
  View: TriangleAreaView,
};
export const coordinatesSceneProp: PropModule = {
  def: asAnyProp(coordinatesScene),
  View: CoordinatesSceneView,
};

/** Every prop in this package. */
export const coordinatesProps: readonly PropModule[] = [
  coordinatePlaneProp,
  sectionDividerProp,
  triangleAreaProp,
  coordinatesSceneProp,
];
