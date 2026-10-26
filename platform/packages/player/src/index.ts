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
export { groupView, useTheme } from "./group-view";
export {
  type FrameContextValue,
  type FrameLabel,
  FrameStage,
  InFrame,
  useFrame,
  useFrameLabels,
} from "./frame";
export { BoardClockContext, useBoardTween, type BoardClock } from "./board-clock";
export { leafView, useParts, type PartAttrs, type ViewContext } from "./parts";
export { addressOf, findNode, partPaths, partPathsIn, stampPaths } from "./part-paths";
// Addresses, for apps that find nodes on screen (the helpers live with the props).
export { SEP, joinPath, namesOf, pathOf, segment } from "@chalk/prop";
export { type Change, changesBetween } from "@chalk/prop";
export {
  fieldsRead,
  runningBoards,
  snapshotOf,
  takes,
  trackBoard,
} from "./snapshot";
export { stampCodePaths } from "./code-paths";
export { type PropPack, lazyRegistry } from "./lazy-views";
export { type BoardRecorder, boardIdOf, boardPathOf, recordBoard } from "./recorder";
export {
  type ActResult,
  type ActionRecord,
  type BoardEvent,
  type BoardFacts,
  BoardRuntime,
  type RuntimeServices,
  type SignalRecord,
} from "./runtime";
export { type HeadlessBoard, headlessBoard } from "./headless";
export { t, UiText, type UiTextKey } from "./ui-text";

/** How much each change is checked: "light" in the shipped app (see @chalk/prop state.ts). */
export { setStateChecks } from "@chalk/prop";
