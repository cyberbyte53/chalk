import { type PropModule, propModule } from "@chalk/player";
import { choice } from "./choice";
import { goal } from "./goal";
import { sceneChoice, sceneGoal, sceneText } from "./scene";
import { questionSound, textSound } from "./scene-sound";
import { text } from "./text";
import { ChoiceView, GoalView, TextView } from "./views";

export type { ChoiceState } from "./choice";
export type { GoalState } from "./goal";
export { TextStyle, type TextState } from "./text";

/** The typed definitions, for content written in TypeScript (`b.prop(textDef, ...)`). */
export { choice as choiceDef, goal as goalDef, text as textDef };
export { sceneChoice, sceneGoal, sceneText };

/** The props every lesson uses: words and questions. */
export const basicProps: readonly PropModule[] = [
  propModule(text, TextView),
  propModule(choice, ChoiceView),
  propModule(goal, GoalView),
  // On the event model: the same variables and actions, drawn by the same views.
  propModule(sceneText, TextView as never, textSound),
  propModule(sceneChoice, ChoiceView as never, questionSound),
  propModule(sceneGoal, GoalView as never, questionSound),
];
