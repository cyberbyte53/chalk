// What the package offers, re-exported and nothing else: left out of a board's code fingerprint
// (package.json `chalk.registries`); each name counts where it is written. A part adds its line.
export { type Clue, type Still, stillPossible } from "./clues";
export { coordinatePlane } from "./coordinate-plane";
export { throwOf } from "./dice";
export { coordinatePlaneProp, coordinateProps } from "./module";
export { Choosing, PlaceKind, type Place } from "./places";
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
