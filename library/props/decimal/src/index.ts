import { propModule } from "@chalk/player";
import { decimalExpansion } from "./model";
import { DecimalExpansionView } from "./view";

export {
  DecimalExpansionPart,
  decimalExpansion as decimalExpansionDef,
  type DecimalExpansionState,
} from "./model";

export const decimalExpansionProp = propModule(decimalExpansion, DecimalExpansionView);
