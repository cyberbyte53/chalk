import type { SoundView } from "@chalk/player";

/**
 * A part's own sounds, by its signals' names (`stepped`), and those whose sound takes a turn
 * (`inTurn`: the words after it wait for it). The plane's sound (sound.ts) is every part's, each
 * signal named under its part.
 */
export type PartSound = { cues: NonNullable<SoundView["cues"]>; inTurn?: readonly string[] };
