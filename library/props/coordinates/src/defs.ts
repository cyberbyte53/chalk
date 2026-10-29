import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { coordinatePlane } from "./coordinate-plane";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act).
 */
export const defs: readonly AnyPropDef[] = [asAnyProp(coordinatePlane)];

export { coordinatePlane };
