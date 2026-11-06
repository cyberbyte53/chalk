import type { SoundView } from "@chalk/player";
import { appear } from "@chalk/sounds";

/**
 * How the pea cross sounds (platform/docs/sound.md): something appearing as each child grows.
 * Its model knows nothing of sound.
 */
export const peaCrossSound: SoundView = {
  cues: {
    sprouted: appear,
  },
};
