import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { circuit } from "./model";
import { CircuitView } from "./view";

export {
  type CircuitNode,
  type CircuitReadings,
  CircuitSignal,
  type CircuitState,
  type Component,
  ComponentKind,
  circuit as circuitDef,
  measure,
} from "./model";
export { solveNetwork } from "./solve";

export const circuitProp: PropModule = { def: asAnyProp(circuit), View: CircuitView };
