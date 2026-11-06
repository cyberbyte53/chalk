import { type PropModule, propModule } from "@chalk/player";
import { equationBalance } from "./balance";
import { EquationBalanceView } from "./balance-view";
import { sounds } from "./defs";

export { ELEMENT_COLORS, Side, equationBalance, type Term } from "./balance";
export { atomsOf, prettyFormula } from "./formula";

export const equationBalanceProp = propModule(
  equationBalance,
  EquationBalanceView,
  sounds[equationBalance.type],
);

/** Every prop in this package, for the library. */
export const chemistryProps: readonly PropModule[] = [equationBalanceProp];
