import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { comboBuilder } from "./combo";
import { frustumCut } from "./frustum";
import { meltRecast } from "./recast";
import { solidsScene } from "./scene";
import { solidViewer } from "./viewer";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-solids")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(solidViewer),
  asAnyProp(comboBuilder),
  asAnyProp(meltRecast),
  asAnyProp(frustumCut),
  asAnyProp(solidsScene),
];
