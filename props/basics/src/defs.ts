import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { button } from "./button";
import { choice } from "./choice";
import { goal } from "./goal";
import { line } from "./line";
import { multiChoice } from "./multi-choice";
import { orderSteps } from "./order-steps";
import { text } from "./text";
import { timer } from "./timer";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-basics")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(text),
  asAnyProp(line),
  asAnyProp(choice),
  asAnyProp(multiChoice),
  asAnyProp(orderSteps),
  asAnyProp(goal),
  asAnyProp(button),
  asAnyProp(timer),
];
