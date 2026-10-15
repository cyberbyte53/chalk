export { BoardPlayer, type BoardPlayerProps } from "./board-player";
export { AnswerFeedback } from "./answer-feedback";
export { RichText } from "./rich-text-view";
export { type Parsed, type Span, SpanKind, mathHtml, parseRich, richProblems } from "./rich-text";
export { LessonPlayer, type LessonPlayerProps } from "./lesson-player";
export type { AudioSource } from "./narration";
export type { PropModule, PropRegistry, PropViewProps } from "./prop-module";
export { propRecords } from "./records";
export {
  type ActionRecord,
  type BoardSnapshot,
  BoardRuntime,
  type RuntimeServices,
  type SignalRecord,
} from "./runtime";
export { t, UiText, type UiTextKey } from "./ui-text";
