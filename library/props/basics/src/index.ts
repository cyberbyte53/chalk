import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { choice } from "./choice";
import { multiChoice } from "./multi-choice";
import { orderSteps } from "./order-steps";
import { text } from "./text";
import { ChoiceView, MultiChoiceView, OrderStepsView, TextView } from "./views";

export { ChoiceAction, type ChoiceState } from "./choice";
export { MultiChoiceAction, type MultiChoiceState } from "./multi-choice";
export { OrderStepsAction, type OrderStepsState, firstWrong } from "./order-steps";
export { TextStyle, type TextState } from "./text";

/** The typed definitions, for content written in TypeScript (`b.prop(textDef, ...)`). */
export {
  choice as choiceDef,
  multiChoice as multiChoiceDef,
  orderSteps as orderStepsDef,
  text as textDef,
};

/** The props every lesson uses: words and questions. */
export const basicProps: readonly PropModule[] = [
  { def: asAnyProp(text), View: TextView },
  { def: asAnyProp(choice), View: ChoiceView },
  { def: asAnyProp(multiChoice), View: MultiChoiceView },
  { def: asAnyProp(orderSteps), View: OrderStepsView },
];
