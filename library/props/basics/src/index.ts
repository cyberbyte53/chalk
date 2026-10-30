import { type PropModule, propModule } from "@chalk/player";
import { choice } from "./choice";
import { goal } from "./goal";
import { multiChoice } from "./multi-choice";
import { orderSteps } from "./order-steps";
import { sceneChoice, sceneGoal, sceneText } from "./scene";
import { questionSound, textSound } from "./scene-sound";
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
export { sceneChoice, sceneGoal, sceneText };

/** The props every lesson uses: words and questions. */
export const basicProps: readonly PropModule[] = [
  propModule(text, TextView),
  propModule(choice, ChoiceView),
  propModule(goal, GoalView),
  propModule(multiChoice, MultiChoiceView),
  propModule(orderSteps, OrderStepsView),
  // On the event model: the same variables and actions, drawn by the same views.
  propModule(sceneText, TextView as never, textSound),
  propModule(sceneChoice, ChoiceView as never, questionSound),
  propModule(sceneGoal, GoalView as never, questionSound),
];
