import type { SoundView } from "@chalk/player";

/**
 * A piece's own sounds, by its signals' names (`stepped`), and those whose sound takes a turn
 * (`inTurn`: the words after it wait for it). The plane's sound (sound.ts) is every piece's, each
 * signal named under its piece.
 */
export type PieceSound = { cues: NonNullable<SoundView["cues"]>; inTurn?: readonly string[] };
