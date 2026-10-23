import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { polyBox } from "./poly-box";
import { valueMachine } from "./value-machine";
import { zeroPlane } from "./zero-plane";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-polynomials")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(zeroPlane),
  asAnyProp(polyBox),
  asAnyProp(valueMachine),
];
