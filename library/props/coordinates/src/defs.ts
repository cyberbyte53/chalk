import type { SoundView } from "@chalk/player";
import { type AnyPropDef, asAnyProp } from "@chalk/prop";
import { coordinatePlane } from "./coordinate-plane";
import { coordinatePlane as sceneCoordinatePlane } from "./scene/coordinate-plane";
import { coordinatePlaneSound } from "./scene/sound";

/**
 * Every prop this package defines, without its drawing code: what the app needs up front (to run
 * boards, check answers, let Jugnu act).
 */
export const defs: readonly AnyPropDef[] = [
  asAnyProp(coordinatePlane),
  // On the event model (scene/); erased the same way until today's props are gone.
  sceneCoordinatePlane as unknown as AnyPropDef,
];

/** How its props sound, by type: with the definitions, before any drawing loads. */
export const sounds: Readonly<Record<string, SoundView>> = {
  [sceneCoordinatePlane.type]: coordinatePlaneSound,
};

export { coordinatePlane };
