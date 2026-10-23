import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { bagCompare } from "./bag-compare";
import { beadPair } from "./bead-pair";
import { billSplit } from "./bill-split";
import { divisionRows } from "./division-rows";
import { factorTree } from "./factor-tree";
import { gearPair } from "./gear-pair";
import { lapRace } from "./lap-race";
import { primeBag } from "./prime-bag";
import { primeTowers } from "./prime-towers";
import { remainderShelves } from "./remainder-shelves";
import { squareBalance } from "./square-balance";
import { squareCutter } from "./square-cutter";
import { stickMeasure } from "./stick-measure";
import { sweetShare } from "./sweet-share";
import { tenMaker } from "./ten-maker";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-primes")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(sweetShare),
  asAnyProp(divisionRows),
  asAnyProp(squareCutter),
  asAnyProp(remainderShelves),
  asAnyProp(factorTree),
  asAnyProp(primeBag),
  asAnyProp(bagCompare),
  asAnyProp(gearPair),
  asAnyProp(squareBalance),
  asAnyProp(stickMeasure),
  asAnyProp(lapRace),
  asAnyProp(beadPair),
  asAnyProp(primeTowers),
  asAnyProp(tenMaker),
  asAnyProp(billSplit),
];
