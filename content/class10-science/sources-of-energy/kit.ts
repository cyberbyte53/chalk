import type { BoardKit, PlacedOf } from "@chalk/author";
import { type EnergyScene, energySceneDef } from "@chalk/prop-energy";

/** A story picture, never interactive. */
export function sceneOn(
  b: BoardKit,
  name: string,
  scene: EnergyScene,
  standsFor: string,
): PlacedOf<typeof energySceneDef> {
  const s = b.prop(energySceneDef, name, { scene });
  b.standsFor(s, standsFor);
  return s;
}
