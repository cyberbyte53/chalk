import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { gas } from "./model";
import { GasView } from "./view";

export { GasAction, type GasState, gas as gasDef, positions } from "./model";

export const gasProp: PropModule = { def: asAnyProp(gas), View: GasView };
