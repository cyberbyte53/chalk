import type { SoundView } from "@chalk/player";
import { tap } from "@chalk/sounds";

/**
 * How the classroom sounds (platform/docs/sound.md): a soft tap as a child the student turns to
 * looks up. Its board actions are silent, so a voice can speak over them. Its model knows nothing
 * of sound.
 */
export const classroomSound: SoundView = {
  cues: {
    helped: tap,
  },
};
