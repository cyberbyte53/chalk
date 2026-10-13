import type { PropModule } from "@chalk/player";
import { asAnyProp } from "@chalk/prop";
import { button } from "./button";
import { choice } from "./choice";
import { goal } from "./goal";
import { line } from "./line";
import { text } from "./text";
import { timer } from "./timer";
import { ButtonView, ChoiceView, GoalView, LineView, NothingView, TextView } from "./views";

export { Avatar, CharacterId } from "./cast";
export { ButtonSignal, type ButtonState } from "./button";
export type { ChoiceState } from "./choice";
export type { GoalState } from "./goal";
export type { LineState } from "./line";
export { TextStyle, type TextState } from "./text";
export { TimerSignal, type TimerState } from "./timer";

/** The props every lesson uses: words, the cast's lines, questions, buttons and a timer. */
export const basicProps: readonly PropModule[] = [
  { def: asAnyProp(text), View: TextView },
  { def: asAnyProp(line), View: LineView },
  { def: asAnyProp(choice), View: ChoiceView },
  { def: asAnyProp(goal), View: GoalView },
  { def: asAnyProp(button), View: ButtonView },
  { def: asAnyProp(timer), View: NothingView },
];
