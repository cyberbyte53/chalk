import type { SoundView } from "@chalk/player";
import { appear, blocked, step, win } from "@chalk/sounds";

/**
 * How the coordinate plane sounds (platform/docs/sound.md), beside how it looks, from the sound
 * library: a step as the walker or a counter moves, a bump when it can't, something appearing as a
 * line rises or a point lands, a fanfare when the game is won. Its model knows nothing of sound.
 */
export const coordinatePlaneSound: SoundView = {
  cues: {
    "walker.stepped": step,
    "walker.blocked": blocked,
    "plane.risen": appear,
    "plotting.plotted": appear,
    "dice.counterMoved": step,
    "dice.won": win,
  },
  // A win is said: the words after it wait for it. The rest is the sound of things moving.
  inTurn: ["dice.won"],
};
