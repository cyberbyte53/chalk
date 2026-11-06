import { type PropModule, propModule } from "@chalk/player";
import { coordinatePlane } from "./coordinate-plane";
import { sounds } from "./defs";
import { CoordinatePlaneView } from "./view";

export const coordinatePlaneProp = propModule(
  coordinatePlane,
  CoordinatePlaneView,
  sounds[coordinatePlane.type],
);

/** Every prop in this package, for the library. */
export const coordinateProps: readonly PropModule[] = [coordinatePlaneProp];
