import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { rootBuilder } from "./builder";
import { RootBuilderView } from "./builder-view";
import { rootSemicircle } from "./semicircle";
import { RootSemicircleView } from "./semicircle-view";
import { rootSpiral } from "./spiral";
import { RootSpiralView } from "./spiral-view";

export const rootBuilderProp: PropModule = { def: asAnyProp(rootBuilder), View: RootBuilderView };
export { rootBuilder as rootBuilderDef, type RootBuilderState } from "./builder";
export const rootSemicircleProp: PropModule = {
  def: asAnyProp(rootSemicircle),
  View: RootSemicircleView,
};
export { rootSemicircle as rootSemicircleDef, type RootSemicircleState } from "./semicircle";
export const rootSpiralProp: PropModule = { def: asAnyProp(rootSpiral), View: RootSpiralView };
export { rootSpiral as rootSpiralDef, type RootSpiralState } from "./spiral";
