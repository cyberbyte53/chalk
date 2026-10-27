import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { decimalExpansion } from "./model";
import { DecimalExpansionView } from "./view";

export {
  DecimalExpansionPart,
  DecimalExpansionSignal,
  decimalExpansion as decimalExpansionDef,
  type DecimalExpansionState,
} from "./model";

export const decimalExpansionProp: PropModule = {
  def: asAnyProp(decimalExpansion),
  View: DecimalExpansionView,
};
