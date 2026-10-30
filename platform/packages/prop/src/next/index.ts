/**
 * The event model (platform/docs/event-model.md), built beside today's props until they move over:
 * one building block (`prop`), actions in and signals out, needs, one queue for later, the board.
 */
export {
  action,
  Ease,
  prop,
  SCREEN,
  signal,
  type ActionDef,
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
  type Tools,
} from "./define";
export { Board, type Given, type Input } from "./board";
export { sequence } from "./helpers";
export { moveAt, type Move } from "./move";
export { TimeQueue, type Entry } from "./queue";
