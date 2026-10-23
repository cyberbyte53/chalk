import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { areaBuilder } from "./area";
import { rootsGraph } from "./roots";
import { quadraticScene } from "./scene";
import { middleSplit } from "./split";
import { squareTiles } from "./tiles";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-quadratics")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(areaBuilder),
  asAnyProp(middleSplit),
  asAnyProp(squareTiles),
  asAnyProp(rootsGraph),
  asAnyProp(quadraticScene),
];
