import type { BoardKit, PlacedOf } from "@chalk/author";
import { type MagnetismScene, magnetismSceneDef } from "@chalk/prop-magnetism";

/** A story picture, never interactive. */
export function sceneOn(
  b: BoardKit,
  name: string,
  scene: MagnetismScene,
  standsFor: string,
): PlacedOf<typeof magnetismSceneDef> {
  const s = b.prop(magnetismSceneDef, name, { scene });
  b.standsFor(s, standsFor);
  return s;
}
