import { effect } from "@chalk/content";

/**
 * The sound library (platform/docs/sound.md): short recordings any prop's sound view or any lesson
 * uses, by importing them. Each is listed in sounds.json with what it is for, where it came from
 * and its licence; `pnpm sound add` adds one here and there. A recording is fetched only when
 * something that uses it plays it, then kept.
 */

/** A thing taking one step: the bus moving a stop, Riya walking. */
export const step = effect("step", new URL("./sounds/step.mp3", import.meta.url));
/** Something pressed or chosen. */
export const tap = effect("tap", new URL("./sounds/tap.mp3", import.meta.url));
/** Something rising or appearing: a street rising from the road. */
export const rise = effect("rise", new URL("./sounds/rise.mp3", import.meta.url));
