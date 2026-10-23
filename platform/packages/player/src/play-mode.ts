import { createContext } from "preact";
import { useContext } from "preact/hooks";

/**
 * How a board is played. A question is only content (prompt, interaction, answer); the mode
 * decides what happens around it: whether Jugnu is there, whether a wrong answer can be tried
 * again, and what the banner under the board says. The same question plays in every mode.
 * See plans/play-modes.md.
 */
export const PlayMode = {
  /** A question inside a lesson's pages. */
  Lesson: "lesson",
  /** Practice after a lesson: Jugnu any time, try again until right. */
  Guided: "guided",
  /** A test: no Jugnu, one try, only right or wrong. */
  SkillCheck: "skillCheck",
  /** A skill check's mistakes again, with Jugnu. */
  Review: "review",
} as const;
export type PlayMode = (typeof PlayMode)[keyof typeof PlayMode];

export type ModePolicy = {
  hasJugnu: boolean;
  /** A wrong answer can be tried again (else it locks and Continue shows). */
  canRetry: boolean;
  /** "Why?" after a right answer (asks Jugnu). */
  hasWhy: boolean;
  /** The banner's word after a wrong answer. */
  wrongWord: "notQuite" | "incorrect" | "letsReview";
};

export const modePolicy: Readonly<Record<PlayMode, ModePolicy>> = {
  [PlayMode.Lesson]: { hasJugnu: true, canRetry: true, hasWhy: true, wrongWord: "notQuite" },
  [PlayMode.Guided]: { hasJugnu: true, canRetry: true, hasWhy: true, wrongWord: "notQuite" },
  [PlayMode.SkillCheck]: {
    hasJugnu: false,
    canRetry: false,
    hasWhy: false,
    wrongWord: "incorrect",
  },
  [PlayMode.Review]: { hasJugnu: true, canRetry: true, hasWhy: true, wrongWord: "letsReview" },
};

/**
 * The mode the board is played in, for question views: undefined when a board plays without one
 * (an author's review of every board), and then a question shows its own note under it as before.
 */
export const PlayModeContext = createContext<PlayMode | undefined>(undefined);

export function usePlayMode(): PlayMode | undefined {
  return useContext(PlayModeContext);
}
