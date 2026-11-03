/**
 * How a board is heard (platform/docs/sound.md, one-clock.md). The board asks the voice to say a
 * line, by its name, or to stop. The voice says how long the line will take (its clips', or an
 * estimate), and tells back when it ended (or that it lost it). The board never knows where the sound
 * comes from (a clip, a server, the phone's own voice); it ends the line itself at its length + GRACE
 * if the voice never tells.
 */
/** A line asked of the voice: its name, and the values of its moment for the blanks in its words. */
export type LineCall = {
  readonly name: string;
  readonly values?: Readonly<Record<string, unknown>>;
};

export type Voice = {
  /**
   * Says `line` (the board has stopped any line before it), and returns how long it will take, in
   * seconds; undefined for a line with nothing to say (it is over at once). Then tells `hear`
   * "ended" when it is over, or "cut" if the voice lost it on its own (its source failed and
   * nothing could stand in). A voice that is off tells "ended" while asked to say it: the line
   * is over the moment it starts, recorded so (a replay ends it then too).
   */
  say: (line: LineCall, hear: (what: Heard) => void) => number | undefined;
  /** Stops the line being said. The board has already taken it as cut: nothing more is told of it. */
  stop: () => void;
};

export type Heard = "ended" | "cut";

/** Words a second a voice says, roughly: for a line with no audio of its own. */
const WORDS_PER_SECOND = 2.5;

/** How long words would take to say, when there is no audio to measure (the breath is the board's). */
export function estimatedSeconds(text: string): number {
  return text.split(/\s+/).filter((w) => w !== "").length / WORDS_PER_SECOND;
}

/** A board with no voice: every line has nothing to say, and ends at once. */
export const silentVoice: Voice = { say: () => undefined, stop: () => undefined };

/**
 * A voice that keeps time on the board's own clock: each line lasts as long as `lengthOf` says
 * (undefined: it has nothing to say, and ends at once), and it tells the line ended then. What a
 * tool, a check or a test hears in place of a phone's sound: the same events, its clock may jump.
 */
export function timedVoice(
  clock: { after: (seconds: number, fn: () => void) => void },
  lengthOf: (line: LineCall) => number | undefined,
): Voice {
  let current: object | undefined;
  return {
    say: (line, hear) => {
      const seconds = lengthOf(line);
      if (seconds === undefined) return undefined;
      const mine = {};
      current = mine;
      clock.after(seconds, () => {
        if (current !== mine) return;
        current = undefined;
        hear("ended");
      });
      return seconds;
    },
    stop: () => {
      current = undefined;
    },
  };
}
