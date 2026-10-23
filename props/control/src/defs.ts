import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { brainMap } from "./brain";
import { endocrineMap } from "./endocrine";
import { plantHormones } from "./hormones";
import { neuronSignal } from "./neuron";
import { plantMovement } from "./plants";
import { reflexArc } from "./reflex";
import { hormoneResponse } from "./response";
import { controlScene } from "./scene";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-control")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(plantMovement),
  asAnyProp(plantHormones),
  asAnyProp(endocrineMap),
  asAnyProp(hormoneResponse),
  asAnyProp(controlScene),
  asAnyProp(brainMap),
  asAnyProp(neuronSignal),
  asAnyProp(reflexArc),
];
