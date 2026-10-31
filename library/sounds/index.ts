import { effect } from "@chalk/content";

/**
 * The sound library (platform/docs/sound.md): written from sounds.json by `pnpm sound`; don't edit.
 * Each sound is a role (right, step) any prop's sound view or lesson's cue uses by importing it; the
 * recording behind it changes with `pnpm sound add <name> freesound:<id>`, everywhere at once.
 */

/** Something appearing: a street rising from the road, a point landing. */
export const appear = effect("appear", new URL("./sounds/appear.mp3", import.meta.url));
/** A move that can't be made: the bus at the end of the road. */
export const blocked = effect("blocked", new URL("./sounds/blocked.mp3", import.meta.url));
/** An answer checked right. */
export const right = effect("right", new URL("./sounds/right.mp3", import.meta.url));
/** A thing taking one step: the bus moving a stop, Riya walking. */
export const step = effect("step", new URL("./sounds/step.mp3", import.meta.url));
/** Something pressed or chosen. */
export const tap = effect("tap", new URL("./sounds/tap.mp3", import.meta.url));
/** A game won, a lesson finished. */
export const win = effect("win", new URL("./sounds/win.mp3", import.meta.url));
/** An answer checked wrong. */
export const wrong = effect("wrong", new URL("./sounds/wrong.mp3", import.meta.url));
