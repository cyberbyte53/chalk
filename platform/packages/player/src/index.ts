export { BoardPlayer, type BoardPlayerProps } from "./board-player";
export { AnswerFeedback } from "./answer-feedback";
export { useFitColumns } from "./fit-columns";
export { useLayoutWhenChanged, useMadeWhenChanged, useWhenChanged } from "./when-changed";
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
export type { ClipStore, Clip, WordsToSay } from "./sound/voice";
export { linePhrases, spokenWords } from "./sound/spoken-line";
export { type Channel, isMuted, playClip, playSound, setMuted } from "./sound/engine";
export {
  type PropModule,
  type PropRegistry,
  type PropViewProps,
  type SoundView,
  propModule,
} from "./prop-module";
export { checkProp } from "./check-prop";
export { groupView, useTheme, type GroupViewOptions, type PartDrawing } from "./group-view";
export {
  FRAME_MAP,
  type FrameMap,
  type FrameContextValue,
  type FrameLabel,
  FrameStage,
  useFrame,
  useFrameLabels,
} from "./frame";
export { type DragAttrs, type DragSpec, useDrags } from "./drag";
export { describeView } from "./describe";
export { BoardClockContext, useBoardTween, type BoardClock } from "./board-clock";
export { BoardSpeedContext } from "./use-board-runtime";
export {
  type LiveBoard,
  SceneRuntime,
  isSceneBoard,
} from "./scene-runtime";
export { type ScriptLine, scriptOf } from "./script";
export { type MathsReader, type RichSpeech, type SaidPiece, richSpeech } from "./rich-text-speech";
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
export { type PropPage, propPages } from "./prop-pages";
export { t, UiText, type UiTextKey } from "./ui-text";

/** How much each change is checked: "light" in the shipped app (see @chalk/prop state.ts). */
export { setStateChecks } from "@chalk/prop";
export { OwnHtml, type OwnMarkup, ours } from "./own-markup";
export type { Heard, HeardSound, HeardWords } from "@chalk/content";
