import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { wasteBurial } from "./burial";
import { cupChoice } from "./cups";
import { ecosystem } from "./ecosystem";
import { foodChain } from "./food-chain";
import { bioMagnification } from "./magnification";
import { ozoneLayer } from "./ozone";
import { environmentScene } from "./scene";
import { wasteSorter } from "./sorter";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-environment")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(ecosystem),
  asAnyProp(foodChain),
  asAnyProp(bioMagnification),
  asAnyProp(ozoneLayer),
  asAnyProp(wasteBurial),
  asAnyProp(wasteSorter),
  asAnyProp(cupChoice),
  asAnyProp(environmentScene),
];
