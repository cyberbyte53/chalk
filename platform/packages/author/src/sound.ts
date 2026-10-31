import type { Localized, Sound } from "@chalk/content";

/**
 * A cue (platform/docs/sound.md): when a moment comes, play something. Its moment is written with
 * it as data, so every view shows exactly what runs: `when` a piece's signal is told (or the
 * board's own, `board.started`), `where` it carries these values (`town.walker.arrived · x 4, y 5`).
 *
 * - **Words** (narration, a character's line): said by a speaker, taking their turn (the two rules).
 *   Without a moment, a rule says them (`t.self.say`). `about`: the piece they are about, which
 *   glows while they play.
 * - **A sound** (from the sound library): played alongside anything, at once; with `until`, it lasts
 *   (looping) until that moment, or the board's end. A sound cue at a signal replaces the props' own
 *   there; `cue(null, { when })` only silences them.
 *
 * A piece's own words are its cue too, written on the piece (`says`), beside what it shows.
 */
export type Cue = WordsCue | SoundCue;

/** Its moment: a piece's signal, by path ("town.walker.arrived"), and the values it must carry. */
type Moment = {
  readonly when?: string;
  /** Which of those moments: the values the signal must carry (`{ x: 4, y: 5 }`). */
  readonly where?: Readonly<Record<string, unknown>>;
};

/** Words, said by a speaker in their turn. */
export type WordsCue = Moment & {
  readonly says: Localized;
  readonly speaker?: string;
  /**
   * Which of those moments, when values can't say it (it depends on the board as it is): code,
   * which the script can only show as a condition in code. Prefer `where`.
   */
  readonly if?: (
    payload: Readonly<Record<string, unknown>>,
    me: Readonly<Record<string, unknown>>,
  ) => boolean;
  readonly about?: string;
};

/** A sound (null: silence the props' own at `when`), played alongside; with `until`, it lasts. */
export type SoundCue = Moment & {
  readonly sound: Sound | null;
  /** A sound that lasts: the moment it stops. */
  readonly until?: string;
};

const isSound = (what: unknown): what is Sound =>
  typeof (what as Sound | undefined)?.url === "string";

/**
 * A cue: `cues: { finally: cue(t("Finally, I'm here!", "…"), { speaker: "riya", when: "…" }) }`,
 * `cue(step, { when: "line.walker.stepped" })`, `cue(rain, { when: "board.started", until: "board.passed" })`.
 */
export function cue(words: Localized, options?: Omit<WordsCue, "says">): WordsCue;
export function cue(sound: Sound | null, options?: Omit<SoundCue, "sound">): SoundCue;
export function cue(
  what: Localized | Sound | null,
  options: Omit<WordsCue, "says"> | Omit<SoundCue, "sound"> = {},
): Cue {
  return what === null || isSound(what)
    ? { sound: what, ...options }
    : ({ says: what, ...options } as WordsCue);
}

/** What a cue was given that its kind doesn't have (a sound with a speaker, words that last). */
export const NOT_FOR_SOUNDS = ["says", "speaker", "about", "if"] as const;
