export { BoardPlayer, type BoardPlayerProps } from "./board-player";
export { AnswerFeedback } from "./answer-feedback";
export {
  type ModePolicy,
  PlayMode,
  PlayModeContext,
  modePolicy,
  usePlayMode,
} from "./play-mode";
export { RichText } from "./rich-text-view";
export {
  type Parsed,
  type Span,
  SpanKind,
  mathHtml,
  mathText,
  parseRich,
  plainText,
  richProblems,
} from "./rich-text";
export { JugnuFigure, JugnuMood } from "./jugnu-figure";
export type { JugnuFlag, JugnuLink, ShownMessage } from "./jugnu-panel";
export { LessonPlayer, type LessonPlayerProps } from "./lesson-player";
export type { AudioSource } from "./narration";
export type { PropModule, PropRegistry, PropViewProps } from "./prop-module";
export { compositeView } from "./composite-view";
export { groupView } from "./group-view";
export {
  type FrameContextValue,
  type FrameLabel,
  FrameStage,
  InFrame,
  useFrame,
  useFrameLabels,
} from "./frame";
export { partPaths, partPathsIn } from "./part-paths";
export {
  type BoardModel,
  type ElementModel,
  type PieceModel,
  boardModel,
  fieldsRead,
  pieceModel,
  runningBoards,
  takes,
  trackBoard,
} from "./board-model";
export { stampCodePaths } from "./code-paths";
export { type PropPack, lazyRegistry } from "./lazy-views";
export { propRecords } from "./records";
export {
  type ActionRecord,
  type BoardSnapshot,
  BoardRuntime,
  type RuntimeServices,
  type SignalRecord,
} from "./runtime";
export { type BoardState, type HeadlessBoard, boardState, headlessBoard } from "./headless";
export { t, UiText, type UiTextKey } from "./ui-text";

/** How much each change is checked: "light" in the shipped app (see @chalk/prop state.ts). */
export { setStateChecks } from "@chalk/prop";
