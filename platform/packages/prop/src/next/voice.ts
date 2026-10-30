/**
 * How a board is heard: the host (the player, a check, a test) says a line by its name and says
 * how long it plays, so the board can wait for it (a "later" of that length). Where the words and
 * the audio come from (a clip made in advance, the phone's own voice) is the host's: the board only
 * knows lines by name and their length. platform/docs/sound.md.
 */
export type Voice = {
  /** Starts saying `line` (cutting any line being said); how long it plays, or undefined: nothing to say. */
  say: (line: string) => number | undefined;
  /** Stops the line being said. */
  hush: () => void;
};

/** Words a second a voice says, roughly: for a line with no audio of its own. */
const WORDS_PER_SECOND = 2.5;
/** A short breath before and after any line. */
const LINE_PAUSE = 0.4;

/** How long words would take to say, when there is no audio to measure. */
export function estimatedSeconds(text: string): number {
  const words = text.split(/\s+/).filter((w) => w !== "").length;
  return LINE_PAUSE + words / WORDS_PER_SECOND;
}

/** A board with no voice: every line has nothing to say, and ends at once. */
export const silentVoice: Voice = { say: () => undefined, hush: () => undefined };
