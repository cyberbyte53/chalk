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
};

export const modePolicy: Readonly<Record<PlayMode, ModePolicy>> = {
  [PlayMode.Lesson]: { canRetry: true, wrongWord: "notQuite" },
  [PlayMode.Guided]: { canRetry: true, wrongWord: "notQuite" },
  [PlayMode.SkillCheck]: {
    canRetry: false,
    wrongWord: "incorrect",
  },
  [PlayMode.Review]: { canRetry: true, wrongWord: "letsReview" },
};

/**
 * The mode the board is played in, for question views: undefined when a board plays without one
 * (an author's review of every board), and then a question shows its own note under it as before.
 */
export const PlayModeContext = createContext<PlayMode | undefined>(undefined);

export function usePlayMode(): PlayMode | undefined {
  return useContext(PlayModeContext);
}
