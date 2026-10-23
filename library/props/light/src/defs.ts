import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { lateralMirror } from "./lateral-mirror";
import { lens } from "./lens";
import { mirrorImage } from "./mirror-image";
import { planeMirror } from "./plane-mirror";
import { rayAngle } from "./ray-angle";
import { refraction } from "./refraction";
import { lightScene } from "./scene";
import { sphericalMirror } from "./spherical-mirror";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-light")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(planeMirror),
  asAnyProp(sphericalMirror),
  asAnyProp(lens),
  asAnyProp(mirrorImage),
  asAnyProp(refraction),
  asAnyProp(lightScene),
  asAnyProp(rayAngle),
  asAnyProp(lateralMirror),
];
