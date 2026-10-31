import { type PropModule, propModule } from "@chalk/player";
import { sounds } from "./defs";
import { coordinatePlane as sceneCoordinatePlane } from "./scene/coordinate-plane";
import { SceneCoordinatePlaneView } from "./scene/view";

export { type Clue, type Still, stillPossible } from "./clues";
export { throwOf } from "./dice";
export { PlaceKind, type Place } from "./places";
export {
  Axes,
  Marks,
  PlanePart,
  Scene,
  Tone,
  isInWindow,
  placeOf,
  type NamedPoint,
  type PlaneWindow,
  type Point,
} from "./plane";
export { Reading } from "./reading";
export { Direction, Roads, WalkerKind, stepFrom } from "./walker";

export { sceneCoordinatePlane };

export const coordinatePlaneProp = propModule(
  sceneCoordinatePlane,
  SceneCoordinatePlaneView,
  sounds[sceneCoordinatePlane.type],
);

/** Every prop in this package, for the library. */
export const coordinateProps: readonly PropModule[] = [coordinatePlaneProp];
