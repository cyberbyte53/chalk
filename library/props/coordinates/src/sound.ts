import type { SoundView } from "@chalk/player";
import type { PieceSound } from "./piece-sound";
import { planeSound } from "./plane-sound";
import { SOUNDS } from "./sounds";

/**
 * How the coordinate plane sounds (platform/docs/sound.md), beside how it looks, from the sound
 * library: the plane's own sounds and each piece's (sounds.ts), each signal named under its piece
 * ("walker.stepped"). Its model knows nothing of sound.
 */
const all: Readonly<Record<string, PieceSound>> = { plane: planeSound, ...SOUNDS };

export const coordinatePlaneSound: SoundView = {
  cues: Object.fromEntries(
    Object.entries(all).flatMap(([piece, s]) =>
      Object.entries(s.cues).map(([signal, cue]) => [`${piece}.${signal}`, cue]),
    ),
  ),
  inTurn: Object.entries(all).flatMap(([piece, s]) =>
    (s.inTurn ?? []).map((signal) => `${piece}.${signal}`),
  ),
};
