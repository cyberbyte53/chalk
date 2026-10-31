import { type PropModule, propModule } from "@chalk/player";
import { TextStyle, sceneChoice, sceneGoal, sceneText } from "./scene";
import { questionSound, textSound } from "./scene-sound";
import { ChoiceView, GoalView, TextView } from "./views";

export { TextStyle, sceneChoice, sceneGoal, sceneText };

/** The props every lesson uses: words and questions. */
export const basicProps: readonly PropModule[] = [
  propModule(sceneText, TextView, textSound),
  propModule(sceneChoice, ChoiceView, questionSound),
  propModule(sceneGoal, GoalView, questionSound),
];
