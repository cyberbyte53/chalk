import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { areaTiles } from "./areas";
import { proportionLine } from "./bpt";
import { triangleMatch } from "./match";
import { pythagoras } from "./pythagoras";
import { trianglesScene } from "./scene";
import { shadowHeight } from "./shadow";
import { similarFigures } from "./similar";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-triangles")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(similarFigures),
  asAnyProp(proportionLine),
  asAnyProp(triangleMatch),
  asAnyProp(areaTiles),
  asAnyProp(pythagoras),
  asAnyProp(shadowHeight),
  asAnyProp(trianglesScene),
];
