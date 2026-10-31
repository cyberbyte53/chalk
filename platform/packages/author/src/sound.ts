import type { Localized, Sound } from "@chalk/content";
import { z } from "zod";

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

/*
 * The two rules (platform/docs/sound.md), over the board's queue of lines: the first is being said,
 * the rest wait. 1. The board talks in turn. 2. When the student acts, the board stops and responds.
 */

/** A line in the board's queue, with the step that brought it. */
export const queuedSchema = z
  .object({
    line: z.string().min(1),
    step: z.number(),
    /** The values of its moment, for the blanks in its words. */
    values: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();
export type Queued = z.infer<typeof queuedSchema>;

/**
 * A line comes due. What the student caused, in a step of theirs, cuts in: the line being said is
 * cut, everything waiting is dropped (the opening's reads too), and it is said now. Else it waits
 * its turn, or is said now if nothing is. `say`: the line to start now, if any.
 */
export function lineDue(
  saying: readonly Queued[],
  line: Queued,
  byStudent: boolean,
): { saying: Queued[]; say?: Queued; isCut: boolean } {
  const head = saying[0];
  if (byStudent && head?.step !== line.step) return { saying: [line], say: line, isCut: true };
  if (head === undefined) return { saying: [line], say: line, isCut: false };
  return { saying: [...saying, line], isCut: false };
}

/**
 * A line is done, heard or cut. The one being said leaves the queue, and the next is said;
 * undefined when it wasn't the one being said (it was cut and replaced: the queue is the new one's).
 */
export function lineEnded(
  saying: readonly Queued[],
  line: string,
  step: number,
): { saying: Queued[]; next?: Queued } | undefined {
  const head = saying[0];
  if (head?.line !== line || head.step !== step) return undefined;
  const rest = saying.slice(1);
  return rest[0] === undefined ? { saying: rest } : { saying: rest, next: rest[0] };
}

/** A piece hidden: its lines leave the queue; if it was being said, it is cut and the next said. */
export function pieceHidden(
  saying: readonly Queued[],
  piece: string,
): { saying: Queued[]; isCut: boolean; next?: Queued } {
  const rest = saying.filter((q) => q.line !== piece);
  const isCut = saying[0]?.line === piece;
  return isCut && rest[0] !== undefined
    ? { saying: rest, isCut, next: rest[0] }
    : { saying: rest, isCut };
}
