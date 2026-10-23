import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { breathing } from "./breathing";
import { diffusionReach } from "./diffusion";
import { digestiveTract } from "./digestion";
import { cellFeeding } from "./feeding";
import { heart } from "./heart";
import { leafLab } from "./leaf";
import { nephron } from "./nephron";
import { respirationPaths } from "./respiration";
import { lifeScene } from "./scene";
import { plantTransport } from "./transport";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-life")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(diffusionReach),
  asAnyProp(leafLab),
  asAnyProp(cellFeeding),
  asAnyProp(digestiveTract),
  asAnyProp(respirationPaths),
  asAnyProp(breathing),
  asAnyProp(heart),
  asAnyProp(plantTransport),
  asAnyProp(nephron),
  asAnyProp(lifeScene),
];
