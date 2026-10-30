import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { choice } from "./choice";
import { goal } from "./goal";
import { multiChoice } from "./multi-choice";
import { orderSteps } from "./order-steps";
import { sceneChoice, sceneGoal, sceneText } from "./scene";
import { text } from "./text";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act). The views load with a chapter (`import("@chalk/prop-basics")`).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(text),
  asAnyProp(choice),
  asAnyProp(goal),
  asAnyProp(multiChoice),
  asAnyProp(orderSteps),
  // On the event model (scene.ts); erased the same way until today's props are gone.
  sceneText as unknown as AnyPropDef,
  sceneChoice as unknown as AnyPropDef,
  sceneGoal as unknown as AnyPropDef,
];
