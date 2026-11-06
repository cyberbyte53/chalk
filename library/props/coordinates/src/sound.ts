import type { SoundView } from "@chalk/player";
import type { PartSound } from "./part-sound";
import { planeSound } from "./plane-sound";
import { SOUNDS } from "./sounds";

/**
 * How the coordinate plane sounds (platform/docs/sound.md), beside how it looks, from the sound
 * library: the plane's own sounds and each part's (sounds.ts), each signal named under its part
 * ("walker.stepped"). Its model knows nothing of sound.
 */
const all: Readonly<Record<string, PartSound>> = { plane: planeSound, ...SOUNDS };

export const coordinatePlaneSound: SoundView = {
  cues: Object.fromEntries(
    Object.entries(all).flatMap(([part, s]) =>
      Object.entries(s.cues).map(([signal, cue]) => [`${part}.${signal}`, cue]),
    ),
  ),
  inTurn: Object.entries(all).flatMap(([part, s]) =>
    (s.inTurn ?? []).map((signal) => `${part}.${signal}`),
  ),
};
