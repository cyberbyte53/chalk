import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { beetlePopulation } from "./beetles";
import { chromosomeShuffle } from "./chromosomes";
import { crossSimulator } from "./cross";
import { fossilLayers } from "./fossils";
import { limbBones } from "./limbs";
import { heredityScene } from "./scene";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-heredity")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(crossSimulator),
  asAnyProp(chromosomeShuffle),
  asAnyProp(beetlePopulation),
  asAnyProp(limbBones),
  asAnyProp(fossilLayers),
  asAnyProp(heredityScene),
];
