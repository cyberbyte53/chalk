import { type PropModule, propModule } from "@chalk/player";
import { choice } from "./choice";
import { goal } from "./goal";
import { multiChoice } from "./multi-choice";
import { orderSteps } from "./order-steps";
import { text } from "./text";
import { ChoiceView, GoalView, MultiChoiceView, OrderStepsView, TextView } from "./views";

export type { ChoiceState } from "./choice";
export type { GoalState } from "./goal";
export type { MultiChoiceState } from "./multi-choice";
export { type OrderStepsState, firstWrong } from "./order-steps";
export { TextStyle, type TextState } from "./text";

/** The typed definitions, for content written in TypeScript (`b.prop(textDef, ...)`). */
export {
  choice as choiceDef,
  goal as goalDef,
  multiChoice as multiChoiceDef,
  orderSteps as orderStepsDef,
  text as textDef,
};

/** The props every lesson uses: words and questions. */
export const basicProps: readonly PropModule[] = [
  propModule(text, TextView),
  propModule(choice, ChoiceView),
  propModule(goal, GoalView),
  propModule(multiChoice, MultiChoiceView),
  propModule(orderSteps, OrderStepsView),
];
