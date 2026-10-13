import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { decimalExpansion } from "./model";
import { decimalShift } from "./shift";
import { DecimalShiftView } from "./shift-view";
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

export { decimalShift as decimalShiftDef, type DecimalShiftState } from "./shift";

export const decimalShiftProp: PropModule = {
  def: asAnyProp(decimalShift),
  View: DecimalShiftView,
};
