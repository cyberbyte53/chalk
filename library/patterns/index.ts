export { type CheckNote, check } from "./check-question";
export { type Option, type Wrong, choice, choiceQuestion, settle } from "./choice-question";
export { multiChoiceQuestion } from "./multi-choice-question";
export { type OrderStep, orderQuestion } from "./order-question";
export { bagTex, frac, primesTex } from "./latex";
export { wordsOn } from "./words";
export {
  bareClassroom,
  type PlaneSetup,
  setup,
  bareNotebook,
  TOWN,
  bareTown,
  gridOf,
  isAt,
  isChosen,
  isPlaced,
  walkTo,
} from "./coordinates";

/** For scenes (boards on the event model): words, questions, and the coordinate plane's helpers. */
export * as sceneWith from "./scene-questions";
export * as scenePlane from "./scene-coordinates";
