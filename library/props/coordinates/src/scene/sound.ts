import { Effect } from "@chalk/content";
import type { SoundView } from "@chalk/player";

/**
 * How the coordinate plane sounds (platform/docs/sound.md), beside how it looks: the walker's
 * footstep each step it takes, a line rising from the axis. Its model knows nothing of sound.
 */
export const coordinatePlaneSound: SoundView = {
  effects: { "walker.stepped": Effect.Step, "plane.risen": Effect.Rise },
};
