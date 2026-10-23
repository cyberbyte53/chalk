import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { atmosphere } from "./atmosphere";
import { eyeModel } from "./eye-model";
import { prism } from "./prism";
import { scattering } from "./scattering";
import { eyeScene } from "./scene";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-eye")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(eyeModel),
  asAnyProp(prism),
  asAnyProp(atmosphere),
  asAnyProp(scattering),
  asAnyProp(eyeScene),
];
