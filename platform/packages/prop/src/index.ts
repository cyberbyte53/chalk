/**
 * Props (platform/docs/event-model.md): one building block (`prop`), actions in and signals out,
 * needs, one queue for later, the board; and what every prop shares (its role, its frame, the tags
 * that say what its view shows and does).
 */
export {
  BOARD,
  BoardAction,
  BoardSignal,
  nameOf,
  noteNames,
  PropRole,
  purposeOf,
  type Box,
  type Element,
  type FrameKindName,
  type FramePixels,
  type FrameSpec,
  type Observation,
  type PropView,
  type StoredState,
} from "./vocabulary";
export { SEP, joinPath, namesOf, pathOf, segment } from "./address";
export {
  changesBetween,
  seenBetween,
  nodeAt,
  type Change,
  type BoardSnapshot,
  type BoundSnapshot,
  type CanSnapshot,
  type NodeSnapshot,
  type PartSnapshot,
} from "./snapshot";
export { Color, cssColor } from "@chalk/look";
export { colorSchema } from "./color";
export {
  AnswerStatus,
  QuestionAction,
  checkedFields,
  questionDefaults,
  questionFields,
  QuestionSignal,
  type CheckedPayload,
  type QuestionView,
} from "./question";
export {
  DEFAULT_SIZE,
  PHONE_COLUMN,
  type Size,
  SizeFit,
  sizeOf,
  layoutWidthFor,
  zoomFor,
} from "./size";
export {
  describe,
  does,
  inputName,
  says,
  shows,
  tagFrom,
  tagsInMarkup,
  tagsOf,
  type InputTags,
  type Key,
  type ShownTags,
  type Tag,
} from "./tags";
export type { Unchecked } from "./unchecked";
export {
  action,
  Ease,
  prop,
  SCREEN,
  signal,
  type ActionDef,
  type ActionsOf,
  type ChildrenOf,
  type FactsOf,
  type Me,
  type NeedsOf,
  type PayloadOf,
  type SignalsOf,
  type VarsOf,
  type AnyProp,
  type HeardPaths,
  type Out,
  type Outs,
  type Payload,
  type Prop,
  type PropSpec,
  type ReaderOf,
  type Rule,
  type SignalDef,
  type Cause,
  type Tools,
  type VoiceTools,
} from "./define";
export { Board, type BoardEvent, type Given, type Input } from "./board";
export { sequence } from "./helpers";
export { moveAt, type Move } from "./move";
export { TimeQueue, type Entry } from "./queue";
export {
  estimatedSeconds,
  type Heard,
  type LineCall,
  silentVoice,
  timedVoice,
  type Voice,
} from "./voice";
export { type GroupLayoutSpec, IN_PICTURE, Place, shownOf, withShown } from "./layout";
