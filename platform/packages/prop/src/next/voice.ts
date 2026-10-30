import type { Spoken } from "../define";

/**
 * How a board speaks: a line starts, and how long it plays. The player plays the line's audio and
 * knows its length from publish (each file's seconds); without audio (a check, a test, a failed
 * file) the length is worked out from the words. A line is a "later" like any other.
 */
export type Voice = {
  /** Starts saying `line` (the prop at `path`). */
  start: (path: string, line: Spoken) => void;
  /** How long `line` plays, in seconds. */
  seconds: (path: string, line: Spoken) => number;
};

/** Words a second a voice says, roughly: for a line with no audio. */
const WORDS_PER_SECOND = 2.5;
/** A short breath before and after any line. */
const LINE_PAUSE = 0.4;

/** How long a line would take to say, from its words, when there is no audio to measure. */
export function estimatedSeconds(text: string): number {
  const words = text.split(/\s+/).filter((w) => w !== "").length;
  return LINE_PAUSE + words / WORDS_PER_SECOND;
}

/** No audio: nothing plays, and each line takes as long as its English words would. */
export const silentVoice: Voice = {
  start: () => undefined,
  seconds: (_, line) => estimatedSeconds(line.speak?.en ?? line.say.en ?? ""),
};
