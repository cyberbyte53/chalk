import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { billSplit } from "./bill-split";
import { factorTree } from "./factor-tree";
import { lapRace } from "./lap-race";
import { primeTowers } from "./prime-towers";
import { stickMeasure } from "./stick-measure";
import { sweetShare } from "./sweet-share";
import { tenMaker } from "./ten-maker";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-primes")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(sweetShare),
  asAnyProp(factorTree),
  asAnyProp(stickMeasure),
  asAnyProp(lapRace),
  asAnyProp(primeTowers),
  asAnyProp(tenMaker),
  asAnyProp(billSplit),
];
