import type { Actor } from "@chalk/content";
import type { WordsToSay } from "./sound/voice";

/** What a board runs with, and what it records (the recorder reads them): the event model's. */

/** What the runtime needs from outside: the voice and the screen's frames. Fakes in tests. */
export type RuntimeServices = {
  /** Says a line; resolves when it ends or fails (the text stays on screen either way). */
  speak: (line: WordsToSay) => Promise<void>;
  /** Calls back on the next frame with the time in ms; returns a function that cancels it. */
  frame: (callback: (now: number) => void) => () => void;
  now: () => number;
  /** Something in the content broke while playing. The board carries on. */
  onError: (message: string, error?: unknown) => void;
};

/**
 * An action someone asked for, and whether the board took it. Every action and signal on a board
 * is numbered (`n`) in the order it happened, and says what set it off, so a record can link a
 * consequence to its cause.
 */
export type ActionRecord = {
  n: number;
  prop: string;
  action: string;
  args: unknown;
  actor: Actor;
  /**
   * What set it off: the `n` of the act (an action asked directly, or a signal a view raised)
   * whose consequence this is, through the lesson's rules. Undefined: it was asked directly.
   */
  cause?: number;
  /** The lesson's own rules asked it (the scene's), not the student and not a prop's own wiring. */
  isLessons?: true;
  /** A step of an effect already running on the prop (a tween's tick, its own `call`), not an act. */
  isStep: boolean;
  /** When, on the board's clock (seconds, not counting pauses). */
  t: number;
  /** Why it was refused; absent when the board took it. */
  refused?: string;
};

/** A signal as the runtime saw it: which prop, what, with what, and who caused it. */
export type SignalRecord = {
  n: number;
  prop: string;
  signal: string;
  payload: Readonly<Record<string, unknown>>;
  actor: Actor;
  /**
   * The `n` of the act that set it off (an action asked directly, whatever rules ran between).
   * Undefined: nothing did; a view raised it (it is an act itself), or the board started.
   */
  from?: number;
};
