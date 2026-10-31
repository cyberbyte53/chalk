import { type PropModule, propModule } from "@chalk/player";
import { coordinatePlane } from "./coordinate-plane";
import { sounds } from "./defs";
import { CoordinatePlaneView } from "./view";

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

export { coordinatePlane };

export const coordinatePlaneProp = propModule(
  coordinatePlane,
  CoordinatePlaneView,
  sounds[coordinatePlane.type],
);

/** Every prop in this package, for the library. */
export const coordinateProps: readonly PropModule[] = [coordinatePlaneProp];
