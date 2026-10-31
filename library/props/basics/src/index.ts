import { type PropModule, propModule } from "@chalk/player";
import { TextStyle, choice, goal, text } from "./props";
import { questionSound, textSound } from "./sound";
import { ChoiceView, GoalView, TextView } from "./views";

export { TextStyle, choice, goal, text };

/** The props every lesson uses: words and questions. */
export const basicProps: readonly PropModule[] = [
  propModule(text, TextView, textSound),
  propModule(choice, ChoiceView, questionSound),
  propModule(goal, GoalView, questionSound),
];
