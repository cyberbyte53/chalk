import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { circuit } from "./model";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-circuit")`).
 */
export const defs: readonly AnyPropDef[] = [asAnyProp(circuit)];
