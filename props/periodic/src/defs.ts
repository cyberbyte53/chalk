import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { mendeleevTable } from "./mendeleev";
import { periodicTable } from "./modern";
import { octaveTable } from "./octaves";
import { periodicScene } from "./scene";
import { triadChecker } from "./triads";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-periodic")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(triadChecker),
  asAnyProp(octaveTable),
  asAnyProp(mendeleevTable),
  asAnyProp(periodicTable),
  asAnyProp(periodicScene),
];
