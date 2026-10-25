import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { plane } from "./plane";
import { iconButton, mathLine, stepper } from "./small";

/** The package's prop definitions, loaded up front; the views load with the chapter. */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(plane),
  asAnyProp(stepper),
  asAnyProp(mathLine),
  asAnyProp(iconButton),
];
