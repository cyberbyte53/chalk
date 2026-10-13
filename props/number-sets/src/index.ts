import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { numberSorter } from "./model";
import { NumberSorterView } from "./view";

export {
  Family,
  FamilySymbol,
  NumberSorterPart,
  NumberSorterSignal,
  type NumberSorterState,
  OUTSIDE,
  isInside,
  numberSorter as numberSorterDef,
  placeFor,
} from "./model";

export const numberSorterProp: PropModule = {
  def: asAnyProp(numberSorter),
  View: NumberSorterView,
};
