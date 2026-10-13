import type { PropModule, PropRegistry } from "@chalk/player";
import { type AnyPropDef, BOARD, asAnyProp, boardProp } from "@chalk/prop";
import { basicProps } from "@chalk/prop-basics";
import { coinProp } from "@chalk/prop-chance";
import { circuitProp } from "@chalk/prop-circuit";
import { decimalExpansionProp, decimalShiftProp } from "@chalk/prop-decimal";
import { exponentRoutesProp } from "@chalk/prop-exponents";
import { numberLineProp } from "@chalk/prop-number-line";
import { numberSorterProp } from "@chalk/prop-number-sets";
import { graphProp } from "@chalk/prop-plot";
import { rootBuilderProp, rootSemicircleProp, rootSpiralProp } from "@chalk/prop-roots";
import { surdTilesProp } from "@chalk/prop-surds";

const all: readonly PropModule[] = [
  ...basicProps,
  numberLineProp,
  coinProp,
  graphProp,
  circuitProp,
  decimalExpansionProp,
  decimalShiftProp,
  numberSorterProp,
  rootBuilderProp,
  rootSemicircleProp,
  rootSpiralProp,
  surdTilesProp,
  exponentRoutesProp,
];

/** Every prop type a lesson can place, by type. Adding a prop = one line in `all`. */
export const propLibrary: PropRegistry = Object.fromEntries(
  all.map((module) => [module.def.type, module]),
);

/** Just the definitions, plus the board itself, for tools that only need the contract (validator, Jugnu). */
export const propDefs: Readonly<Record<string, AnyPropDef>> = {
  ...Object.fromEntries(all.map((module) => [module.def.type, module.def])),
  [BOARD]: asAnyProp(boardProp),
};
