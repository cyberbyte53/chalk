import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { button } from "./button";
import { choice } from "./choice";
import { goal } from "./goal";
import { line } from "./line";
import { multiChoice } from "./multi-choice";
import { orderSteps } from "./order-steps";
import { text } from "./text";
import { timer } from "./timer";
import {
  ButtonView,
  ChoiceView,
  GoalView,
  LineView,
  MultiChoiceView,
  NothingView,
  OrderStepsView,
  TextView,
} from "./views";

export { Avatar, CharacterId } from "./cast";
export { ButtonAction, ButtonSignal, type ButtonState } from "./button";
export { ChoiceAction, type ChoiceState } from "./choice";
export type { GoalState } from "./goal";
export type { LineState } from "./line";
export { MultiChoiceAction, type MultiChoiceState } from "./multi-choice";
export { OrderStepsAction, type OrderStepsState, firstWrong } from "./order-steps";
export { TextStyle, type TextState } from "./text";
export { TimerSignal, type TimerState } from "./timer";

/** The typed definitions, for content written in TypeScript (`b.prop(goalDef, ...)`). */
export {
  button as buttonDef,
  choice as choiceDef,
  goal as goalDef,
  line as lineDef,
  multiChoice as multiChoiceDef,
  orderSteps as orderStepsDef,
  text as textDef,
  timer as timerDef,
};

/** The props every lesson uses: words, the cast's lines, questions, buttons and a timer. */
export const basicProps: readonly PropModule[] = [
  { def: asAnyProp(text), View: TextView },
  { def: asAnyProp(line), View: LineView },
  { def: asAnyProp(choice), View: ChoiceView },
  { def: asAnyProp(multiChoice), View: MultiChoiceView },
  { def: asAnyProp(orderSteps), View: OrderStepsView },
  { def: asAnyProp(goal), View: GoalView },
  { def: asAnyProp(button), View: ButtonView },
  { def: asAnyProp(timer), View: NothingView },
];
