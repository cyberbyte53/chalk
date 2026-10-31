/**
 * How a board is heard (platform/docs/sound.md). The board asks the voice to say a line, by its
 * name, or to stop; the voice tells back what happened to it: started, then ended or cut. The board
 * never knows how long a line is, nor where its sound comes from (a clip, a server, the phone's own
 * voice): it waits for the voice's word, as for any other event.
 */
export type Voice = {
  /**
   * Says `line` (the board has stopped any line before it). Tells `hear` "started" when sound
   * begins (never, for a line with nothing to say), then exactly one of "ended" or "cut".
   */
  say: (line: string, hear: (what: Heard) => void) => void;
  /** Stops the line being said (the board takes it as cut). */
  stop: () => void;
};

export type Heard = "started" | "ended" | "cut";

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
export const silentVoice: Voice = { say: (_, hear) => hear("ended"), stop: () => undefined };

/**
 * A voice that keeps time on the board's own clock: each line lasts as long as `lengthOf` says
 * (undefined: it has nothing to say, and ends at once). What a check, a test or a muted student
 * hears: the board's pacing is the same, its clock may jump.
 */
export function timedVoice(
  clock: { after: (seconds: number, fn: () => void) => void },
  lengthOf: (line: string) => number | undefined,
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
