import { PlayMode } from "@chalk/content";
import { createContext } from "preact";
import { useContext } from "preact/hooks";

/** How a board is played: in `@chalk/content`, as the record says it. */
export { PlayMode };

export type ModePolicy = {
  /** A wrong answer can be tried again (else it locks and Continue shows). */
  canRetry: boolean;
  /** The banner's word after a wrong answer. */
  wrongWord: "notQuite" | "incorrect" | "letsReview";
  /** Jugnu is there to help (his figure in the bar; Get help on a wrong answer): all but a test. */
  hasJugnu: boolean;
};

export const modePolicy: Readonly<Record<PlayMode, ModePolicy>> = {
  [PlayMode.Lesson]: { canRetry: true, wrongWord: "notQuite", hasJugnu: true },
  [PlayMode.Guided]: { canRetry: true, wrongWord: "notQuite", hasJugnu: true },
  [PlayMode.SkillCheck]: {
    canRetry: false,
    wrongWord: "incorrect",
    hasJugnu: false,
  },
  [PlayMode.Review]: { canRetry: true, wrongWord: "letsReview", hasJugnu: true },
};

/**
 * The mode the board is played in, for question views: undefined when a board plays without one
 * (an author's review of every board), and then a question shows its own note under it as before.
 */
export const PlayModeContext = createContext<PlayMode | undefined>(undefined);

export function usePlayMode(): PlayMode | undefined {
  return useContext(PlayModeContext);
}
