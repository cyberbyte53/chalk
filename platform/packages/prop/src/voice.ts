/**
 * How a board is heard (platform/docs/sound.md). The board asks the voice to say a line, by its
 * name, or to stop; the voice tells back what happened to it: started, then ended or cut. The board
 * never knows how long a line is, nor where its sound comes from (a clip, a server, the phone's own
 * voice): it waits for the voice's word, as for any other event.
 */
/** A line asked of the voice: its name, and the values of its moment for the blanks in its words. */
export type LineCall = {
  readonly name: string;
  readonly values?: Readonly<Record<string, unknown>>;
};

export type Voice = {
  /**
   * Says `line` (the board has stopped any line before it). Tells `hear` "started" when sound
   * begins (never, for a line with nothing to say), then "ended" when it is over, or "cut" if the
   * voice lost it on its own (its source failed and nothing could stand in).
   */
  say: (line: LineCall, hear: (what: Heard) => void) => void;
  /** Stops the line being said. The board has already taken it as cut: nothing more is told of it. */
  stop: () => void;
};

export type Heard = "started" | "ended" | "cut";

/** Words a second a voice says, roughly: for a line with no audio of its own. */
const WORDS_PER_SECOND = 2.5;

/** How long words would take to say, when there is no audio to measure (the breath is the board's). */
export function estimatedSeconds(text: string): number {
  return text.split(/\s+/).filter((w) => w !== "").length / WORDS_PER_SECOND;
}

/** A board with no voice: every line has nothing to say, and ends at once. */
export const silentVoice: Voice = { say: (_, hear) => hear("ended"), stop: () => undefined };

/**
 * A voice that keeps time on the board's own clock: each line lasts as long as `lengthOf` says
 * (undefined: it has nothing to say, and ends at once). What a check, a test or a muted student
 * hears: the board's pacing is the same, its clock may jump.
 */
export function timedVoice(
  clock: { after: (seconds: number, fn: () => void) => void },
  lengthOf: (line: LineCall) => number | undefined,
): Voice {
  let current: object | undefined;
  return {
    say: (line, hear) => {
      const seconds = lengthOf(line);
      if (seconds === undefined) return hear("ended");
      const mine = {};
      current = mine;
      hear("started");
      clock.after(seconds, () => {
        if (current !== mine) return;
        current = undefined;
        hear("ended");
      });
    },
    stop: () => {
      current = undefined;
    },
  };
}
