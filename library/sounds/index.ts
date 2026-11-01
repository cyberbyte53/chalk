import { sound } from "@chalk/content";

/**
 * The sound library (platform/docs/sound.md): written from sounds.json by `pnpm sound`; don't edit.
 * Each sound is a role (right, step) any prop's sound view or lesson's cue uses by importing it; the
 * recording behind it changes with `pnpm sound add <name> freesound:<id>`, everywhere at once.
 */

/** Something appearing: a street rising from the road, a point landing. */
export const appear = sound("appear", new URL("./sounds/appear.mp3", import.meta.url), 0.33);
/** A move that can't be made: the bus at the end of the road. */
export const blocked = sound("blocked", new URL("./sounds/blocked.mp3", import.meta.url), 0.724);
/** An answer checked right. */
export const right = sound("right", new URL("./sounds/right.mp3", import.meta.url), 1.056);
/** A thing taking one step: the bus moving a stop, Riya walking. */
export const step = sound("step", new URL("./sounds/step.mp3", import.meta.url), 0.467);
/** Something pressed or chosen. */
export const tap = sound("tap", new URL("./sounds/tap.mp3", import.meta.url), 0.123);
/** A game won, a lesson finished. */
export const win = sound("win", new URL("./sounds/win.mp3", import.meta.url), 4.437);
/** An answer checked wrong. */
export const wrong = sound("wrong", new URL("./sounds/wrong.mp3", import.meta.url), 0.309);
