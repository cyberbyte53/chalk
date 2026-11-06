import type { SoundView } from "@chalk/player";
import type { AnyProp } from "@chalk/prop";
import { classroom } from "./classroom";
import { classroomSound } from "./sound";

/** Every prop this package defines, without its drawing code: what the app needs up front. */
export const defs: readonly AnyProp[] = [classroom];

/** How its props sound, by type: with the definitions, before any drawing loads. */
export const sounds: Readonly<Record<string, SoundView>> = {
  [classroom.type]: classroomSound,
};
