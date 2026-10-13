import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { numberLine } from "./model";
import { NumberLineView } from "./view";

export {
  NumberLinePart,
  NumberLineSignal,
  numberLine as numberLineDef,
  type NumberLineState,
} from "./model";

export const numberLineProp: PropModule = { def: asAnyProp(numberLine), View: NumberLineView };
