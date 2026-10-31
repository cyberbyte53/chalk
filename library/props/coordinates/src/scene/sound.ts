import type { SoundView } from "@chalk/player";
import { rise, step } from "@chalk/sounds";

/**
 * How the coordinate plane sounds (platform/docs/sound.md), beside how it looks: a step for each
 * step the walker takes, a rise as a line rises from the axis (both from the sound library). Its
 * model knows nothing of sound.
 */
export const coordinatePlaneSound: SoundView = {
  effects: { "walker.stepped": step, "plane.risen": rise },
};
