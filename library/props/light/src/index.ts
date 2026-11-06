import { type PropModule, propModule } from "@chalk/player";
import { sounds } from "./defs";
import { sphericalMirror } from "./spherical-mirror";
import { SphericalMirrorView } from "./spherical-mirror-view";

export { ImageCase, MirrorKind, ObjectKind, Place, RayKind, imageOf } from "./mirror";
export { sphericalMirror };

export const sphericalMirrorProp = propModule(
  sphericalMirror,
  SphericalMirrorView,
  sounds[sphericalMirror.type],
);

/** Every prop in this package, for the library. */
export const lightProps: readonly PropModule[] = [sphericalMirrorProp];
