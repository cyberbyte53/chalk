import { type PropModule, propModule } from "@chalk/player";
import { coordinatePlane } from "./coordinate-plane";
import { CoordinatePlaneView } from "./coordinate-plane-view";

export {
  type CoordinatePlaneState,
  MAX_REACH,
  coordinatePlane as coordinatePlaneDef,
} from "./coordinate-plane";
export { numText, pairText, quadrantOf } from "./plane";

export const coordinatePlaneProp = propModule(coordinatePlane, CoordinatePlaneView);

/** Every prop in this package, for the library. */
export const coordinateProps: readonly PropModule[] = [coordinatePlaneProp];
